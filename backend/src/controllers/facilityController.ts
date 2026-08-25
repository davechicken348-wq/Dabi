import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/errors";
import * as service from "../services/facilityService";
import type { FacilityCreate, FacilityUpdate } from "../types";

export const list = asyncHandler(async (_req, res) => {
  res.json(await service.listFacilities());
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body as FacilityCreate;
  if (!body?.key || !body?.label) {
    throw new ApiError(400, "key and label are required");
  }
  res.status(201).json(await service.createFacility(body));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await service.updateFacility(req.params.id, req.body as FacilityUpdate));
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteFacility(req.params.id);
  res.status(204).send();
});
