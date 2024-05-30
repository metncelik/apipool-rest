import { Router } from 'express';
import { addEndpoint, getEndpoints, getEndpoint, getEndpointsByAliasQuery, getMyEndpoints, deleteEndpoint } from '../controllers/endpointsControllers.js';
import authorization, { isAdmin } from '../middlewares/authorization.js';

const router = Router();

router.get("/", getEndpoints);
router.get("/my-endpoints", authorization, getMyEndpoints);
router.get("/by-alias/:alias", getEndpoint);
router.get("/query-alias/", getEndpointsByAliasQuery);
router.post("/", authorization, isAdmin, addEndpoint);
router.delete("/:endpointId", authorization, deleteEndpoint);

export default router;