import { Router } from "express";
import * as controller from "../controllers/contactUnlockController";

const router = Router();

// Public (student-facing) — no admin token required
router.get("/fee", controller.getFee);
router.get("/check", controller.check);
router.get("/contact", controller.getContact);
router.post("/initialize", controller.initialize);
router.post("/verify", controller.verify);
router.post("/webhook", controller.webhook);

// Admin — protected by the auth middleware in server.ts
router.get("/", controller.list);

export default router;
