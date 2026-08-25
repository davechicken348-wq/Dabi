import type { Availability } from "../types";

export function roomCapacity(name?: string | null): number {
  if (!name) return 1;
  const m = name.match(/(\d+)\s*-?\s*in\s*-?\s*1/i);
  const n = m ? parseInt(m[1], 10) : 1;
  return n >= 1 ? n : 1;
}

export function deriveAvailability(
  total?: number,
  available?: number,
): Availability {
  if (total == null || available == null) return "Available";
  if (available <= 0) return "Full";
  if (available < total) return "Limited";
  return "Available";
}

export function computeLiveAvailability(
  hostel: { roomType: string; totalRooms: number | null; availability: Availability },
  activeBeds: number,
): { totalBeds: number; availableBeds: number; availability: Availability } {
  const capacity = roomCapacity(hostel.roomType);
  const totalRooms = hostel.totalRooms ?? 1;
  const totalBeds = capacity * totalRooms;
  const availableBeds = Math.max(0, totalBeds - activeBeds);
  const availability =
    totalBeds > 0 ? deriveAvailability(totalBeds, availableBeds) : hostel.availability;
  return { totalBeds, availableBeds, availability };
}
