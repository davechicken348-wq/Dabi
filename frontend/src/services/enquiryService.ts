import { createEnquiry as createEnquiryApi, fetchEnquiries as fetchEnquiriesApi } from './api';
import type { Enquiry } from '../types/index';

function mapBackendEnquiry(enquiry: any): Enquiry {
  const status = enquiry.status?.toLowerCase?.() ?? 'new';

  return {
    id: enquiry.id,
    roomId: enquiry.roomOfferingId ?? enquiry.roomId ?? '',
    hostelId: enquiry.hostelId ?? '',
    roomName: enquiry.roomType ?? 'Room request',
    hostelName: enquiry.hostelName ?? 'Hostel enquiry',
    status: status === 'reviewing'
      ? 'reviewing'
      : status === 'contacted'
        ? 'contacted'
        : status === 'resolved'
          ? 'resolved'
          : 'new',
    submittedAt: enquiry.createdAt ?? new Date().toISOString(),
    message: enquiry.message,
  };
}

export async function fetchEnquiries(): Promise<Enquiry[]> {
  const enquiries = await fetchEnquiriesApi();
  return enquiries.map(mapBackendEnquiry);
}

export async function submitEnquiry(data: {
  roomId?: string;
  hostelId: string;
  roomName: string;
  hostelName: string;
  message?: string;
  studentName?: string;
  phone?: string;
  email?: string;
  school?: string;
  moveInDate?: string;
}): Promise<Enquiry> {
  const created = await createEnquiryApi({
    name: data.studentName ?? 'Student',
    phone: data.phone ?? '',
    email: data.email,
    school: data.school,
    hostelId: data.hostelId,
    ...(data.roomId ? { roomOfferingId: data.roomId } : {}),
    hostelName: data.hostelName,
    roomType: data.roomName,
    moveInDate: data.moveInDate,
    message: data.message,
    status: 'New',
  });

  return mapBackendEnquiry(created);
}

export async function submitRoomRequest(data: {
  studentName: string;
  phone: string;
  school?: string;
  location?: string;
  roomType?: string;
  budgetMin?: number;
  budgetMax?: number;
  moveInDate?: string;
  message?: string;
}): Promise<Enquiry> {
  const created = await createEnquiryApi({
    name: data.studentName,
    phone: data.phone,
    school: data.school,
    hostelId: '',
    hostelName: data.location || 'Any location',
    roomType: data.roomType || 'Any room type',
    moveInDate: data.moveInDate,
    message: [
      data.message,
      data.budgetMin || data.budgetMax
        ? `Budget: GH₵${data.budgetMin ?? 0}${data.budgetMax ? ` – GH₵${data.budgetMax}` : '+'}`
        : '',
      data.location ? `Preferred area: ${data.location}` : '',
    ].filter(Boolean).join('\n'),
    status: 'New',
  });

  return mapBackendEnquiry(created);
}
