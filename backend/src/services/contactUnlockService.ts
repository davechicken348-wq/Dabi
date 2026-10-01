import { prisma } from "../prisma";
import { env } from "../config";
import { ApiError } from "../utils/errors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InitPaymentResult {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  unlockFee: number;
  currency: string;
}

export interface ContactDetails {
  ownerName: string;
  ownerPhone: string;
  viewingHours?: string;
  landmark?: string;
  notes?: string;
}

export interface UnlockRecord {
  id: string;
  studentRef: string;
  studentEmail?: string;
  roomOfferingId: string;
  amount: number;
  currency: string;
  provider: string;
  reference: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  roomType?: string;
  hostelName?: string;
  hostelLocation?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateReference(roomOfferingId: string): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const roomPart = roomOfferingId.slice(0, 8).toUpperCase();
  return `DABI-ROOM-${roomPart}-${unique}`;
}

async function paystackInitialize(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<{ authorization_url: string; access_code: string; reference: string }> {
  if (!env.PAYSTACK_SECRET_KEY) {
    // Dev/test mode: return a mock authorization URL so the flow can be tested
    // without a real Paystack key.
    return {
      authorization_url: `${env.CLIENT_URL}/findroom/rooms?mock_payment=1&ref=${params.reference}`,
      access_code: "mock_access_code",
      reference: params.reference,
    };
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: "GHS",
      metadata: params.metadata,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new ApiError(502, `Payment provider error: ${text}`);
  }

  const json = (await response.json()) as {
    status: boolean;
    data: { authorization_url: string; access_code: string; reference: string };
  };

  if (!json.status) throw new ApiError(502, "Payment initialization failed");
  return json.data;
}

async function paystackVerify(reference: string): Promise<{
  status: "success" | "failed" | "abandoned" | string;
  amount: number;
  currency: string;
}> {
  if (!env.PAYSTACK_SECRET_KEY) {
    // Dev/test mode: treat any reference starting with DABI- as successful.
    return { status: "success", amount: env.CONTACT_UNLOCK_FEE * 100, currency: "GHS" };
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new ApiError(502, `Payment verification error: ${text}`);
  }

  const json = (await response.json()) as {
    status: boolean;
    data: { status: string; amount: number; currency: string };
  };

  if (!json.status) throw new ApiError(502, "Payment verification failed");
  return {
    status: json.data.status,
    amount: json.data.amount,
    currency: json.data.currency,
  };
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function initializeContactUnlock(params: {
  roomOfferingId: string;
  studentRef: string;
  studentEmail: string;
  callbackUrl?: string;
}): Promise<InitPaymentResult> {
  const room = await prisma.roomOffering.findUnique({
    where: { id: params.roomOfferingId },
    include: { hostel: { include: { owner: true } } },
  });
  if (!room) throw new ApiError(404, "Room not found");

  // Check for an existing paid unlock — don't charge again.
  const existing = await prisma.contactUnlock.findFirst({
    where: {
      roomOfferingId: params.roomOfferingId,
      studentRef: params.studentRef,
      status: "Paid",
    },
  });
  if (existing) throw new ApiError(409, "Contact already unlocked for this room");

  const fee = env.CONTACT_UNLOCK_FEE;
  const currency = env.CONTACT_UNLOCK_CURRENCY;
  const reference = generateReference(params.roomOfferingId);
  const callbackUrl = (params.callbackUrl ?? `${env.CLIENT_URL}/findroom/rooms/${params.roomOfferingId}?unlock_ref=`) + reference;

  // Create a Pending unlock record before hitting the payment provider so we
  // have an audit trail even if the provider call fails.
  await prisma.contactUnlock.create({
    data: {
      studentRef: params.studentRef,
      studentEmail: params.studentEmail,
      roomOfferingId: params.roomOfferingId,
      amount: fee,
      currency,
      provider: "paystack",
      reference,
      status: "Pending",
    },
  });

  const psData = await paystackInitialize({
    email: params.studentEmail,
    amountKobo: fee * 100,
    reference,
    callbackUrl,
    metadata: {
      roomOfferingId: params.roomOfferingId,
      studentRef: params.studentRef,
      hostelName: room.hostel.name,
      roomType: room.roomType,
    },
  });

  return {
    reference,
    authorizationUrl: psData.authorization_url,
    accessCode: psData.access_code,
    unlockFee: fee,
    currency,
  };
}

export async function verifyAndActivateUnlock(reference: string): Promise<{
  status: "paid" | "failed";
  contact?: ContactDetails;
}> {
  const unlock = await prisma.contactUnlock.findUnique({ where: { reference } });
  if (!unlock) throw new ApiError(404, "Payment reference not found");

  // Idempotent: already processed.
  if (unlock.status === "Paid") {
    const contact = await getContactDetails(unlock.roomOfferingId);
    return { status: "paid", contact };
  }
  if (unlock.status === "Failed") return { status: "failed" };

  const verification = await paystackVerify(reference);

  if (verification.status === "success") {
    await prisma.contactUnlock.update({
      where: { reference },
      data: { status: "Paid", paidAt: new Date() },
    });
    const contact = await getContactDetails(unlock.roomOfferingId);
    return { status: "paid", contact };
  }

  await prisma.contactUnlock.update({
    where: { reference },
    data: { status: "Failed" },
  });
  return { status: "failed" };
}

export async function handleWebhook(payload: {
  event: string;
  data: { reference: string };
}): Promise<void> {
  if (payload.event !== "charge.success") return;
  const { reference } = payload.data;
  if (!reference) return;

  const unlock = await prisma.contactUnlock.findUnique({ where: { reference } });
  if (!unlock || unlock.status === "Paid") return; // idempotent

  const verification = await paystackVerify(reference);
  if (verification.status === "success") {
    await prisma.contactUnlock.update({
      where: { reference },
      data: { status: "Paid", paidAt: new Date() },
    });
  }
}

export async function getContactDetails(roomOfferingId: string): Promise<ContactDetails> {
  const room = await prisma.roomOffering.findUnique({
    where: { id: roomOfferingId },
    include: { hostel: { include: { owner: true } } },
  });
  if (!room) throw new ApiError(404, "Room not found");

  const owner = room.hostel.owner;
  if (!owner) throw new ApiError(404, "Owner information not available for this room");

  return {
    ownerName: owner.name,
    ownerPhone: owner.phone,
    viewingHours: undefined, // extend when viewing hours field is added to Owner/Hostel
    landmark: room.hostel.landmark ?? undefined,
    notes: room.hostel.note ?? undefined,
  };
}

export async function checkExistingUnlock(roomOfferingId: string, studentRef: string): Promise<boolean> {
  const unlock = await prisma.contactUnlock.findFirst({
    where: { roomOfferingId, studentRef, status: "Paid" },
  });
  return Boolean(unlock);
}

export async function listUnlocks(): Promise<UnlockRecord[]> {
  const unlocks = await prisma.contactUnlock.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      roomOffering: {
        include: { hostel: true },
      },
    },
  });

  return unlocks.map((u) => ({
    id: u.id,
    studentRef: u.studentRef,
    studentEmail: u.studentEmail ?? undefined,
    roomOfferingId: u.roomOfferingId,
    amount: u.amount,
    currency: u.currency,
    provider: u.provider,
    reference: u.reference,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    paidAt: u.paidAt?.toISOString(),
    roomType: u.roomOffering.roomType,
    hostelName: u.roomOffering.hostel.name,
    hostelLocation: u.roomOffering.hostel.location,
  }));
}
