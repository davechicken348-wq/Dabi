import type {
  AdminHostel,
  DashboardStats,
  Enquiry,
  EnquiryStatus,
  Owner,
  Availability,
  Deal,
  Facility,
  AdminUser,
} from "../admin/types";
import { load } from "./storage";
import { logout, notifyUnauthorized } from "./auth";
import { API_BASE } from "../config";

/** Shape returned by the backend `/api/tenancies` endpoints. */
export interface TenancyDTO {
  id: string;
  hostelId: string;
  hostelName: string;
  roomType: string;
  beds: number;
  occupantName: string;
  phone: string;
  moveInDate?: string;
  moveOutDate?: string;
  status: "Pending" | "Active" | "Ended";
  source: string;
  createdAt: string;
}

/** Fields the backend accepts when creating a tenancy. */
export interface TenancyCreateInput {
  hostelId: string;
  hostelName: string;
  roomType: string;
  beds?: number;
  occupantName: string;
  phone: string;
  moveInDate?: string;
  moveOutDate?: string;
  status?: "Pending" | "Active" | "Ended";
  source?: string;
}

export interface HostelInput {
  name: string;
  location: string;
  pricePerYear: number;
  roomType: string;
  totalRooms?: number;
  availability: Availability;
  verified: boolean;
  image: string;
  /** Additional gallery photos; the first entry is the cover (`image`) */
  photos?: string[];
  note?: string;
  distanceFromSTU?: number;
  latitude?: number;
  longitude?: number;
  facilities: string[];
  ownerId?: string;
  /** Temp folder used for images uploaded before the hostel id existed. */
  tempFolder?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  return apiSend<T>(path, "GET");
}

async function apiSend<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  let res: Response;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const token = load<string | null>("token", null);
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Is the backend running?");
  }

  if (res.status === 401) {
    // Don't bounce the user while they're actively trying to log in.
    if (!path.startsWith("/api/auth/login")) {
      logout();
      notifyUnauthorized();
    }
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface AuthLoginResult {
  token: string;
  user: AdminUser;
}

export function loginAdmin(
  email: string,
  password: string,
): Promise<AuthLoginResult> {
  return apiSend<AuthLoginResult>("/api/auth/login", "POST", { email, password });
}

export function fetchCurrentAdmin(): Promise<{ user: AdminUser }> {
  return apiSend<{ user: AdminUser }>("/api/auth/me", "GET");
}

export function fetchDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/api/dashboard/stats");
}

export function fetchEnquiries(): Promise<Enquiry[]> {
  return apiFetch<Enquiry[]>("/api/enquiries");
}

export type EnquiryUpdate = Partial<Omit<Enquiry, "id" | "createdAt">>;

export function updateEnquiry(
  id: string,
  patch: EnquiryUpdate,
): Promise<Enquiry> {
  return apiSend<Enquiry>(`/api/enquiries/${id}`, "PUT", patch);
}

export function deleteEnquiry(id: string): Promise<void> {
  return apiSend<void>(`/api/enquiries/${id}`, "DELETE");
}

export type EnquiryInput = Omit<Enquiry, "id" | "createdAt" | "status"> & {
  status?: EnquiryStatus;
};

export function createEnquiry(input: EnquiryInput): Promise<Enquiry> {
  return apiSend<Enquiry>("/api/enquiries", "POST", input);
}

export function fetchTenancies(hostelId?: string): Promise<TenancyDTO[]> {
  const qs = hostelId ? `?hostelId=${encodeURIComponent(hostelId)}` : "";
  return apiFetch<TenancyDTO[]>(`/api/tenancies${qs}`);
}

export function createTenancy(input: TenancyCreateInput): Promise<TenancyDTO> {
  return apiSend<TenancyDTO>("/api/tenancies", "POST", input);
}

export function confirmTenancy(id: string): Promise<TenancyDTO> {
  return apiSend<TenancyDTO>(`/api/tenancies/${id}/confirm`, "POST");
}

export function endTenancy(id: string, moveOutDate?: string): Promise<TenancyDTO> {
  return apiSend<TenancyDTO>(`/api/tenancies/${id}/end`, "POST", moveOutDate ? { moveOutDate } : {});
}

export function deleteTenancy(id: string): Promise<void> {
  return apiSend<void>(`/api/tenancies/${id}`, "DELETE");
}

export function fetchHostels(): Promise<AdminHostel[]> {
  return apiFetch<AdminHostel[]>("/api/hostels");
}

export function fetchHostel(id: string): Promise<AdminHostel> {
  return apiFetch<AdminHostel>(`/api/hostels/${id}`);
}

export function createHostel(input: HostelInput): Promise<AdminHostel> {
  return apiSend<AdminHostel>("/api/hostels", "POST", input);
}

export function updateHostel(
  id: string,
  patch: Partial<HostelInput>,
): Promise<AdminHostel> {
  return apiSend<AdminHostel>(`/api/hostels/${id}`, "PUT", patch);
}

export function deleteHostel(id: string): Promise<void> {
  return apiSend<void>(`/api/hostels/${id}`, "DELETE");
}

export async function uploadHostelImage(
  file: File,
  hostelId?: string,
): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  if (hostelId) form.append("hostelId", hostelId);
  // The upload route requires admin auth like every other mutating endpoint,
  // so the token must be attached (other calls go through apiSend/apiFetch).
  const token = load<string | null>("token", null);
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: form,
      headers,
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Is the backend running?");
  }
  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(res.status, message);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export interface OwnerInput {
  name: string;
  phone: string;
  email: string;
  active: boolean;
  hostelIds?: string[];
}

export function fetchOwners(): Promise<Owner[]> {
  return apiFetch<Owner[]>("/api/owners");
}

export function createOwner(input: OwnerInput): Promise<Owner> {
  return apiSend<Owner>("/api/owners", "POST", input);
}

export function updateOwner(
  id: string,
  patch: Partial<OwnerInput>,
): Promise<Owner> {
  return apiSend<Owner>(`/api/owners/${id}`, "PUT", patch);
}

export function deleteOwner(id: string): Promise<void> {
  return apiSend<void>(`/api/owners/${id}`, "DELETE");
}

export interface DealInput {
  title: string;
  description?: string;
  code: string;
  discountPercent: number;
  hostelId?: string;
  active: boolean;
  expiresAt?: string;
}

export function fetchDeals(): Promise<Deal[]> {
  return apiFetch<Deal[]>("/api/deals");
}

export function createDeal(input: DealInput): Promise<Deal> {
  return apiSend<Deal>("/api/deals", "POST", input);
}

export function updateDeal(
  id: string,
  patch: Partial<DealInput>,
): Promise<Deal> {
  return apiSend<Deal>(`/api/deals/${id}`, "PUT", patch);
}

export function deleteDeal(id: string): Promise<void> {
  return apiSend<void>(`/api/deals/${id}`, "DELETE");
}

export interface FacilityInput {
  key: string;
  label: string;
  iconKey?: string;
  category?: string;
}

export function fetchFacilities(): Promise<Facility[]> {
  return apiFetch<Facility[]>("/api/facilities");
}

export function createFacility(input: FacilityInput): Promise<Facility> {
  return apiSend<Facility>("/api/facilities", "POST", input);
}

export function updateFacility(
  id: string,
  patch: Partial<FacilityInput>,
): Promise<Facility> {
  return apiSend<Facility>(`/api/facilities/${id}`, "PUT", patch);
}

export function deleteFacility(id: string): Promise<void> {
  return apiSend<void>(`/api/facilities/${id}`, "DELETE");
}
