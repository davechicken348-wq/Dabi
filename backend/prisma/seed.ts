import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import type { HostelDTO, OwnerDTO, EnquiryDTO, DealDTO, TenancyDTO } from "../src/types";

const prisma = new PrismaClient();

// Seeded admin credentials. Defaults keep local/dev working with the familiar
// demo login; override via env in production so the live account never uses the
// demo email/password.
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Dabi Admin";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@dabi.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "dabi1234";

function hash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

const FACILITIES = [
  { key: "water", label: "Water", iconKey: "droplet", category: "Utilities" },
  { key: "electricity", label: "Electricity", iconKey: "bolt", category: "Utilities" },
  { key: "wifi", label: "Wi-Fi", iconKey: "wifi", category: "Connectivity" },
  { key: "security", label: "Security", iconKey: "lock", category: "Security" },
  { key: "furnished", label: "Furnished", iconKey: "sofa", category: "Comfort" },
  { key: "kitchen", label: "Kitchen", iconKey: "utensils", category: "Kitchen" },
  { key: "washing", label: "Washing Area", iconKey: "wash", category: "Comfort" },
  { key: "bathroom", label: "Shared Bathroom", iconKey: "shower", category: "Comfort" },
  { key: "parking", label: "Parking", iconKey: "car", category: "Security" },
];

const owners: OwnerDTO[] = [
  {
    id: "owner_comfort",
    name: "Comfort Mensah",
    phone: "024 123 4567",
    email: "comfort@dabihostels.com",
    hostelIds: ["golden-view", "peace-villa", "dormaa-queen"],
    joinedAt: "2026-07-12",
    active: true,
  },
  {
    id: "owner_kwame",
    name: "Kwame Owusu",
    phone: "020 765 4321",
    email: "kwame@royalheights.com",
    hostelIds: ["royal-heights", "kwadaso-pride"],
    joinedAt: "2026-07-15",
    active: true,
  },
  {
    id: "owner_abena",
    name: "Abena Boateng",
    phone: "027 222 8899",
    email: "abena@campuslodge.com",
    hostelIds: ["campus-lodge", "stu-gate-lodge"],
    joinedAt: "2026-07-20",
    active: true,
  },
  {
    id: "owner_yaw",
    name: "Yaw Frimpong",
    phone: "055 333 1010",
    email: "yaw@fiapreheights.com",
    hostelIds: ["fiapre-heights", "abesim-comfort", "sunyani-view"],
    joinedAt: "2026-08-01",
    active: false,
  },
];

function hostel(
  id: string,
  name: string,
  location: string,
  pricePerYear: number,
  roomType: string,
  availability: HostelDTO["availability"],
  verified: boolean,
  facilities: string[],
  latitude: number,
  longitude: number,
  ownerId?: string,
): HostelDTO {
  return {
    id,
    name,
    location,
    pricePerYear,
    roomType,
    availability,
    verified,
    image: `/images/hostel-${id}.svg`,
    note: `${name} — ${location}.`,
    distanceFromSTU: Math.round((Math.random() * 3 + 0.5) * 10) / 10,
    latitude,
    longitude,
    facilities,
    ownerId,
    createdAt: "2026-07-12T09:00:00.000Z",
  };
}

const hostels: HostelDTO[] = [
  hostel("golden-view", "Golden View Hostel", "Fiapre", 2400, "2-in-1", "Available", true, ["water", "electricity", "wifi", "security", "furnished"], 7.3667, -2.35, "owner_comfort"),
  hostel("peace-villa", "Peace Villa", "New Dormaa", 2100, "3-in-1", "Available", true, ["water", "electricity", "wifi", "kitchen"], 7.318, -2.272, "owner_comfort"),
  hostel("dormaa-queen", "Dormaa Queen", "Dormaa Ahenkro", 1900, "4-in-1", "Limited", true, ["water", "electricity", "security"], 7.2833, -2.45, "owner_comfort"),
  hostel("royal-heights", "Royal Heights", "Abesim", 2800, "2-in-1", "Limited", true, ["water", "electricity", "wifi", "security", "furnished", "washing"], 7.3167, -2.25, "owner_kwame"),
  hostel("kwadaso-pride", "Kwadaso Pride", "Kwadaso", 2200, "3-in-1", "Full", true, ["water", "electricity", "wifi", "bathroom"], 7.34, -2.3, "owner_kwame"),
  hostel("campus-lodge", "Campus View Lodge", "STU Gate", 2600, "1-in-1", "Available", true, ["water", "electricity", "wifi", "security", "furnished"], 7.345, -2.317, "owner_abena"),
  hostel("stu-gate-lodge", "STU Gate Lodge", "STU Gate", 2000, "2-in-1", "Limited", false, ["water", "electricity"], 7.348, -2.314, "owner_abena"),
  hostel("fiapre-heights", "Fiapre Heights", "Fiapre", 2500, "4-in-1", "Available", true, ["water", "electricity", "wifi", "security"], 7.371, -2.346, "owner_yaw"),
  hostel("abesim-comfort", "Abesim Comfort", "Abesim", 1800, "3-in-1", "Full", false, ["water", "electricity"], 7.313, -2.253, "owner_yaw"),
  hostel("sunyani-view", "Sunyani View", "Sunyani", 2300, "2-in-1", "Available", true, ["water", "electricity", "wifi", "furnished"], 7.3399, -2.3268, "owner_yaw"),
];

const enquiries: EnquiryDTO[] = [
  { id: "enq_1", name: "Ama Serwaa", phone: "024 555 1212", school: "Sunyani Technical University", hostelId: "golden-view", hostelName: "Golden View Hostel", roomType: "2-in-1", moveInDate: "2026-09-01", message: "Hi, is a 2-in-1 room still available for the new semester?", status: "New", createdAt: "2026-08-18T10:15:00.000Z" },
  { id: "enq_2", name: "Kofi Asante", phone: "020 444 9090", school: "STU", hostelId: "royal-heights", hostelName: "Royal Heights", roomType: "2-in-1", moveInDate: "2026-09-05", message: "Looking for reliable power. Can I book a viewing?", status: "Contacted", createdAt: "2026-08-17T14:40:00.000Z" },
  { id: "enq_3", name: "Efua Mensah", phone: "027 333 7788", school: "Sunyani Technical University", hostelId: "campus-lodge", hostelName: "Campus View Lodge", roomType: "1-in-1", moveInDate: "2026-08-25", status: "New", createdAt: "2026-08-19T08:05:00.000Z" },
  { id: "enq_4", name: "Yaw Owusu", phone: "055 222 4545", school: "STU", hostelId: "fiapre-heights", hostelName: "Fiapre Heights", roomType: "4-in-1", moveInDate: "2026-09-10", message: "Do you have washing area access?", status: "Resolved", createdAt: "2026-08-14T11:20:00.000Z" },
  { id: "enq_5", name: "Akosua Gyamfi", phone: "024 888 2323", school: "Sunyani Technical University", hostelId: "peace-villa", hostelName: "Peace Villa", roomType: "3-in-1", moveInDate: "2026-09-01", status: "New", createdAt: "2026-08-20T07:30:00.000Z" },
];

const deals: DealDTO[] = [
  { id: "deal_1", title: "Early Bird 2026", description: "Book before September and save on yearly rent.", code: "EARLYBIRD", discountPercent: 10, active: true, expiresAt: "2026-09-30", createdAt: "2026-07-25" },
  { id: "deal_2", title: "STU Student Special", description: "Exclusive discount for Sunyani Technical University students.", code: "STU10", discountPercent: 12, hostelId: "campus-lodge", active: true, expiresAt: "2026-12-15", createdAt: "2026-08-02" },
  { id: "deal_3", title: "Summer Clearance", description: "Limited rooms at a reduced rate.", code: "SUMMER", discountPercent: 8, active: false, expiresAt: "2026-08-31", createdAt: "2026-06-30" },
];

const tenancies: TenancyDTO[] = [
  { id: "ten_1", hostelId: "golden-view", hostelName: "Golden View Hostel", roomType: "2-in-1", beds: 1, occupantName: "Kwame A.", phone: "024 111 2233", moveInDate: "2026-09-01", status: "Active", source: "admin", createdAt: "2026-08-10T09:00:00.000Z" },
  { id: "ten_2", hostelId: "royal-heights", hostelName: "Royal Heights", roomType: "2-in-1", beds: 1, occupantName: "Ama B.", phone: "024 444 5566", moveInDate: "2026-09-05", status: "Pending", source: "self", createdAt: "2026-08-12T12:00:00.000Z" },
  { id: "ten_3", hostelId: "campus-lodge", hostelName: "Campus View Lodge", roomType: "1-in-1", beds: 1, occupantName: "Yaa K.", phone: "020 777 1212", moveInDate: "2026-08-25", status: "Active", source: "admin", createdAt: "2026-08-05T10:00:00.000Z" },
];

async function main() {
  // Reset in dependency order.
  await prisma.enquiry.deleteMany();
  await prisma.tenancy.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.admin.deleteMany();

  await prisma.facility.createMany({
    data: FACILITIES.map((f) => ({
      key: f.key,
      label: f.label,
      iconKey: f.iconKey,
      category: f.category,
    })),
  });
  const facilityByKey = Object.fromEntries(
    (await prisma.facility.findMany()).map((f) => [f.key, f.id]),
  );

  for (const o of owners) {
    await prisma.owner.create({
      data: {
        id: o.id,
        name: o.name,
        phone: o.phone,
        email: o.email,
        active: o.active,
        joinedAt: new Date(o.joinedAt),
      },
    });
  }

  for (const h of hostels) {
    await prisma.hostel.create({
      data: {
        id: h.id,
        name: h.name,
        location: h.location,
        pricePerYear: h.pricePerYear,
        roomType: h.roomType,
        availability: h.availability,
        verified: h.verified,
        image: h.image,
        note: h.note,
        distanceFromSTU: h.distanceFromSTU,
        latitude: h.latitude,
        longitude: h.longitude,
        ownerId: h.ownerId,
        createdAt: new Date(h.createdAt),
        facilities: {
          connect: h.facilities.map((key) => ({ id: facilityByKey[key] })),
        },
      },
    });
  }

  for (const e of enquiries) {
    await prisma.enquiry.create({ data: { ...e, moveInDate: e.moveInDate ? new Date(e.moveInDate) : null } });
  }

  for (const d of deals) {
    await prisma.deal.create({
      data: {
        ...d,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
        createdAt: new Date(d.createdAt),
      },
    });
  }

  for (const t of tenancies) {
    await prisma.tenancy.create({
      data: {
        ...t,
        moveInDate: t.moveInDate ? new Date(t.moveInDate) : null,
      },
    });
  }

  await prisma.admin.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hash(ADMIN_PASSWORD),
    },
  });

  // eslint-disable-next-line no-console
  console.log(
    `Seed complete: 10 hostels, 4 owners, 5 enquiries, 3 tenancies, 3 deals, 1 admin (${ADMIN_EMAIL}).`,
  );
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
