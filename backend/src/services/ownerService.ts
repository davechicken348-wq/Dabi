import { prisma } from "../prisma";
import { ApiError } from "../utils/errors";
import type { OwnerCreate, OwnerDTO, OwnerUpdate } from "../types";

async function hostelIdsForOwner(ownerId: string): Promise<string[]> {
  const hostels = await prisma.hostel.findMany({
    where: { ownerId },
    select: { id: true },
  });
  return hostels.map((h) => h.id);
}

function toDTO(owner: {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinedAt: Date;
  active: boolean;
}, hostelIds: string[]): OwnerDTO {
  return {
    id: owner.id,
    name: owner.name,
    phone: owner.phone,
    email: owner.email,
    joinedAt: owner.joinedAt.toISOString().slice(0, 10),
    active: owner.active,
    hostelIds,
  };
}

export async function listOwners(): Promise<OwnerDTO[]> {
  const owners = await prisma.owner.findMany({
    orderBy: { name: "asc" },
  });
  return Promise.all(
    owners.map(async (o) => toDTO(o, await hostelIdsForOwner(o.id))),
  );
}

export async function getOwner(id: string): Promise<OwnerDTO> {
  const owner = await prisma.owner.findUnique({ where: { id } });
  if (!owner) throw new ApiError(404, "Owner not found");
  return toDTO(owner, await hostelIdsForOwner(id));
}

export async function createOwner(input: OwnerCreate): Promise<OwnerDTO> {
  const owner = await prisma.owner.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      active: input.active,
    },
  });
  const hostelIds = input.hostelIds ?? [];
  if (hostelIds.length) {
    await prisma.hostel.updateMany({
      where: { id: { in: hostelIds } },
      data: { ownerId: owner.id },
    });
  }
  return toDTO(owner, hostelIds);
}

export async function updateOwner(id: string, patch: OwnerUpdate): Promise<OwnerDTO> {
  const existing = await prisma.owner.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Owner not found");

  const nextHostelIds = patch.hostelIds ?? (await hostelIdsForOwner(id));

  await prisma.$transaction([
    prisma.owner.update({
      where: { id },
      data: {
        name: patch.name,
        phone: patch.phone,
        email: patch.email,
        active: patch.active,
      },
    }),
    // Detach hostels no longer owned.
    prisma.hostel.updateMany({
      where: { ownerId: id, id: { notIn: nextHostelIds } },
      data: { ownerId: null },
    }),
    // Attach newly owned hostels.
    nextHostelIds.length
      ? prisma.hostel.updateMany({
          where: { id: { in: nextHostelIds } },
          data: { ownerId: id },
        })
      : prisma.hostel.updateMany({ where: { id: { in: [] } }, data: {} }),
  ]);

  return toDTO(
    await prisma.owner.findUniqueOrThrow({ where: { id } }),
    nextHostelIds,
  );
}

export async function deleteOwner(id: string): Promise<void> {
  const existing = await prisma.owner.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Owner not found");
  await prisma.hostel.updateMany({
    where: { ownerId: id },
    data: { ownerId: null },
  });
  await prisma.owner.delete({ where: { id } });
}
