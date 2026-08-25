import { asyncHandler } from "../utils/asyncHandler";
import * as service from "../services/enquiryService";
import type { EnquiryUpdate, EnquiryCreate } from "../types";

export const list = asyncHandler(async (_req, res) => {
  res.json(await service.listEnquiries());
});

export const getOne = asyncHandler(async (req, res) => {
  res.json(await service.getEnquiry(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const enquiry = await service.createEnquiry(req.body as EnquiryCreate);
  res.status(201).json(enquiry);
});

export const update = asyncHandler(async (req, res) => {
  res.json(await service.updateEnquiry(req.params.id, req.body as EnquiryUpdate));
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteEnquiry(req.params.id);
  res.status(204).send();
});
