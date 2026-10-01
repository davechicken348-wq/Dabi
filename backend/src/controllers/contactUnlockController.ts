import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/errors";
import * as service from "../services/contactUnlockService";
import { env } from "../config";
import crypto from "crypto";

// POST /api/contact-unlocks/initialize
export const initialize = asyncHandler(async (req: Request, res: Response) => {
  const { roomOfferingId, studentRef, studentEmail, callbackUrl } = req.body as {
    roomOfferingId?: string;
    studentRef?: string;
    studentEmail?: string;
    callbackUrl?: string;
  };

  if (!roomOfferingId?.trim()) throw new ApiError(400, "roomOfferingId is required");
  if (!studentRef?.trim()) throw new ApiError(400, "studentRef is required");
  if (!studentEmail?.trim()) throw new ApiError(400, "studentEmail is required");

  const result = await service.initializeContactUnlock({
    roomOfferingId: roomOfferingId.trim(),
    studentRef: studentRef.trim(),
    studentEmail: studentEmail.trim(),
    callbackUrl: callbackUrl?.trim(),
  });

  res.json(result);
});

// POST /api/contact-unlocks/verify
export const verify = asyncHandler(async (req: Request, res: Response) => {
  const { reference } = req.body as { reference?: string };
  if (!reference?.trim()) throw new ApiError(400, "reference is required");

  const result = await service.verifyAndActivateUnlock(reference.trim());
  res.json(result);
});

// GET /api/contact-unlocks/check?roomOfferingId=...&studentRef=...
export const check = asyncHandler(async (req: Request, res: Response) => {
  const { roomOfferingId, studentRef } = req.query as {
    roomOfferingId?: string;
    studentRef?: string;
  };
  if (!roomOfferingId?.trim() || !studentRef?.trim()) {
    throw new ApiError(400, "roomOfferingId and studentRef are required");
  }

  const unlocked = await service.checkExistingUnlock(roomOfferingId.trim(), studentRef.trim());
  res.json({ unlocked });
});

// GET /api/contact-unlocks/contact?roomOfferingId=...&studentRef=...
export const getContact = asyncHandler(async (req: Request, res: Response) => {
  const { roomOfferingId, studentRef } = req.query as {
    roomOfferingId?: string;
    studentRef?: string;
  };
  if (!roomOfferingId?.trim() || !studentRef?.trim()) {
    throw new ApiError(400, "roomOfferingId and studentRef are required");
  }

  const unlocked = await service.checkExistingUnlock(roomOfferingId.trim(), studentRef.trim());
  if (!unlocked) throw new ApiError(403, "Contact not unlocked. Please complete payment first.");

  const contact = await service.getContactDetails(roomOfferingId.trim());
  res.json(contact);
});

// GET /api/contact-unlocks/fee
export const getFee = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ fee: env.CONTACT_UNLOCK_FEE, currency: env.CONTACT_UNLOCK_CURRENCY });
});

// POST /api/contact-unlocks/webhook  (Paystack webhook — no auth middleware)
export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const secret = env.PAYSTACK_SECRET_KEY;
  if (secret) {
    const signature = req.headers["x-paystack-signature"] as string | undefined;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (signature !== hash) {
      res.status(400).json({ error: "Invalid signature" });
      return;
    }
  }

  await service.handleWebhook(req.body as { event: string; data: { reference: string } });
  res.json({ received: true });
});

// GET /api/contact-unlocks  (admin — protected)
export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await service.listUnlocks());
});
