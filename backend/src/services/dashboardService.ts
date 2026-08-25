import { prisma } from "../prisma";
import { computeLiveAvailability } from "../utils/availability";
import { cached } from "../utils/cache";
import type { Availability, DashboardStats } from "../types";

export async function getStats(): Promise<DashboardStats> {
  return cached("dashboard:stats", 30_000, async () => {
    const [
    totalHostels,
    verifiedHostels,
    totalOwners,
    totalEnquiries,
    newEnquiries,
    activeDeals,
    hostels,
    active,
  ] = await Promise.all([
    prisma.hostel.count(),
    prisma.hostel.count({ where: { verified: true } }),
    prisma.owner.count(),
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "New" } }),
    prisma.deal.count({ where: { active: true } }),
    prisma.hostel.findMany({
      select: {
        id: true,
        roomType: true,
        totalRooms: true,
        availability: true,
        pricePerYear: true,
      },
    }),
    prisma.tenancy.findMany({
      where: { status: "Active" },
      select: { hostelId: true, beds: true },
    }),
  ]);

  const bedsByHostel = new Map<string, number>();
  for (const t of active) {
    bedsByHostel.set(t.hostelId, (bedsByHostel.get(t.hostelId) ?? 0) + (t.beds ?? 0));
  }

  const availability: Record<Availability, number> = {
    Available: 0,
    Limited: 0,
    Full: 0,
  };
  let potentialRevenue = 0;
  hostels.forEach((h) => {
    const live = computeLiveAvailability(h, bedsByHostel.get(h.id) ?? 0);
    availability[live.availability] += 1;
    if (live.availability !== "Full") potentialRevenue += h.pricePerYear;
  });

  return {
    totalHostels,
    verifiedHostels,
    totalOwners,
    totalEnquiries,
    newEnquiries,
    activeDeals,
    availability,
    potentialRevenue,
  };
  });
}
