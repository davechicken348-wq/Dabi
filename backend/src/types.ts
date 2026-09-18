export type Availability = "Available" | "Limited" | "Full";
export type PricingPeriod = "AcademicYear" | "Semester" | "Month";
export type EnquiryStatus = "New" | "Contacted" | "Resolved";

export interface RoomOfferingDTO {
  id: string;
  hostelId: string;
  roomType: string;
  price: number;
  pricingPeriod: PricingPeriod;
  bedsPerRoom?: number;
  totalRooms?: number;
  availableRooms?: number;
  availability: Availability;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HostelDTO {
  id: string;
  slug: string;
  name: string;
  location: string;
  address?: string;
  landmark?: string;
  pricePerYear: number;
  roomType: string;
  totalRooms?: number;
  updatedAt?: string;
  publishedAt?: string;
  roomOfferings?: RoomOfferingDTO[];
  /** Total bed capacity across every room of this hostel's room type. */
  totalBeds?: number;
  /** Beds still free after accounting for approved (Active) tenancies. */
  availableBeds?: number;
  availability: Availability;
  verified: boolean;
  image: string;
  photos?: string[];
  note?: string;
  distanceFromSTU?: number;
  latitude?: number;
  longitude?: number;
  facilities: string[];
  ownerId?: string;
  verifiedAt?: string;
  lastCheckedAt?: string;
  createdAt: string;
}

export type HostelCreate = Omit<HostelDTO, "id" | "createdAt" | "slug"> & {
  slug?: string;
  roomOfferings?: Array<
    Omit<RoomOfferingDTO, "id" | "hostelId" | "createdAt" | "updatedAt"> & {
      id?: string;
    }
  >;
  /**
   * When a hostel is created from the admin UI, images are uploaded to a
   * temporary folder before the hostel id exists. Passing that folder here lets
   * the backend relocate the files into the new hostel's folder so they aren't
   * orphaned in a temp folder.
   */
  tempFolder?: string;
};
export type HostelUpdate = Partial<HostelCreate>;

export interface OwnerDTO {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  hostelIds: string[];
  joinedAt: string;
  active: boolean;
}

export type OwnerCreate = Omit<OwnerDTO, "id" | "joinedAt" | "hostelIds"> & {
  hostelIds?: string[];
};
export type OwnerUpdate = Partial<OwnerCreate>;

export interface FacilityDTO {
  id: string;
  key: string;
  label: string;
  iconKey?: string | null;
  category?: string | null;
}

export type FacilityCreate = {
  key: string;
  label: string;
  iconKey?: string;
  category?: string;
};
export type FacilityUpdate = Partial<FacilityCreate>;

export interface EnquiryDTO {
  id: string;
  name: string;
  phone: string;
  school?: string;
  hostelId?: string;
  hostelName?: string;
  roomOfferingId?: string;
  roomType?: string;
  moveInDate?: string;
  message?: string;
  status: EnquiryStatus;
  createdAt: string;
}

export type EnquiryUpdate = Partial<Omit<EnquiryDTO, "id" | "createdAt">>;

export type EnquiryCreate = Omit<EnquiryDTO, "id" | "createdAt" | "status"> & {
  status?: EnquiryStatus;
};

export type TenancyStatus = "Pending" | "Active" | "Ended";

export interface TenancyDTO {
  id: string;
  hostelId?: string;
  hostelName: string;
  roomOfferingId?: string;
  roomType: string;
  beds: number;
  occupantName: string;
  phone: string;
  moveInDate?: string;
  moveOutDate?: string;
  status: TenancyStatus;
  source: string;
  createdAt: string;
}

export type TenancyCreate = Omit<TenancyDTO, "id" | "createdAt" | "status"> & {
  status?: TenancyStatus;
};

export type TenancyUpdate = Partial<Pick<TenancyDTO, "status" | "moveOutDate">>;

export interface DealDTO {
  id: string;
  title: string;
  description?: string;
  code: string;
  discountPercent: number;
  hostelId?: string;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}

export type DealCreate = Omit<DealDTO, "id" | "createdAt">;
export type DealUpdate = Partial<DealCreate>;

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
