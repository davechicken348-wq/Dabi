import { Router } from "express";
import * as controller from "../controllers/tenancyController";

const router = Router();

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.getOne);
router.post("/:id/confirm", controller.confirm);
router.post("/:id/end", controller.end);
router.delete("/:id", controller.remove);

export default router;
