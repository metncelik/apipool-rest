import { Router } from "express";
import { addAPIKey, deleteAPIKey, getOneAPIKey, getApiKeys, getRequests } from "../controllers/apiKeysControllers.js";
import authorization from "../middlewares/authorization.js";

const router = Router();

router.use(authorization);
router.get("/", getApiKeys);
router.get("/get-one", getOneAPIKey);
router.post("/", addAPIKey);
router.get("/requests", getRequests);
router.delete("/:apiKey", deleteAPIKey);

export default router;