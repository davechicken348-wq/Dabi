import { useSyncExternalStore } from "react";
import type { Availability } from "../data/hostels";
import type { RoomType } from "../data/hostelDetails";
import { hostelDetails, deriveAvailability } from "../data/hostelDetails";

export type TenancyStatus = "pending" | "active" | "ended";

export interface Tenancy {
  id: string;
  hostelId: string;
  hostelName: string;
  roomTypeId: string;
  roomTypeName: string;
  occupantName: string;
  phone: string;
  /** Bed units this tenancy occupies (1-in-1 = whole room, shared = 1 bed). */
  beds: number;
  moveIn: string;
  moveOut?: string;
  status: TenancyStatus;
  source: "self" | "admin";
  createdAt: string;
}

export type TenancyInput = Omit<Tenancy, "id" | "status" | "createdAt"> & {
  status?: TenancyStatus;
};

// The static hostelDetails fixtures are the source of truth for room inventory
// (totalBeds / availableBeds). The tenancy ledger adjusts that baseline at runtime.
const base: Record<string, RoomType[]> = Object.fromEntries(
  Object.entries(hostelDetails).map(([id, d]) => [id, d.roomTypes]),
);

let tenancies: Tenancy[] = [];

let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version += 1;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getVersion() {
  return version;
}

function activeBeds(hostelId: string, roomTypeId: string): number {
  return tenancies
    .filter(
      (t) => t.hostelId === hostelId && t.roomTypeId === roomTypeId && t.status === "active",
    )
    .reduce((sum, t) => sum + t.beds, 0);
}

/** Live availability for a single room type, derived from the tenancy ledger. */
export function liveRoomAvailability(hostelId: string, room: RoomType): Availability {
  const baseRoom = base[hostelId]?.find((r) => r.id === room.id);
  if (!baseRoom || baseRoom.totalBeds == null || baseRoom.availableBeds == null) {
    return room.availability;
  }
  return deriveAvailability(baseRoom.totalBeds, baseRoom.availableBeds - activeBeds(hostelId, room.id));
}

/** Live availability for a whole hostel (aggregate of its room types). */
export function liveHostAvailability(hostelId: string): Availability | null {
  const baseRooms = base[hostelId];
  if (!baseRooms || baseRooms.length === 0) return null;
  let total = 0;
  let free = 0;
  for (const r of baseRooms) {
    if (r.totalBeds == null || r.availableBeds == null) continue;
    total += r.totalBeds;
    free += Math.max(0, r.availableBeds - activeBeds(hostelId, r.id));
  }
  if (total === 0) return null;
  return deriveAvailability(total, free);
}

export function getTenancies(): Tenancy[] {
  return tenancies;
}

export function requestTenancy(input: TenancyInput): Tenancy {
  const t: Tenancy = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `t-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    status: input.status ?? "pending",
    createdAt: new Date().toISOString(),
    ...input,
  };
  tenancies = [t, ...tenancies];
  emit();
  return t;
}

export function confirmTenancy(id: string): void {
  tenancies = tenancies.map((t) => (t.id === id ? { ...t, status: "active" } : t));
  emit();
}

export function endTenancy(id: string): void {
  tenancies = tenancies.map((t) => (t.id === id ? { ...t, status: "ended" } : t));
  emit();
}

export function cancelTenancy(id: string): void {
  tenancies = tenancies.filter((t) => t.id !== id);
  emit();
}

/** Re-renders the calling component whenever the tenancy ledger changes. */
export function useTenancyVersion(): number {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}
