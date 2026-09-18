import { prisma } from "../prisma";
import { ApiError } from "../utils/errors";
import { computeLiveAvailability } from "../utils/availability";
import { cached } from "../utils/cache";
import { relocateImages } from "./storage";
import type { HostelCreate, HostelDTO, HostelUpdate } from "../types";

async function resolveFacilities(keys: string[]) {
  if (!keys.length) return [];
  const unique = Array.from(new Set(keys.map((k) => k.trim().toLowerCase())));
  return Promise.all(
    unique.map((key) =>
      prisma.facility.upsert({
        where: { key },
        update: {},
        create: { key, label: key },
      }),
    ),
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "hostel";
}

async function generateUniqueSlug(name: string, existingId?: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let index = 1;

  while (true) {
    const match = await prisma.hostel.findUnique({ where: { slug: candidate } });
    if (!match || (existingId && match.id === existingId)) return candidate;
    candidate = `${base}-${index}`;
    index += 1;
  }
}

function toDTO(
  h: {
    id: string;
    slug: string;
    name: string;
    location: string;
    pricePerYear: number | null;
    roomType: string | null;
    totalRooms: number | null;
    address: string | null;
    landmark: string | null;
    availability: "Available" | "Limited" | "Full" | null;
    verified: boolean;
    verifiedAt: Date | null;
    lastCheckedAt: Date | null;
    image: string;
    photos: string[];
    note: string | null;
    distanceFromSTU: number | null;
    latitude: number | null;
    longitude: number | null;
    ownerId: string | null;
    createdAt: Date;
    facilities?: { key: string }[];
    roomOfferings?: Array<{
      id: string;
      roomType: string;
      price: number;
      pricingPeriod: "AcademicYear" | "Semester" | "Month";
      bedsPerRoom: number | null;
      totalRooms: number | null;
      availableRooms: number | null;
      availability: "Available" | "Limited" | "Full";
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
  },
  activeBeds = 0,
): HostelDTO {
  const live = computeLiveAvailability(
    {
      roomType: h.roomType ?? "1-in-1",
      totalRooms: h.totalRooms ?? 1,
      availability: h.availability ?? "Available",
    },
    activeBeds,
  );
  const roomOfferings = (h.roomOfferings ?? []).map((room) => ({
    id: room.id,
    hostelId: h.id,
    roomType: room.roomType,
    price: room.price,
    pricingPeriod: room.pricingPeriod,
    bedsPerRoom: room.bedsPerRoom ?? undefined,
    totalRooms: room.totalRooms ?? undefined,
    availableRooms: room.availableRooms ?? undefined,
    availability: room.availability,
    description: room.description ?? undefined,
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  }));

  return {
    id: h.id,
    slug: h.slug,
    name: h.name,
    location: h.location,
    address: h.address ?? undefined,
    landmark: h.landmark ?? undefined,
    pricePerYear: h.pricePerYear ?? roomOfferings[0]?.price ?? 0,
    roomType: h.roomType ?? roomOfferings[0]?.roomType ?? "1-in-1",
    totalRooms: h.totalRooms ?? roomOfferings[0]?.totalRooms ?? undefined,
    availability: live.availability,
    verified: h.verified,
    image: h.image,
    photos: h.photos ?? [],
    note: h.note ?? undefined,
    distanceFromSTU: h.distanceFromSTU ?? undefined,
    latitude: h.latitude ?? undefined,
    longitude: h.longitude ?? undefined,
    facilities: (h.facilities ?? []).map((f) => f.key),
    roomOfferings,
    ownerId: h.ownerId ?? undefined,
    verifiedAt: h.verifiedAt?.toISOString(),
    lastCheckedAt: h.lastCheckedAt?.toISOString(),
    createdAt: h.createdAt.toISOString(),
    totalBeds: live.totalBeds,
    availableBeds: live.availableBeds,
  };
}

export async function listHostels(): Promise<HostelDTO[]> {
  return cached("hostels:list", 30_000, async () => {
    const hostels = await prisma.hostel.findMany({
    include: { facilities: true, roomOfferings: true },
    orderBy: { name: "asc" },
  });
  const active = await prisma.tenancy.findMany({
    where: { status: "Active" },
    select: { hostelId: true, beds: true },
  });
  const bedsByHostel = new Map<string, number>();
  for (const t of active) {
    if (!t.hostelId) continue;
    bedsByHostel.set(t.hostelId, (bedsByHostel.get(t.hostelId) ?? 0) + (t.beds ?? 0));
  }
  return hostels.map((h) => toDTO(h, bedsByHostel.get(h.id) ?? 0));
  });
}

export async function getHostel(id: string): Promise<HostelDTO> {
  const hostel = await prisma.hostel.findUnique({
    where: { id },
    include: { facilities: true, roomOfferings: true },
  });
  if (!hostel) throw new ApiError(404, "Hostel not found");
  const active = await prisma.tenancy.findMany({
    where: { hostelId: id, status: "Active" },
    select: { beds: true },
  });
  const activeBeds = active.reduce((sum, t) => sum + (t.beds ?? 0), 0);
  return toDTO(hostel, activeBeds);
}

export async function createHostel(input: HostelCreate): Promise<HostelDTO> {
  const facilities = await resolveFacilities(input.facilities ?? []);
  const slug = await generateUniqueSlug(input.slug ?? input.name, undefined);
  const hostel = await prisma.hostel.create({
    data: {
      slug,
      name: input.name,
      location: input.location,
      pricePerYear: input.pricePerYear,
      roomType: input.roomType,
      totalRooms: input.totalRooms,
      availability: input.availability,
      verified: input.verified,
      image: input.image,
      photos: input.photos ?? [],
      note: input.note,
      distanceFromSTU: input.distanceFromSTU,
      latitude: input.latitude,
      longitude: input.longitude,
      ownerId: input.ownerId,
      facilities: { connect: facilities.map((f) => ({ id: f.id })) },
    },
    include: { facilities: true, roomOfferings: true },
  });

  const roomOfferings = input.roomOfferings ?? [];
  if (roomOfferings.length) {
    await prisma.roomOffering.createMany({
      data: roomOfferings.map((room) => ({
        hostelId: hostel.id,
        roomType: room.roomType,
        price: room.price,
        pricingPeriod: room.pricingPeriod ?? "AcademicYear",
        bedsPerRoom: room.bedsPerRoom ?? null,
        totalRooms: room.totalRooms ?? null,
        availableRooms: room.availableRooms ?? null,
        availability: room.availability ?? "Available",
        description: room.description ?? null,
      })),
    });
  }

  const createdHostel = await prisma.hostel.findUnique({
    where: { id: hostel.id },
    include: { facilities: true, roomOfferings: true },
  });

  // Images uploaded before the hostel existed live under a temporary folder.
  // Move them into the hostel's own folder so they aren't orphaned, and
  // rewrite the stored URLs to point at the new location.
  const tempFolder = input.tempFolder?.trim();
  if (tempFolder && tempFolder !== hostel.id) {
    const moved = await relocateImages(tempFolder, hostel.id);
    if (moved > 0) {
      const rebase = (url: string) =>
        url.includes(`${tempFolder}/`)
          ? url.replace(`${tempFolder}/`, `${hostel.id}/`)
          : url;
      const photos = (input.photos ?? []).map(rebase);
      const image = input.image ? rebase(input.image) : photos[0] ?? "";
      const updated = await prisma.hostel.update({
        where: { id: hostel.id },
        data: { photos, image },
        include: { facilities: true, roomOfferings: true },
      });
      return toDTO(updated);
    }
  }

  if (!createdHostel) throw new ApiError(404, "Hostel not found");
  return toDTO(createdHostel);
}

export async function updateHostel(id: string, patch: HostelUpdate): Promise<HostelDTO> {
  const existing = await prisma.hostel.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Hostel not found");

  const data: Record<string, unknown> = { ...patch };
  if (patch.name) {
    data.slug = await generateUniqueSlug(patch.name, id);
  } else if (patch.slug) {
    data.slug = await generateUniqueSlug(patch.slug, id);
  }
  if (patch.facilities) {
    const facilities = await resolveFacilities(patch.facilities);
    data.facilities = { set: facilities.map((f) => ({ id: f.id })) };
  }

  // Remove roomOfferings from the hostel payload so we can replace them in a
  // separate step. This keeps the update transaction explicit and lets the
  // frontend submit multiple room offerings in a single request.
  delete data.roomOfferings;

  await prisma.hostel.update({
    where: { id },
    data,
    include: { facilities: true, roomOfferings: true },
  });

  if (patch.roomOfferings) {
    const incoming = patch.roomOfferings.filter((room) => room.roomType?.trim());
    await prisma.$transaction([
      prisma.roomOffering.deleteMany({ where: { hostelId: id } }),
      ...(incoming.length
        ? [
            prisma.roomOffering.createMany({
              data: incoming.map((room) => ({
                hostelId: id,
                roomType: room.roomType,
                price: room.price,
                pricingPeriod: room.pricingPeriod ?? "AcademicYear",
                bedsPerRoom: room.bedsPerRoom ?? null,
                totalRooms: room.totalRooms ?? null,
                availableRooms: room.availableRooms ?? null,
                availability: room.availability ?? "Available",
                description: room.description ?? null,
              })),
            }),
          ]
        : []),
    ]);
  }

  const updated = await prisma.hostel.findUnique({
    where: { id },
    include: { facilities: true, roomOfferings: true },
  });
  if (!updated) throw new ApiError(404, "Hostel not found");
  return toDTO(updated);
}

export async function deleteHostel(id: string): Promise<void> {
  const existing = await prisma.hostel.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Hostel not found");
  await prisma.hostel.delete({ where: { id } });
}
