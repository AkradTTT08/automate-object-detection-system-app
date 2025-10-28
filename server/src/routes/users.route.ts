import { Router } from "express";
import * as ctrl from "../controllers/users.controller";

const router = Router();

router.get('/', ctrl.getUserById);

export default router;