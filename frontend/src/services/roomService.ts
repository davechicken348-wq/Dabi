import type { RoomOption, SearchFilters } from '../types/index';

interface BackendRoomOffering {
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
}

interface BackendHostel {
  id: string;
  name: string;
  location: string;
  pricePerYear: number;
  roomType?: string;
  totalRooms?: number;
  totalBeds?: number;
  availableBeds?: number;
  availability?: 'Available' | 'Limited' | 'Full';
  facilities: string[];
  image?: string;
  photos?: string[];
  note?: string;
  createdAt?: string;
  lastCheckedAt?: string;
  checkedAt?: string;
  roomOfferings?: BackendRoomOffering[];
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export async function fetchFilterFacilities(): Promise<string[]> {
  const response = await fetch(`${API_URL}/api/facilities`);
  if (!response.ok) throw new Error('Failed to load facilities.');
  const facilities = await response.json() as Array<{ label?: string; key?: string }>;
  return facilities.map((facility) => facility.label || facility.key || '').filter(Boolean);
}

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
  const photos = hostel.photos?.length ? hostel.photos : (hostel.image ? [hostel.image] : []);

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
    pricingPeriod: roomOffering?.pricingPeriod ?? 'AcademicYear',
    lastCheckedAt: hostel.lastCheckedAt ?? hostel.checkedAt,
  };
}

export async function fetchRooms(filters?: SearchFilters): Promise<RoomOption[]> {
  const response = await fetch(`${API_URL}/api/hostels`);
  if (!response.ok) throw new Error('Failed to load rooms from Dabi.');

  const hostels = await response.json() as BackendHostel[];
  let rooms = hostels.flatMap((hostel) => {
    if (Array.isArray(hostel.roomOfferings) && hostel.roomOfferings.length > 0) {
      return hostel.roomOfferings.map((roomOffering) => toRoomOption(hostel, roomOffering));
    }
    return [toRoomOption(hostel)];
  });

  if (!filters) return rooms;

  const query = filters.query.trim().toLowerCase();
  if (query) {
    rooms = rooms.filter((room) => [room.name, room.hostelName, room.hostelLocation, ...room.facilities]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query)));
  }
  if (filters.minPrice !== null) rooms = rooms.filter((room) => room.pricePerYear >= filters.minPrice!);
  if (filters.maxPrice !== null) rooms = rooms.filter((room) => room.pricePerYear <= filters.maxPrice!);
  if (filters.location) rooms = rooms.filter((room) => room.hostelLocation === filters.location);
  if (filters.occupancy) rooms = rooms.filter((room) => room.occupancy === filters.occupancy);
  if (filters.facilities.length) {
    rooms = rooms.filter((room) => filters.facilities.every((facility) =>
      room.facilities.some((roomFacility) => roomFacility.toLowerCase() === facility.toLowerCase())
    ));
  }
  if (filters.availability === 'available') rooms = rooms.filter((room) => room.availableUnits > 0);
  if (filters.availability === 'limited') rooms = rooms.filter((room) => room.availabilityStatus === 'Limited' || (room.availableUnits > 0 && room.availableUnits <= 2));

  return rooms;
}

