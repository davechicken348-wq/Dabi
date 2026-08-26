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

function toDTO(
  h: {
    id: string;
    name: string;
    location: string;
    pricePerYear: number;
    roomType: string;
    totalRooms: number | null;
    availability: "Available" | "Limited" | "Full";
    verified: boolean;
    image: string;
    photos: string[];
    note: string | null;
    distanceFromSTU: number | null;
    latitude: number | null;
    longitude: number | null;
    ownerId: string | null;
    createdAt: Date;
    facilities?: { key: string }[];
  },
  activeBeds = 0,
): HostelDTO {
  const live = computeLiveAvailability(h, activeBeds);
  return {
    id: h.id,
    name: h.name,
    location: h.location,
    pricePerYear: h.pricePerYear,
    roomType: h.roomType,
    totalRooms: h.totalRooms ?? undefined,
    availability: live.availability,
    verified: h.verified,
    image: h.image,
    photos: h.photos ?? [],
    note: h.note ?? undefined,
    distanceFromSTU: h.distanceFromSTU ?? undefined,
    latitude: h.latitude ?? undefined,
    longitude: h.longitude ?? undefined,
    facilities: (h.facilities ?? []).map((f) => f.key),
    ownerId: h.ownerId ?? undefined,
    createdAt: h.createdAt.toISOString(),
    totalBeds: live.totalBeds,
    availableBeds: live.availableBeds,
  };
}

export async function listHostels(): Promise<HostelDTO[]> {
  return cached("hostels:list", 30_000, async () => {
    const hostels = await prisma.hostel.findMany({
    include: { facilities: true },
    orderBy: { name: "asc" },
  });
  const active = await prisma.tenancy.findMany({
    where: { status: "Active" },
    select: { hostelId: true, beds: true },
  });
  const bedsByHostel = new Map<string, number>();
  for (const t of active) {
    bedsByHostel.set(t.hostelId, (bedsByHostel.get(t.hostelId) ?? 0) + (t.beds ?? 0));
  }
  return hostels.map((h) => toDTO(h, bedsByHostel.get(h.id) ?? 0));
  });
}

export async function getHostel(id: string): Promise<HostelDTO> {
  const hostel = await prisma.hostel.findUnique({
    where: { id },
    include: { facilities: true },
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
  const hostel = await prisma.hostel.create({
    data: {
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
    include: { facilities: true },
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
        include: { facilities: true },
      });
      return toDTO(updated);
    }
  }

  return toDTO(hostel);
}

export async function updateHostel(id: string, patch: HostelUpdate): Promise<HostelDTO> {
  const existing = await prisma.hostel.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Hostel not found");

  const data: Record<string, unknown> = { ...patch };
  if (patch.facilities) {
    const facilities = await resolveFacilities(patch.facilities);
    data.facilities = { set: facilities.map((f) => ({ id: f.id })) };
  }

  const hostel = await prisma.hostel.update({
    where: { id },
    data,
    include: { facilities: true },
  });
  return toDTO(hostel);
}

export async function deleteHostel(id: string): Promise<void> {
  const existing = await prisma.hostel.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Hostel not found");
  await prisma.hostel.delete({ where: { id } });
}
