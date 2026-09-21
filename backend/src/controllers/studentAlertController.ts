import { asyncHandler } from "../utils/asyncHandler";
import * as service from "../services/studentAlertService";

export const subscribe = asyncHandler(async (req, res) => {
  res.status(201).json(await service.saveStudentAlertSubscription(req.body));
});

export const unsubscribe = asyncHandler(async (req, res) => {
  await service.unsubscribeStudentAlert(req.params.token);
  res.status(204).send();
});