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
  roomId: string;
  hostelId: string;
  roomName: string;
  hostelName: string;
  message?: string;
  studentName?: string;
  phone?: string;
  school?: string;
  moveInDate?: string;
}): Promise<Enquiry> {
  const created = await createEnquiryApi({
    name: data.studentName ?? 'Student',
    phone: data.phone ?? '',
    school: data.school,
    hostelId: data.hostelId,
    roomOfferingId: data.roomId,
    hostelName: data.hostelName,
    roomType: data.roomName,
    moveInDate: data.moveInDate,
    message: data.message,
    status: 'New',
  });

  return mapBackendEnquiry(created);
}
