import { Router } from 'express';
import { addModel, getModels, getModel, getModelsByAliasQuery, getMyModels, deleteModel } from '../controllers/modelsControllers.js';
import authorization, { isAdmin } from '../middlewares/authorization.js';

const router = Router();

router.get("/", getModels);
router.get("/my-models", authorization, getMyModels);
router.get("/by-alias/:alias", getModel);
router.get("/query-alias/", getModelsByAliasQuery);
router.post("/", authorization, isAdmin, addModel);
router.delete("/:modelID", authorization, deleteModel);

export default router;