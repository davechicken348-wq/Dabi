import { prisma } from "../prisma";
import { ApiError } from "../utils/errors";
import type { EnquiryDTO, EnquiryUpdate, EnquiryCreate } from "../types";

function toDTO(e: {
  id: string;
  name: string;
  phone: string;
  school: string | null;
  hostelId: string | null;
  hostelName: string | null;
  roomType: string | null;
  moveInDate: Date | null;
  message: string | null;
  status: "New" | "Contacted" | "Resolved";
  createdAt: Date;
}): EnquiryDTO {
  return {
    id: e.id,
    name: e.name,
    phone: e.phone,
    school: e.school ?? undefined,
    hostelId: e.hostelId ?? undefined,
    hostelName: e.hostelName ?? undefined,
    roomType: e.roomType ?? undefined,
    moveInDate: e.moveInDate ? e.moveInDate.toISOString().slice(0, 10) : undefined,
    message: e.message ?? undefined,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
  };
}

export async function listEnquiries(): Promise<EnquiryDTO[]> {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return enquiries.map(toDTO);
}

export async function createEnquiry(input: EnquiryCreate): Promise<EnquiryDTO> {
  const enquiry = await prisma.enquiry.create({
    data: {
      name: input.name,
      phone: input.phone,
      school: input.school ?? null,
      hostelId: input.hostelId ?? null,
      hostelName: input.hostelName ?? null,
      roomType: input.roomType ?? null,
      moveInDate: input.moveInDate ? new Date(input.moveInDate) : null,
      message: input.message ?? null,
      status: input.status ?? "New",
    },
  });
  return toDTO(enquiry);
}

export async function getEnquiry(id: string): Promise<EnquiryDTO> {
  const enquiry = await prisma.enquiry.findUnique({ where: { id } });
  if (!enquiry) throw new ApiError(404, "Enquiry not found");
  return toDTO(enquiry);
}

export async function updateEnquiry(id: string, patch: EnquiryUpdate): Promise<EnquiryDTO> {
  const existing = await prisma.enquiry.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Enquiry not found");
  const enquiry = await prisma.enquiry.update({ where: { id }, data: patch });
  return toDTO(enquiry);
}

export async function deleteEnquiry(id: string): Promise<void> {
  const existing = await prisma.enquiry.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Enquiry not found");
  await prisma.enquiry.delete({ where: { id } });
}
