import type { Facility } from "../../admin/types";

export interface Filters {
  location: string;
  budget: string;
  roomType: string;
  availability: string;
  facilities: string[];
  distance: string;
  recentlyVerified: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  location: "any",
  budget: "any",
  roomType: "any",
  availability: "all",
  facilities: [],
  distance: "any",
  recentlyVerified: false,
};

export const LOCATION_OPTIONS = [
  { value: "any", label: "Anywhere" },
  { value: "Around STU", label: "Around STU" },
  { value: "Fiapre", label: "Fiapre" },
  { value: "New Dormaa", label: "New Dormaa" },
  { value: "Abesim", label: "Abesim" },
  { value: "Odeneho Kwadaso", label: "Odeneho Kwadaso" },
  { value: "Sunyani", label: "Sunyani" },
];

export const BUDGET_OPTIONS = [
  { value: "any", label: "Any budget" },
  { value: "under-1500", label: "Under GH₵1,500" },
  { value: "1500-2000", label: "GH₵1,500 – 2,000" },
  { value: "2000-2500", label: "GH₵2,000 – 2,500" },
  { value: "2500+", label: "GH₵2,500+" },
];

export const ROOM_TYPE_OPTIONS = [
  { value: "any", label: "Any room type" },
  { value: "1-in-1", label: "1-in-1" },
  { value: "2-in-1", label: "2-in-1" },
  { value: "3-in-1", label: "3-in-1" },
  { value: "4-in-1+", label: "4-in-1+" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "all", label: "Any availability" },
  { value: "Available", label: "Available" },
  { value: "Limited", label: "Limited availability" },
  { value: "Full", label: "Currently full" },
];

export const DISTANCE_OPTIONS = [
  { value: "any", label: "Any distance" },
  { value: "1", label: "Under 1 km" },
  { value: "2", label: "Under 2 km" },
  { value: "3", label: "Under 3 km" },
  { value: "5", label: "Under 5 km" },
  { value: "10", label: "Under 10 km" },
  { value: "15", label: "Under 15 km" },
];

export const DEFAULT_FACILITIES: Facility[] = [
  { id: "seed-water", key: "water", label: "Water", iconKey: "droplet", category: "Utilities" },
  { id: "seed-electricity", key: "electricity", label: "Electricity", iconKey: "bolt", category: "Utilities" },
  { id: "seed-wifi", key: "wifi", label: "Wi-Fi", iconKey: "wifi", category: "Connectivity" },
  { id: "seed-security", key: "security", label: "Security", iconKey: "lock", category: "Security" },
  { id: "seed-furnished", key: "furnished", label: "Furnished", iconKey: "sofa", category: "Comfort" },
  { id: "seed-kitchen", key: "kitchen", label: "Kitchen", iconKey: "utensils", category: "Kitchen" },
  { id: "seed-washing", key: "washing", label: "Washing Area", iconKey: "wash", category: "Comfort" },
  { id: "seed-parking", key: "parking", label: "Parking", iconKey: "car", category: "Security" },
];

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "distance", label: "Closest to STU" },
  { value: "recent", label: "Recently Verified" },
];

/** Fallback label lookup used before the live catalog has loaded. */
export function facilityLabel(id: string): string {
  return DEFAULT_FACILITIES.find((f) => f.key === id)?.label ?? id;
}
