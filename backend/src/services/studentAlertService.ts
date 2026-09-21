import { randomUUID } from "node:crypto";
import { prisma } from "../prisma";
import { env } from "../config";
import type { HostelDTO, StudentAlertSubscriptionCreate } from "../types";

const emailPattern = /^\S+@\S+\.\S+$/;

function normalize(value?: string): string | undefined {
  const result = value?.trim();
  return result || undefined;
}

function matches(subscription: {
  preferredArea: string | null;
  roomType: string | null;
  budget: string | null;
  facilities: string[];
}, hostel: HostelDTO): boolean {
  const offerings = hostel.roomOfferings ?? [];
  const areaMatch = !subscription.preferredArea || hostel.location.toLowerCase().includes(subscription.preferredArea.toLowerCase());
  if (!areaMatch) return false;

  const matchingRooms = offerings.filter((room) => {
    const roomMatch = !subscription.roomType || room.roomType.toLowerCase().includes(subscription.roomType.toLowerCase());
    const budgetNumber = Number.parseInt(subscription.budget?.replace(/[^0-9]/g, '') ?? '', 10);
    const budgetMatch = !Number.isFinite(budgetNumber) || room.price <= budgetNumber;
    const facilitiesMatch = subscription.facilities.length === 0 || subscription.facilities.every((facility) =>
      hostel.facilities.some((available) => available.toLowerCase().includes(facility.toLowerCase())),
    );
    return roomMatch && budgetMatch && facilitiesMatch;
  });

  return matchingRooms.length > 0;
}

async function sendRoomAlert(email: string, unsubscribeToken: string, hostel: HostelDTO): Promise<void> {
  const room = hostel.roomOfferings?.[0];
  if (!env.BREVO_API_KEY || !env.EMAIL_FROM || !room) {
    console.info(`[alerts] Email provider not configured; skipped alert for ${email} (${hostel.name})`);
    return;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME ?? "Dabi" },
      to: [{ email }],
      subject: `A new room may fit what you are looking for: ${hostel.name}`,
      html: `<p>Hi from Dabi,</p><p>A new room listing is available in ${hostel.location}.</p><p><strong>${hostel.name}</strong><br>${room.roomType}<br>GH₵${room.price.toLocaleString()} / ${room.pricingPeriod === "Month" ? "month" : room.pricingPeriod === "Semester" ? "semester" : "academic year"}</p><p><a href="${env.CLIENT_URL}/findroom/rooms?hostel=${encodeURIComponent(hostel.slug)}">View room</a></p><p>You are receiving this because you asked Dabi to alert you about matching rooms.</p><p><a href="${env.CLIENT_URL}/api/student-alerts/unsubscribe/${unsubscribeToken}">Unsubscribe from room alerts</a></p>`,
    }),
  });

  if (!response.ok) {
    console.error(`[alerts] Failed to send room alert to ${email}: ${response.status}`);
  }
}

export async function saveStudentAlertSubscription(input: StudentAlertSubscriptionCreate) {
  const email = input.email.trim().toLowerCase();
  if (!emailPattern.test(email)) throw new Error("Email address is invalid.");

  return prisma.studentAlertSubscription.upsert({
    where: { email },
    update: {
      preferredArea: normalize(input.preferredArea),
      roomType: normalize(input.roomType),
      budget: normalize(input.budget),
      facilities: input.facilities?.map((facility) => facility.trim()).filter(Boolean) ?? [],
      active: true,
    },
    create: {
      id: randomUUID(),
      email,
      preferredArea: normalize(input.preferredArea),
      roomType: normalize(input.roomType),
      budget: normalize(input.budget),
      facilities: input.facilities?.map((facility) => facility.trim()).filter(Boolean) ?? [],
    },
    select: { id: true, email: true, active: true },
  });
}

export async function unsubscribeStudentAlert(token: string): Promise<void> {
  await prisma.studentAlertSubscription.updateMany({ where: { unsubscribeToken: token }, data: { active: false } });
}

export async function notifyStudentsAboutNewRooms(hostel: HostelDTO): Promise<void> {
  const subscriptions = await prisma.studentAlertSubscription.findMany({ where: { active: true } });
  await Promise.all(subscriptions.filter((subscription) => matches(subscription, hostel)).map((subscription) => sendRoomAlert(subscription.email, subscription.unsubscribeToken, hostel)));
}