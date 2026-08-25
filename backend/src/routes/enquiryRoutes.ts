import { Router } from "express";
import * as controller from "../controllers/enquiryController";

const router = Router();

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.getOne);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
