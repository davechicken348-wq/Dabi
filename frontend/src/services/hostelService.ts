import type { Hostel, RoomOption } from '../types/index';
import { fetchHostel as fetchHostelApi, fetchHostels as fetchHostelsApi } from './api';

type BackendRoomOffering = {
  id: string;
  hostelId: string;
  roomType: string;
  price: number;
  pricingPeriod?: 'AcademicYear' | 'Semester' | 'Month';
  bedsPerRoom?: number;
  totalRooms?: number;
  availableRooms?: number;
  availability?: 'Available' | 'Limited' | 'Full';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BackendHostel = {
  id: string;
  name: string;
  location: string;
  pricePerYear: number;
  roomType?: string;
  totalRooms?: number;
  totalBeds?: number;
  availableBeds?: number;
  availability?: 'Available' | 'Limited' | 'Full';
  facilities?: string[];
  image?: string;
  photos?: string[];
  note?: string;
  address?: string;
  landmark?: string;
  verified?: boolean;
  verifiedAt?: string;
  lastCheckedAt?: string;
  distanceFromSTU?: number;
  latitude?: number;
  longitude?: number;
  ownerId?: string;
  createdAt?: string;
  roomOfferings?: BackendRoomOffering[];
};

function occupancyFromRoomType(roomType: string): number {
  const match = roomType.match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

function toRoomOption(hostel: BackendHostel, roomOffering?: BackendRoomOffering): RoomOption {
  const roomType = roomOffering?.roomType ?? hostel.roomType ?? '1-in-1';
  const totalUnits = roomOffering?.totalRooms ?? hostel.totalRooms ?? hostel.totalBeds ?? 1;
  const availableUnits = roomOffering?.availableRooms ?? hostel.availableBeds ?? (hostel.availability === 'Full' ? 0 : totalUnits);
  const pricePerYear = roomOffering?.price ?? hostel.pricePerYear ?? 0;
  const availabilityStatus = roomOffering?.availability ?? hostel.availability ?? 'Available';
  const photos = (hostel.photos?.length ? hostel.photos : hostel.image ? [hostel.image] : [])
    .filter((photo): photo is string => Boolean(photo));

  return {
    id: roomOffering?.id ?? `${hostel.id}-room`,
    hostelId: hostel.id,
    roomOfferingId: roomOffering?.id,
    name: roomType,
    description: roomOffering?.description || hostel.note || `Room option at ${hostel.name} in ${hostel.location}.`,
    pricePerYear,
    totalUnits,
    availableUnits,
    availabilityStatus,
    occupancy: occupancyFromRoomType(roomType),
    facilities: hostel.facilities ?? [],
    photos,
    hostelName: hostel.name,
    hostelLocation: hostel.location,
    pricingPeriod: roomOffering?.pricingPeriod,
  };
}

function toHostel(hostel: BackendHostel): Hostel {
  const photos = (hostel.photos?.length ? hostel.photos : hostel.image ? [hostel.image] : [])
    .filter((photo): photo is string => Boolean(photo));
  const roomOptions = Array.isArray(hostel.roomOfferings) && hostel.roomOfferings.length > 0
    ? hostel.roomOfferings.map((roomOffering) => toRoomOption(hostel, roomOffering))
    : [toRoomOption(hostel)];

  return {
    id: hostel.id,
    name: hostel.name,
    location: hostel.location,
    address: hostel.address,
    landmark: hostel.landmark,
    description: hostel.note || `Accommodation in ${hostel.location}.`,
    photos,
    facilities: hostel.facilities ?? [],
    roomOptions,
    verified: hostel.verified ?? false,
    checkedAt: hostel.lastCheckedAt ?? hostel.createdAt ?? new Date().toISOString(),
    verifiedAt: hostel.verifiedAt,
    lastCheckedAt: hostel.lastCheckedAt,
    distanceKm: hostel.distanceFromSTU ?? undefined,
    latitude: hostel.latitude,
    longitude: hostel.longitude,
    ownerId: hostel.ownerId,
    note: hostel.note,
  };
}

export async function fetchHostels(): Promise<Hostel[]> {
  const hostels = await fetchHostelsApi();
  return hostels.map(toHostel);
}

export async function fetchHostelById(id: string): Promise<Hostel | undefined> {
  const hostel = await fetchHostelApi(id);
  return hostel ? toHostel(hostel) : undefined;
}

export async function fetchRooms(): Promise<RoomOption[]> {
  const hostels = await fetchHostels();
  return hostels.flatMap((hostel) => hostel.roomOptions);
}

export async function fetchRoomById(id: string): Promise<RoomOption | undefined> {
  const hostels = await fetchHostels();
  const flattened = hostels.flatMap((hostel) => hostel.roomOptions);

  if (id.endsWith('-room')) {
    const hostelId = id.slice(0, -5);
    const hostel = hostels.find((item) => item.id === hostelId);
    return hostel?.roomOptions[0] ?? flattened.find((room) => room.id === id);
  }

  return flattened.find((room) => room.id === id) ?? undefined;
}

export async function searchHostels(query: string): Promise<Hostel[]> {
  const hostels = await fetchHostels();
  const lower = query.toLowerCase();

  return hostels.filter((hostel) => {
    const roomMatch = hostel.roomOptions.some((room) =>
      room.name.toLowerCase().includes(lower) ||
      room.facilities.some((facility) => facility.toLowerCase().includes(lower))
    );

    return (
      hostel.name.toLowerCase().includes(lower) ||
      hostel.location.toLowerCase().includes(lower) ||
      roomMatch
    );
  });
}
