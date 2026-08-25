import { Router } from "express";
import * as controller from "../controllers/dashboardController";

const router = Router();

router.get("/stats", controller.stats);

export default router;
