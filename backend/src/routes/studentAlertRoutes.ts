import { Router } from "express";
import * as controller from "../controllers/studentAlertController";

const router = Router();
router.post("/", controller.subscribe);
router.get("/unsubscribe/:token", controller.unsubscribe);

export default router;