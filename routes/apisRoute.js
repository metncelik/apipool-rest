import { Router } from 'express';
import {
    addAPI, getAPIs,
    getAPI, getAPIsByQuery,
    getMyAPIs, deleteAPI,
    addInputRealtions,
    updateAPI
} from '../controllers/apisControllers.js';
import authorization, { isAdmin } from '../middlewares/authorization.js';

const router = Router();

router.get("/", getAPIs);
router.get("/my-apis", authorization, getMyAPIs);
router.get("/by-alias/:alias", getAPI);
router.get("/query/", getAPIsByQuery);
router.post("/", authorization, isAdmin, addAPI);
router.post("/inputs", authorization, isAdmin, addAPI);
router.post("/inputs/relations", authorization, isAdmin, addInputRealtions);
router.patch("/", authorization, isAdmin, updateAPI);
router.delete("/:apiId", authorization, deleteAPI);

export default router;