import { Router } from "express";
import { getAPIImage } from "../controllers/storageControllers.js";

const router = Router();

router.get("/apis/images/:imageName", getAPIImage);

export default router;