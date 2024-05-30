import { Router } from "express";
import { addAPIKey, deleteAPIKey, getAPIKeys, getRequests } from "../controllers/apiKeysControllers.js";
import authorization from "../middlewares/authorization.js";

const router = Router();

router.use(authorization);
router.get("/", getAPIKeys);
router.post("/", addAPIKey);
router.get("/requests", getRequests);
router.delete("/:apiKey", deleteAPIKey);

export default router;