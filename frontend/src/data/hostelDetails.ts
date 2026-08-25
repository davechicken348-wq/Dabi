import type { Availability } from "./hostels";

export interface RoomType {
  id: string;
  name: string;
  pricePerYear: number;
  capacity: number;
  availability: Availability;
  /** Total beds in this room configuration across the hostel. */
  totalBeds?: number;
  /** Beds currently unoccupied. When present, `availability` is derived from these. */
  availableBeds?: number;
}

/**
 * The brain behind the "smart" availability system: a room's status is a pure
 * function of its real bed inventory rather than a hand-set label. A future
 * backend only needs to keep `totalBeds` / `availableBeds` in sync and every
 * badge, filter and this enquiry form update automatically.
 */
export function deriveAvailability(total?: number, available?: number): Availability {
  if (total == null || available == null) return "Available";
  if (available <= 0) return "Full";
  if (total > 0 && available / total <= 0.25) return "Limited";
  return "Available";
}

/** Human-readable free-bed hint, or null when the inventory isn't tracked yet. */
export function bedsHint(room: RoomType): string | null {
  if (room.totalBeds == null || room.availableBeds == null) return null;
  if (room.availableBeds <= 0) return "No beds free";
  return `${room.availableBeds} of ${room.totalBeds} beds free`;
}

export interface Facility {
  id: string;
  label: string;
  iconKey?: string | null;
  category?: string | null;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

export interface HostelDetail {
  id: string;
  name: string;
  location: string;
  area: string;
  distanceFromSTU: string;
  /** Map coordinates for the hostel pin (lat/lng) */
  lat?: number;
  lng?: number;
  verified: boolean;
  lastVerified: string;
  availability: Availability;
  /** Total bed capacity across all rooms of this hostel's room type. */
  totalBeds?: number;
  /** Beds still free after approved tenancies. */
  availableBeds?: number;
  lastChecked: string;
  description: string;
  facilities: Facility[];
  roomTypes: RoomType[];
  images: GalleryImage[];
  coverImage: string;
  pricePerYear: number;
  roomTypeSummary: string;
}

const galleryImages: GalleryImage[] = [
  { id: "exterior", src: "/images/gallery-exterior.svg", alt: "Exterior of the hostel building", category: "Exterior" },
  { id: "bedroom", src: "/images/gallery-bedroom.svg", alt: "A typical bedroom in the hostel", category: "Bedroom" },
  { id: "bathroom", src: "/images/gallery-bathroom.svg", alt: "Shared bathroom facilities", category: "Bathroom" },
  { id: "kitchen", src: "/images/gallery-kitchen.svg", alt: "Shared kitchen area", category: "Kitchen" },
  { id: "compound", src: "/images/gallery-compound.svg", alt: "The hostel compound and surroundings", category: "Compound" },
  { id: "surroundings", src: "/images/gallery-surroundings.svg", alt: "Local surroundings near the school", category: "Surroundings" },
];

const baseFacilities: Facility[] = [
  { id: "water", label: "Water" },
  { id: "electricity", label: "Electricity" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "kitchen", label: "Kitchen" },
  { id: "parking", label: "Parking" },
  { id: "security", label: "Security" },
  { id: "furnished", label: "Furnished" },
  { id: "washing", label: "Washing Area" },
];

const STU = "Sunyani Technical University";

export const hostelDetails: Record<string, HostelDetail> = {
  "golden-view": {
    id: "golden-view",
    name: "Golden View Hostel",
    location: "Fiapre, Sunyani",
    area: "Fiapre",
    distanceFromSTU: "0.8 km",
    verified: true,
    lastVerified: "2026-08-18",
    availability: "Available",
    lastChecked: "2 days ago",
    description:
      "Golden View Hostel is a student accommodation located in Fiapre, approximately 10 minutes from STU. The hostel offers 2-in-1 rooms with access to water, electricity and a shared kitchen.",
    facilities: baseFacilities,
    roomTypes: [
      { id: "2-in-1", name: "2-in-1", pricePerYear: 2400, capacity: 2, availability: "Available", totalBeds: 12, availableBeds: 9 },
      { id: "3-in-1", name: "3-in-1", pricePerYear: 1900, capacity: 3, availability: "Limited", totalBeds: 9, availableBeds: 2 },
      { id: "4-in-1", name: "4-in-1", pricePerYear: 1500, capacity: 4, availability: "Available", totalBeds: 8, availableBeds: 6 },
    ],
    images: galleryImages,
    coverImage: "/images/hostel-golden-view.svg",
    pricePerYear: 2400,
    roomTypeSummary: "2-in-1",
  },
  "peace-villa": {
    id: "peace-villa",
    name: "Peace Villa",
    location: "New Dormaa, Sunyani",
    area: "New Dormaa",
    distanceFromSTU: "1.4 km",
    verified: true,
    lastVerified: "2026-08-15",
    availability: "Available",
    lastChecked: "5 days ago",
    description:
      "Peace Villa offers affordable shared rooms in New Dormaa with a calm study environment and steady utilities.",
    facilities: baseFacilities,
    roomTypes: [
      { id: "3-in-1", name: "3-in-1", pricePerYear: 2100, capacity: 3, availability: "Available", totalBeds: 10, availableBeds: 7 },
    ],
    images: galleryImages,
    coverImage: "/images/hostel-peace-villa.svg",
    pricePerYear: 2100,
    roomTypeSummary: "3-in-1",
  },
  "royal-heights": {
    id: "royal-heights",
    name: "Royal Heights",
    location: "Abesim, Sunyani",
    area: "Abesim",
    distanceFromSTU: "2.1 km",
    verified: true,
    lastVerified: "2026-08-19",
    availability: "Limited",
    lastChecked: "1 day ago",
    description:
      "Royal Heights provides spacious rooms and reliable power near the main road in Abesim.",
    facilities: baseFacilities,
    roomTypes: [
      { id: "2-in-1", name: "2-in-1", pricePerYear: 2800, capacity: 2, availability: "Limited", totalBeds: 6, availableBeds: 1 },
    ],
    images: galleryImages,
    coverImage: "/images/hostel-royal-heights.svg",
    pricePerYear: 2800,
    roomTypeSummary: "2-in-1",
  },
  "campus-lodge": {
    id: "campus-lodge",
    name: "Campus View Lodge",
    location: "Odeneho Kwadaso, Sunyani",
    area: "Odeneho Kwadaso",
    distanceFromSTU: "1.1 km",
    verified: true,
    lastVerified: "2026-08-17",
    availability: "Available",
    lastChecked: "3 days ago",
    description:
      "Campus View Lodge offers private single rooms for students who prefer a quiet space close to campus.",
    facilities: baseFacilities,
    roomTypes: [
      { id: "1-in-1", name: "1-in-1", pricePerYear: 2000, capacity: 1, availability: "Available", totalBeds: 8, availableBeds: 5 },
    ],
    images: galleryImages,
    coverImage: "/images/hostel-campus-lodge.svg",
    pricePerYear: 2000,
    roomTypeSummary: "1-in-1",
  },
};

export function getHostelDetail(id: string | undefined): HostelDetail | undefined {
  if (!id) return undefined;
  return hostelDetails[id];
}

export { STU };
