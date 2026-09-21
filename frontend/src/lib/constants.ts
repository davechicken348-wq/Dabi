export const LOCATIONS = [
  'New Dormaa',
  'Penkwase',
  'Magazine',
  'Campus',
  'Old Dormaa',
  'Tanoso',
  'Pankrono',
  'Anyinam',
] as const;

export const FACILITIES = [
  'Water',
  'ECG',
  'Kitchen',
  'Self-contained',
  'Wi-Fi',
  'Parking',
  'Security',
  'Study Room',
] as const;

export const FACILITY_EMOJIS: Record<string, string> = {
  Water: '💧',
  ECG: '⚡',
  Kitchen: '🍳',
  'Self-contained': '🏠',
  'Wi-Fi': '📶',
  Parking: '🚗',
  Security: '🔒',
  'Study Room': '📚',
};

export const ROOM_TYPES = [
  '1 in 1',
  '2 in 1',
  '3 in 1',
  '4 in 1',
  'Self-contained',
] as const;

export const OCCUPANCY_OPTIONS = [1, 2, 3, 4] as const;

export const DABI_AREA_OPTIONS = ['Around STU', 'Fiapre', 'New Dormaa', 'Abesim'] as const;

export const DABI_ROOM_TYPE_OPTIONS = ['1-in-1', '2-in-1', '3-in-1', '4-in-1', 'Other / Not sure'] as const;

export const DABI_FACILITY_OPTIONS = ['Self-contained', 'Water', 'Kitchen', 'Furnished', 'Near STU', 'Secure/walled compound', 'Other'] as const;

export const PRICE_RANGES = [
  { label: 'Under GH₵2,000', min: 0, max: 2000 },
  { label: 'GH₵2,000 — 2,500', min: 2000, max: 2500 },
  { label: 'GH₵2,500 — 3,000', min: 2500, max: 3000 },
  { label: 'Over GH₵3,000', min: 3000, max: null },
] as const;

export const CURRENCY_SYMBOL = 'GH₵';
