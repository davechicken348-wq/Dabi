import { asyncHandler } from "../utils/asyncHandler";
import * as service from "../services/tenancyService";
import type { TenancyCreate } from "../types";

export const list = asyncHandler(async (req, res) => {
  const hostelId = typeof req.query.hostelId === "string" ? req.query.hostelId : undefined;
  res.json(await service.listTenancies(hostelId));
});

export const getOne = asyncHandler(async (req, res) => {
  res.json(await service.getTenancy(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const t = await service.createTenancy(req.body as TenancyCreate);
  res.status(201).json(t);
});

export const confirm = asyncHandler(async (req, res) => {
  res.json(await service.setTenancyStatus(req.params.id, "Active"));
});

export const end = asyncHandler(async (req, res) => {
  const moveOutDate = req.body && typeof req.body.moveOutDate === "string" ? req.body.moveOutDate : undefined;
  res.json(await service.setTenancyStatus(req.params.id, "Ended", moveOutDate));
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteTenancy(req.params.id);
  res.status(204).send();
});
