export interface RoomOption {
  id: string;
  hostelId: string;
  roomOfferingId?: string;
  name: string;
  description: string;
  pricePerYear: number;
  totalUnits: number;
  availableUnits: number;
  availabilityStatus?: 'Available' | 'Limited' | 'Full';
  occupancy: number;
  facilities: string[];
  photos: string[];
  hostelName?: string;
  hostelLocation?: string;
  pricingPeriod?: 'AcademicYear' | 'Semester' | 'Month';
  lastCheckedAt?: string;
}

export interface Hostel {
  id: string;
  name: string;
  location: string;
  address?: string;
  landmark?: string;
  description: string;
  photos: string[];
  facilities: string[];
  roomOptions: RoomOption[];
  verified: boolean;
  checkedAt: string;
  verifiedAt?: string;
  lastCheckedAt?: string;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
  ownerId?: string;
  note?: string;
}

export interface Enquiry {
  id: string;
  roomId: string;
  hostelId: string;
  roomName: string;
  hostelName: string;
  status: 'new' | 'reviewing' | 'contacted' | 'resolved';
  submittedAt: string;
  message?: string;
}

export interface SearchFilters {
  query: string;
  minPrice: number | null;
  maxPrice: number | null;
  location: string;
  occupancy: number | null;
  facilities: string[];
  availability: 'all' | 'available' | 'limited';
}
