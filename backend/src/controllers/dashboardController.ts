import { asyncHandler } from "../utils/asyncHandler";
import * as service from "../services/dashboardService";

export const stats = asyncHandler(async (_req, res) => {
  res.json(await service.getStats());
});
