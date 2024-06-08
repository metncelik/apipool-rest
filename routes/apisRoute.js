import { Router } from 'express';
import {
    addAPI, getAPIs,
    getAPI, getAPIsByAliasQuery,
    getMyAPIs, deleteAPI
} from '../controllers/apisControllers.js';
import authorization, { isAdmin } from '../middlewares/authorization.js';

const router = Router();

router.get("/", getAPIs);
router.get("/my-apis", authorization, getMyAPIs);
router.get("/by-alias/:alias", getAPI);
router.get("/query-alias/", getAPIsByAliasQuery);
router.post("/", authorization, isAdmin, addAPI);
router.post("/input", authorization, isAdmin, addAPI);
router.post("/input/relations", authorization, isAdmin, addAPI);
router.delete("/:apiId", authorization, deleteAPI);

export default router;