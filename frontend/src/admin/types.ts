export type Availability = "Available" | "Limited" | "Full";

export interface AdminHostel {
  id: string;
  name: string;
  location: string;
  /** Yearly price in Ghana Cedis */
  pricePerYear: number;
  roomType: string;
  /** Total number of rooms in the hostel */
  totalRooms?: number;
  /** Total bed capacity across all rooms of this hostel's room type */
  totalBeds?: number;
  /** Beds still free after approved (Active) tenancies are accounted for */
  availableBeds?: number;
  availability: Availability;
  verified: boolean;
  /** Local placeholder asset path */
  image: string;
  /** Additional gallery photos (the first entry is the cover/`image`) */
  photos?: string[];
  note?: string;
  /** Straight-line distance from STU in kilometres */
  distanceFromSTU?: number;
  /** Map coordinates for the hostel pin */
  latitude?: number;
  longitude?: number;
  /** Facility ids available at this hostel */
  facilities: string[];
  /** Owning hostel manager (Owner.id) */
  ownerId?: string;
  createdAt: string;
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  /** Hostel ids managed by this owner */
  hostelIds: string[];
  joinedAt: string;
  active: boolean;
}

/** A facility in the admin-defined catalog (e.g. Wi-Fi, Water, Security). */
export interface Facility {
  id: string;
  /** Stable identifier stored on hostels (e.g. "wifi"). */
  key: string;
  label: string;
  /** Icon key from the frontend icon registry. */
  iconKey?: string | null;
  /** Grouping used in the UI (e.g. "Utilities", "Security"). */
  category?: string | null;
}

export type EnquiryStatus = "New" | "Contacted" | "Resolved";

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  school?: string;
  hostelId?: string;
  hostelName?: string;
  roomType?: string;
  moveInDate?: string;
  message?: string;
  status: EnquiryStatus;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  code: string;
  discountPercent: number;
  /** Optional hostel the deal applies to */
  hostelId?: string;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface AdminUser {
  name: string;
  email: string;
}

export interface DashboardStats {
  totalHostels: number;
  verifiedHostels: number;
  totalOwners: number;
  totalEnquiries: number;
  newEnquiries: number;
  activeDeals: number;
  availability: Record<Availability, number>;
  potentialRevenue: number;
}
