import { Router } from "express";
import { getTableByID } from "../controllers/adminControllers.js";
import authorization, { isAdmin } from "../middlewares/authorization.js";

const router = Router();


router.use(authorization);
router.use(isAdmin);
router.get('/get-table/:tableID', getTableByID);

export default router;