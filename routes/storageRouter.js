import { Router } from "express";
import { getAPIImage, uploadAPIImage } from "../controllers/storageControllers.js";
import authorization from "../middlewares/authorization.js";

const router = Router();

router.get("/apis/images/:imageName", getAPIImage);
router.use(authorization);
router.patch("/apis/images/:apiAlias", uploadAPIImage);

export default router;