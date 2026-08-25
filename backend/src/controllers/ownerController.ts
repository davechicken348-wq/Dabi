import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/errors";
import { prisma } from "../prisma";
import * as service from "../services/ownerService";
import type { OwnerCreate, OwnerUpdate } from "../types";

export const list = asyncHandler(async (_req, res) => {
  res.json(await service.listOwners());
});

export const getOne = asyncHandler(async (req, res) => {
  res.json(await service.getOwner(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body as OwnerCreate;
  if (!body.name || !body.email || !body.phone) {
    throw new ApiError(400, "name, email and phone are required");
  }
  const existing = await prisma.owner.findUnique({
    where: { email: body.email },
  });
  if (existing) {
    throw new ApiError(409, "An owner with this email already exists.");
  }
  res.status(201).json(await service.createOwner(body));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await service.updateOwner(req.params.id, req.body as OwnerUpdate));
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteOwner(req.params.id);
  res.status(204).send();
});
