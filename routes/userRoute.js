import { Router } from 'express';
import { getMe } from '../controllers/userControllers.js';
import authorization from '../middlewares/authorization.js';

const router = Router();

router.get("/me",authorization, getMe);

export default router;