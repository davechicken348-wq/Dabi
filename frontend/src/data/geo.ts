export interface School {
  id: string;
  name: string;
  short: string;
  lat: number;
  lng: number;
}

// Campuses students on Dabi care about. The first one is the default
// "school of the user" until they pick another.
export const SCHOOLS: School[] = [
  { id: "stu", name: "Sunyani Technical University", short: "STU", lat: 7.3201, lng: -2.3175 },
  { id: "knust", name: "KNUST (Kumasi)", short: "KNUST", lat: 5.6559, lng: -1.5749 },
  { id: "ug", name: "University of Ghana (Legon)", short: "UG", lat: 5.6506, lng: -0.187 },
  { id: "ucc", name: "University of Cape Coast", short: "UCC", lat: 5.113, lng: -1.291 },
];

export const DEFAULT_SCHOOL_ID = "stu";

export function getSchool(id: string | null | undefined): School {
  return SCHOOLS.find((s) => s.id === id) ?? SCHOOLS[0];
}

// Great-circle distance between two coordinates, in kilometres.
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Straight-line ("as the crow flies") distance from a hostel to the school.
// Uses the hostel's precise coordinates when present; otherwise falls back to
// the stored `distanceFromSTU` (e.g. for listings without coordinates yet).
// This is the proximity metric used across listings — it is intentionally NOT
// a road distance; the Directions page computes the actual route instead.
export function hostelDistanceKm(
  h: { lat?: number; lng?: number; distanceFromSTU?: number },
  school: School,
): number {
  if (typeof h.lat === "number" && typeof h.lng === "number") {
    return haversineKm(h.lat, h.lng, school.lat, school.lng);
  }
  return h.distanceFromSTU ?? Infinity;
}

// Approximate coordinates for the areas students stay in around Sunyani.
// Used as a fallback when a hostel listing has no precise lat/lng yet.
export const AREA_COORDS: Record<string, [number, number]> = {
  "around-stu": [7.345, -2.317],
  fiapre: [7.3667, -2.35],
  "new-dormaa": [7.318, -2.272],
  abesim: [7.3167, -2.25],
  "odeneho-kwadaso": [7.343, -2.298],
  sunyani: [7.3399, -2.3268],
  nsoatre: [7.3833, -2.4333],
  chiraa: [7.5333, -2.2833],
  odumase: [7.3667, -2.3167],
  kwatire: [7.3833, -2.3667],
  dumasua: [7.35, -2.3],
  atronie: [7.2167, -2.35],
  "dormaa-ahenkro": [7.2833, -2.45],
};

const AREA_ALIASES: Record<string, string> = {
  "around stu": "around-stu",
  fiapre: "fiapre",
  "new dormaa": "new-dormaa",
  abesim: "abesim",
  "odeneho kwadaso": "odeneho-kwadaso",
  sunyani: "sunyani",
  nsoatre: "nsoatre",
  chiraa: "chiraa",
  odumase: "odumase",
  kwatire: "kwatire",
  dumasua: "dumasua",
  atronie: "atronie",
  "stu gate": "around-stu",
  kwadaso: "odeneho-kwadaso",
  "dormaa ahenkro": "dormaa-ahenkro",
};

export function areaCoords(area: string): [number, number] | null {
  const key = AREA_ALIASES[area.trim().toLowerCase()];
  return key ? AREA_COORDS[key] : null;
}

// Authoritative coordinates for the towns around Sunyani. This is the single
// source of truth for town pins, distance lookups, and coordinate validation.
export interface Town {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const SUNYANI_TOWNS: Town[] = [
  { id: "sunyani", name: "Sunyani (Municipal Capital)", lat: 7.3399, lng: -2.3268 },
  { id: "abesim", name: "Abesim", lat: 7.3167, lng: -2.25 },
  { id: "fiapre", name: "Fiapre", lat: 7.3667, lng: -2.35 },
  { id: "nsoatre", name: "Nsoatre", lat: 7.3833, lng: -2.4333 },
  { id: "chiraa", name: "Chiraa", lat: 7.5333, lng: -2.2833 },
  { id: "odumase", name: "Odumase (Sunyani West Capital)", lat: 7.3667, lng: -2.3167 },
  { id: "kwatire", name: "Kwatire", lat: 7.3833, lng: -2.3667 },
  { id: "dumasua", name: "Dumasua", lat: 7.35, lng: -2.3 },
  { id: "atronie", name: "Atronie", lat: 7.2167, lng: -2.35 },
];

export function townCoords(id: string): [number, number] | null {
  const t = SUNYANI_TOWNS.find((x) => x.id === id);
  return t ? [t.lat, t.lng] : null;
}

// --- Coordinate tracking -------------------------------------------------
// A cheap sanity net so a typo (wrong sign, swapped lat/lng, out-of-range
// value) is caught in the console instead of silently misplacing a pin.

export interface CoordIssue {
  source: string;
  name: string;
  reason: string;
  lat: number;
  lng: number;
}

// Ghana bounding box; covers Sunyani, Kumasi, Accra and Cape Coast so a
// real Ghana coordinate is never flagged, while a swapped/negated value that
// lands outside the country is still caught.
const GHANA_BOUNDS = { minLat: 4.5, maxLat: 11.2, minLng: -3.6, maxLng: 1.3 };

function checkCoord(lat: number, lng: number): string | null {
  if (typeof lat !== "number" || typeof lng !== "number")
    return "Not a number";
  if (Number.isNaN(lat) || Number.isNaN(lng)) return "NaN";
  if (lat < -90 || lat > 90) return "Latitude out of range (-90..90)";
  if (lng < -180 || lng > 180) return "Longitude out of range (-180..180)";
  if (
    lat < GHANA_BOUNDS.minLat ||
    lat > GHANA_BOUNDS.maxLat ||
    lng < GHANA_BOUNDS.minLng ||
    lng > GHANA_BOUNDS.maxLng
  )
    return "Outside the Ghana bounding box";
  return null;
}

export function validateCoordinates(): CoordIssue[] {
  const issues: CoordIssue[] = [];
  const scan = (source: string, name: string, lat: number, lng: number) => {
    const reason = checkCoord(lat, lng);
    if (reason) issues.push({ source, name, reason, lat, lng });
  };
  SCHOOLS.forEach((s) => scan("schools", s.name, s.lat, s.lng));
  Object.entries(AREA_COORDS).forEach(([k, v]) => scan("areas", k, v[0], v[1]));
  SUNYANI_TOWNS.forEach((t) => scan("towns", t.name, t.lat, t.lng));
  return issues;
}

// Runs the coordinate check and warns in dev. Returns the issues so a caller
// can surface them in the UI if it wants to.
export function trackCoordinates(): CoordIssue[] {
  const issues = validateCoordinates();
  if (import.meta.env.DEV && issues.length > 0) {
    console.warn(
      `[geo] ${issues.length} coordinate issue(s) found:`,
      issues,
    );
  }
  return issues;
}
