import { prisma } from "../prisma";
import { ApiError } from "../utils/errors";
import { cached } from "../utils/cache";
import type {
  TenancyDTO,
  TenancyCreate,
  TenancyStatus,
} from "../types";

type TenancyRow = {
  id: string;
  hostelId: string;
  hostelName: string;
  roomType: string;
  beds: number;
  occupantName: string;
  phone: string;
  moveInDate: Date | null;
  moveOutDate: Date | null;
  status: TenancyStatus;
  source: string;
  createdAt: Date;
};

function toDTO(t: TenancyRow): TenancyDTO {
  return {
    id: t.id,
    hostelId: t.hostelId,
    hostelName: t.hostelName,
    roomType: t.roomType,
    beds: t.beds,
    occupantName: t.occupantName,
    phone: t.phone,
    moveInDate: t.moveInDate ? t.moveInDate.toISOString().slice(0, 10) : undefined,
    moveOutDate: t.moveOutDate ? t.moveOutDate.toISOString().slice(0, 10) : undefined,
    status: t.status,
    source: t.source,
    createdAt: t.createdAt.toISOString(),
  };
}

export async function listTenancies(hostelId?: string): Promise<TenancyDTO[]> {
  const key = hostelId ? `tenancies:list:${hostelId}` : "tenancies:list";
  return cached(key, 30_000, async () => {
    const items = await prisma.tenancy.findMany({
      where: hostelId ? { hostelId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return items.map(toDTO);
  });
}

export async function getTenancy(id: string): Promise<TenancyDTO> {
  const t = await prisma.tenancy.findUnique({ where: { id } });
  if (!t) throw new ApiError(404, "Tenancy not found");
  return toDTO(t);
}

export async function createTenancy(input: TenancyCreate): Promise<TenancyDTO> {
  const hostel = await prisma.hostel.findUnique({ where: { id: input.hostelId } });
  if (!hostel) throw new ApiError(404, "Hostel not found");
  const t = await prisma.tenancy.create({
    data: {
      hostelId: input.hostelId,
      hostelName: input.hostelName ?? hostel.name,
      roomType: input.roomType,
      beds: input.beds ?? 1,
      occupantName: input.occupantName,
      phone: input.phone,
      moveInDate: input.moveInDate ? new Date(input.moveInDate) : null,
      moveOutDate: input.moveOutDate ? new Date(input.moveOutDate) : null,
      status: input.status ?? "Pending",
      source: input.source ?? "self",
    },
  });
  return toDTO(t);
}

export async function setTenancyStatus(
  id: string,
  status: TenancyStatus,
  moveOutDate?: string,
): Promise<TenancyDTO> {
  const existing = await prisma.tenancy.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Tenancy not found");
  const t = await prisma.tenancy.update({
    where: { id },
    data: {
      status,
      ...(moveOutDate !== undefined ? { moveOutDate: new Date(moveOutDate) } : {}),
    },
  });
  return toDTO(t);
}

export async function deleteTenancy(id: string): Promise<void> {
  const existing = await prisma.tenancy.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Tenancy not found");
  await prisma.tenancy.delete({ where: { id } });
}
