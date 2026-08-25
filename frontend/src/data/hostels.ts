export type Availability = "Available" | "Limited" | "Full";

export interface Hostel {
  id: string;
  name: string;
  location: string;
  /** Yearly price in Ghana Cedis */
  pricePerYear: number;
  roomType: string;
  /** Total number of rooms in the hostel */
  totalRooms?: number;
  availability: Availability;
  verified: boolean;
  /** Local placeholder asset; replace with real photo later */
  image: string;
  /** Additional gallery photos (first entry is the cover/`image`) */
  photos?: string[];
  /** Short blurb shown on the card */
  note?: string;
  /** Straight-line distance from STU in kilometres (mock/demo value) */
  distanceFromSTU?: number;
  /** Computed straight-line proximity to the selected school (km) */
  distanceKm?: number;
  /** Map coordinates for the hostel pin (mock/demo value) */
  lat?: number;
  lng?: number;
  /** Facility ids available at this hostel (mock/demo value) */
  facilities?: string[];
  /** Whether the listing was checked recently (mock/demo value) */
  recentlyVerified?: boolean;
}

export const hostels: Hostel[] = [
  {
    id: "golden-view",
    name: "Golden View Hostel",
    location: "Fiapre",
    pricePerYear: 2400,
    roomType: "2-in-1",
    availability: "Available",
    verified: true,
    image: "/images/hostel-golden-view.svg",
    note: "Quiet rooms close to campus with steady water supply.",
    distanceFromSTU: 1.2,
    facilities: ["water", "electricity", "wifi", "security", "furnished"],
    recentlyVerified: true,
  },
  {
    id: "peace-villa",
    name: "Peace Villa",
    location: "New Dormaa",
    pricePerYear: 2100,
    roomType: "3-in-1",
    availability: "Available",
    verified: true,
    image: "/images/hostel-peace-villa.svg",
    note: "Affordable shared rooms with a calm study environment.",
    distanceFromSTU: 2.1,
    facilities: ["water", "electricity", "wifi", "kitchen"],
    recentlyVerified: true,
  },
  {
    id: "royal-heights",
    name: "Royal Heights",
    location: "Abesim",
    pricePerYear: 2800,
    roomType: "2-in-1",
    availability: "Limited",
    verified: true,
    image: "/images/hostel-royal-heights.svg",
    note: "Spacious rooms and reliable power near the main road.",
    distanceFromSTU: 2.6,
    facilities: ["water", "electricity", "wifi", "parking", "security"],
    recentlyVerified: true,
  },
  {
    id: "campus-lodge",
    name: "Campus View Lodge",
    location: "Odeneho Kwadaso",
    pricePerYear: 2000,
    roomType: "1-in-1",
    availability: "Available",
    verified: true,
    image: "/images/hostel-campus-lodge.svg",
    note: "Private single rooms for students who prefer quiet.",
    distanceFromSTU: 1.6,
    facilities: ["water", "electricity", "wifi", "furnished", "washing"],
    recentlyVerified: false,
  },
  {
    id: "stu-gate-lodge",
    name: "STU Gate Lodge",
    location: "Around STU",
    pricePerYear: 3000,
    roomType: "1-in-1",
    availability: "Limited",
    verified: true,
    image: "/images/hostel-golden-view.svg",
    note: "Steps from the campus gate for students who value time.",
    distanceFromSTU: 0.3,
    facilities: ["water", "electricity", "wifi", "security", "furnished", "kitchen"],
    recentlyVerified: true,
  },
  {
    id: "fiapre-heights",
    name: "Fiapre Heights",
    location: "Fiapre",
    pricePerYear: 2300,
    roomType: "4-in-1",
    availability: "Available",
    verified: true,
    image: "/images/hostel-royal-heights.svg",
    note: "Roomy shared accommodation with a quiet study corner.",
    distanceFromSTU: 0.9,
    facilities: ["water", "electricity", "wifi", "parking"],
    recentlyVerified: true,
  },
  {
    id: "dormaa-queen",
    name: "Dormaa Queen Hostel",
    location: "New Dormaa",
    pricePerYear: 1700,
    roomType: "2-in-1",
    availability: "Available",
    verified: true,
    image: "/images/hostel-peace-villa.svg",
    note: "Budget-friendly rooms with a shared kitchen downstairs.",
    distanceFromSTU: 1.8,
    facilities: ["water", "electricity", "wifi", "kitchen"],
    recentlyVerified: false,
  },
  {
    id: "abesim-comfort",
    name: "Abesim Comfort Lodge",
    location: "Abesim",
    pricePerYear: 1900,
    roomType: "3-in-1",
    availability: "Full",
    verified: true,
    image: "/images/hostel-campus-lodge.svg",
    note: "Simple, well-kept rooms close to the Abesim market.",
    distanceFromSTU: 3.0,
    facilities: ["water", "electricity"],
    recentlyVerified: false,
  },
  {
    id: "kwadaso-pride",
    name: "Kwadaso Pride Hostel",
    location: "Odeneho Kwadaso",
    pricePerYear: 2500,
    roomType: "2-in-1",
    availability: "Available",
    verified: true,
    image: "/images/hostel-royal-heights.svg",
    note: "Furnished rooms with steady power and friendly management.",
    distanceFromSTU: 2.3,
    facilities: ["water", "electricity", "wifi", "security", "furnished"],
    recentlyVerified: true,
  },
  {
    id: "sunyani-view",
    name: "Sunyani View Hostels",
    location: "Sunyani",
    pricePerYear: 1500,
    roomType: "4-in-1",
    availability: "Available",
    verified: true,
    image: "/images/hostel-golden-view.svg",
    note: "The most affordable option, with larger shared rooms.",
    distanceFromSTU: 3.2,
    facilities: ["water", "electricity", "security"],
    recentlyVerified: false,
  },
];
