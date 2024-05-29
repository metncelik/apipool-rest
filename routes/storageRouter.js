import { Router } from "express";
import { getModelImage } from "../controllers/storageControllers.js";

const router = Router();

router.get("/models/images/:modelId", getModelImage);

export default router;