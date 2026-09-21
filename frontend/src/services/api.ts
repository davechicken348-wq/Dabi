import { getToken } from './auth';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
const body = (value: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(value) });
const patch = (value: unknown): RequestInit => ({ method: 'PUT', body: JSON.stringify(value) });
const remove = (): RequestInit => ({ method: 'DELETE' });

export type HostelInput = Record<string, unknown>;
export type OwnerInput = Record<string, unknown>;
export type DealInput = Record<string, unknown>;
export type FacilityInput = Record<string, unknown>;
export interface TenancyDTO {
  id: string; hostelId: string; hostelName: string; roomType: string; occupantName: string;
  phone: string; beds: number; moveInDate?: string; moveOutDate?: string;
  status: string; source?: string; createdAt: string;
}

export async function fetchDashboardStats(): Promise<any> { return request('/dashboard/stats'); }
export async function fetchHostels(): Promise<any[]> { return request('/hostels'); }
export async function fetchHostel(id: string): Promise<any> { return request(`/hostels/${id}`); }
export async function createHostel(value: unknown): Promise<any> { return request('/hostels', body(value)); }
export async function updateHostel(id: string, value: unknown): Promise<any> { return request(`/hostels/${id}`, patch(value)); }
export async function deleteHostel(id: string): Promise<void> { return request(`/hostels/${id}`, remove()); }
export async function fetchOwners(): Promise<any[]> { return request('/owners'); }
export async function createOwner(value: unknown): Promise<any> { return request('/owners', body(value)); }
export async function updateOwner(id: string, value: unknown): Promise<any> { return request(`/owners/${id}`, patch(value)); }
export async function deleteOwner(id: string): Promise<void> { return request(`/owners/${id}`, remove()); }
export async function fetchEnquiries(): Promise<any[]> { return request('/enquiries'); }
export async function createEnquiry(value: unknown): Promise<any> { return request('/enquiries', body(value)); }
export async function subscribeToStudentAlerts(value: unknown): Promise<any> { return request('/student-alerts', body(value)); }
export async function updateEnquiry(id: string, value: unknown): Promise<any> { return request(`/enquiries/${id}`, patch(value)); }
export async function deleteEnquiry(id: string): Promise<void> { return request(`/enquiries/${id}`, remove()); }
export async function fetchDeals(): Promise<any[]> { return request('/deals'); }
export async function createDeal(value: unknown): Promise<any> { return request('/deals', body(value)); }
export async function updateDeal(id: string, value: unknown): Promise<any> { return request(`/deals/${id}`, patch(value)); }
export async function deleteDeal(id: string): Promise<void> { return request(`/deals/${id}`, remove()); }
export async function fetchFacilities(): Promise<any[]> { return request('/facilities'); }
export async function createFacility(value: unknown): Promise<any> { return request('/facilities', body(value)); }
export async function updateFacility(id: string, value: unknown): Promise<any> { return request(`/facilities/${id}`, patch(value)); }
export async function deleteFacility(id: string): Promise<void> { return request(`/facilities/${id}`, remove()); }
export async function fetchTenancies(): Promise<any[]> { return request('/tenancies'); }
export async function createTenancy(value: unknown): Promise<any> { return request('/tenancies', body(value)); }
export async function updateTenancy(id: string, value: unknown): Promise<any> { return request(`/tenancies/${id}`, patch(value)); }
export async function deleteTenancy(id: string): Promise<void> { return request(`/tenancies/${id}`, remove()); }
export async function fetchManagedHostels(): Promise<any[]> { return request('/owners/managed-hostels'); }
export async function uploadHostelImage(file: File, folder?: string): Promise<string> {
  const form = new FormData();
  form.append('image', file);
  if (folder) form.append('folder', folder);

  const token = getToken();
  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  const payload = await response.json();
  return typeof payload?.url === 'string' ? payload.url : String(payload ?? '');
}
export async function confirmTenancy(id: string): Promise<any> { return request(`/tenancies/${id}/confirm`, { method: 'POST' }); }
export async function endTenancy(id: string): Promise<any> { return request(`/tenancies/${id}/end`, { method: 'POST' }); }
