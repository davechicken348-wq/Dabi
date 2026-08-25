import { prisma } from "../prisma";
import { ApiError } from "../utils/errors";
import { cached } from "../utils/cache";
import type { DealCreate, DealDTO, DealUpdate } from "../types";

function toDTO(d: {
  id: string;
  title: string;
  description: string | null;
  code: string;
  discountPercent: number;
  hostelId: string | null;
  active: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}): DealDTO {
  return {
    id: d.id,
    title: d.title,
    description: d.description ?? undefined,
    code: d.code,
    discountPercent: d.discountPercent,
    hostelId: d.hostelId ?? undefined,
    active: d.active,
    expiresAt: d.expiresAt ? d.expiresAt.toISOString().slice(0, 10) : undefined,
    createdAt: d.createdAt.toISOString().slice(0, 10),
  };
}

export async function listDeals(): Promise<DealDTO[]> {
  return cached("deals:list", 30_000, async () => {
    const deals = await prisma.deal.findMany({ orderBy: { title: "asc" } });
    return deals.map(toDTO);
  });
}

export async function getDeal(id: string): Promise<DealDTO> {
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) throw new ApiError(404, "Deal not found");
  return toDTO(deal);
}

export async function createDeal(input: DealCreate): Promise<DealDTO> {
  const deal = await prisma.deal.create({
    data: {
      title: input.title,
      description: input.description,
      code: input.code,
      discountPercent: input.discountPercent,
      hostelId: input.hostelId,
      active: input.active,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  });
  return toDTO(deal);
}

export async function updateDeal(id: string, patch: DealUpdate): Promise<DealDTO> {
  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Deal not found");
  const data: Record<string, unknown> = { ...patch };
  if (patch.expiresAt !== undefined) {
    data.expiresAt = patch.expiresAt ? new Date(patch.expiresAt) : null;
  }
  const deal = await prisma.deal.update({ where: { id }, data });
  return toDTO(deal);
}

export async function deleteDeal(id: string): Promise<void> {
  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Deal not found");
  await prisma.deal.delete({ where: { id } });
}
