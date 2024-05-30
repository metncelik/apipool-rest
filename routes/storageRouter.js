import { Router } from "express";
import { getEndpointImage } from "../controllers/storageControllers.js";

const router = Router();

router.get("/endpoints/images/:endpointId", getEndpointImage);

export default router;