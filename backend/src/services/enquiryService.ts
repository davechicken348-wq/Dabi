import { prisma } from "../prisma";
import { ApiError } from "../utils/errors";
import { cached } from "../utils/cache";
import type { EnquiryDTO, EnquiryUpdate, EnquiryCreate } from "../types";

function toDTO(e: {
  id: string;
  name: string;
  phone: string;
  school: string | null;
  hostelId: string | null;
  hostelName: string | null;
  roomOfferingId: string | null;
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
    roomOfferingId: e.roomOfferingId ?? undefined,
    roomType: e.roomType ?? undefined,
    moveInDate: e.moveInDate ? e.moveInDate.toISOString().slice(0, 10) : undefined,
    message: e.message ?? undefined,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
  };
}

export async function listEnquiries(): Promise<EnquiryDTO[]> {
  return cached("enquiries:list", 30_000, async () => {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return enquiries.map(toDTO);
  });
}

export async function createEnquiry(input: EnquiryCreate): Promise<EnquiryDTO> {
  const name = input.name?.trim();
  const phone = input.phone?.trim();

  if (!name) {
    throw new ApiError(400, "Full name is required.");
  }

  if (!phone) {
    throw new ApiError(400, "Phone number is required.");
  }

  const roomOfferingId = input.roomOfferingId?.trim();
  let hostelId = input.hostelId?.trim() || null;
  let hostelName = input.hostelName?.trim() || null;
  let roomType = input.roomType?.trim() || null;

  if (roomOfferingId) {
    const roomOffering = await prisma.roomOffering.findUnique({
      where: { id: roomOfferingId },
      include: { hostel: true },
    });

    if (!roomOffering) {
      throw new ApiError(404, "Room offering not found.");
    }

    hostelId = roomOffering.hostelId;
    hostelName = roomOffering.hostel.name;
    roomType = roomOffering.roomType;

    if (input.hostelId && input.hostelId.trim() !== hostelId) {
      throw new ApiError(400, "Selected room does not belong to the selected hostel.");
    }
  } else if (hostelId) {
    const hostel = await prisma.hostel.findUnique({ where: { id: hostelId } });
    if (!hostel) {
      throw new ApiError(404, "Hostel not found.");
    }
    hostelName = hostel.name;
  } else {
    throw new ApiError(400, "Please select a room before sending an enquiry.");
  }

  const moveInDate = input.moveInDate ? new Date(input.moveInDate) : null;

  if (input.moveInDate && Number.isNaN(moveInDate?.getTime() ?? NaN)) {
    throw new ApiError(400, "Move-in date is invalid.");
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      name,
      phone,
      school: input.school?.trim() || null,
      hostelId,
      roomOfferingId,
      hostelName,
      roomType,
      moveInDate,
      message: input.message?.trim() || null,
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
