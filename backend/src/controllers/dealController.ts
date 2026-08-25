import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/errors";
import * as service from "../services/dealService";
import type { DealCreate, DealUpdate } from "../types";

export const list = asyncHandler(async (_req, res) => {
  res.json(await service.listDeals());
});

export const getOne = asyncHandler(async (req, res) => {
  res.json(await service.getDeal(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body as DealCreate;
  if (!body.title || !body.code || body.discountPercent == null) {
    throw new ApiError(400, "title, code and discountPercent are required");
  }
  res.status(201).json(await service.createDeal(body));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await service.updateDeal(req.params.id, req.body as DealUpdate));
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteDeal(req.params.id);
  res.status(204).send();
});
