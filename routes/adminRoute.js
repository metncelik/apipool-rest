import { Router } from "express";
import authorization, { isAdmin } from "../middlewares/authorization.js";

const router = Router();

router.use(authorization);
router.use(isAdmin);

export default router;