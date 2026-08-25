import { prisma } from "../prisma";
import { ApiError } from "../utils/errors";
import { cached } from "../utils/cache";
import type { FacilityDTO, FacilityCreate, FacilityUpdate } from "../types";

/** Normalize a facility key: lowercase, trimmed, spaces -> dashes. */
export function normalizeFacilityKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toDTO(f: {
  id: string;
  key: string;
  label: string;
  iconKey: string | null;
  category: string | null;
}): FacilityDTO {
  return {
    id: f.id,
    key: f.key,
    label: f.label,
    iconKey: f.iconKey ?? null,
    category: f.category ?? null,
  };
}

export async function listFacilities(): Promise<FacilityDTO[]> {
  return cached("facilities:list", 30_000, async () => {
    const fs = await prisma.facility.findMany({ orderBy: { label: "asc" } });
    return fs.map(toDTO);
  });
}

export async function createFacility(input: FacilityCreate): Promise<FacilityDTO> {
  const key = normalizeFacilityKey(input.key);
  if (!key) throw new ApiError(400, "A facility key is required.");

  const existing = await prisma.facility.findUnique({ where: { key } });
  if (existing) {
    throw new ApiError(409, `A facility with the key "${key}" already exists.`);
  }

  const created = await prisma.facility.create({
    data: {
      key,
      label: input.label?.trim() || key,
      iconKey: input.iconKey || null,
      category: input.category || null,
    },
  });
  return toDTO(created);
}

export async function updateFacility(
  id: string,
  patch: FacilityUpdate,
): Promise<FacilityDTO> {
  const existing = await prisma.facility.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Facility not found");

  const data: {
    key?: string;
    label?: string;
    iconKey?: string | null;
    category?: string | null;
  } = {};

  if (patch.label !== undefined) {
    data.label = patch.label.trim() || existing.label;
  }
  if (patch.iconKey !== undefined) {
    data.iconKey = patch.iconKey || null;
  }
  if (patch.category !== undefined) {
    data.category = patch.category || null;
  }
  if (patch.key !== undefined && patch.key.trim()) {
    const key = normalizeFacilityKey(patch.key);
    if (key !== existing.key) {
      const clash = await prisma.facility.findUnique({ where: { key } });
      if (clash) {
        throw new ApiError(409, `A facility with the key "${key}" already exists.`);
      }
      data.key = key;
    }
  }

  const updated = await prisma.facility.update({ where: { id }, data });
  return toDTO(updated);
}

export async function deleteFacility(id: string): Promise<void> {
  const existing = await prisma.facility.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Facility not found");
  await prisma.facility.delete({ where: { id } });
}
