import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/errors";
import * as service from "../services/hostelService";
import type { HostelCreate, HostelUpdate } from "../types";

export const list = asyncHandler(async (_req, res) => {
  res.json(await service.listHostels());
});

export const getOne = asyncHandler(async (req, res) => {
  res.json(await service.getHostel(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body as HostelCreate;
  if (!body.name || !body.location || body.pricePerYear == null) {
    throw new ApiError(400, "name, location and pricePerYear are required");
  }
  res.status(201).json(await service.createHostel(body));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await service.updateHostel(req.params.id, req.body as HostelUpdate));
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteHostel(req.params.id);
  res.status(204).send();
});
