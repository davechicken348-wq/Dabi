export interface Hostel {
  id: string;
  name: string;
  location: string;
  pricePerYear: number;
  roomType: string;
  totalRooms?: number;
  availability: 'Available' | 'Limited' | 'Full';
  verified: boolean;
  image: string;
  photos?: string[];
  note?: string;
  distanceFromSTU?: number;
  latitude?: number;
  longitude?: number;
  facilities: string[];
  ownerId?: string;
  createdAt?: string;
}
