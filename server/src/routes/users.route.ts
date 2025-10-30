import { Router } from "express";
import * as ctrl from "../controllers/users.controller";

const router = Router();


router.patch('/:usr_id/profile', ctrl.updateProfile);
router.patch('/:usr_id/password', ctrl.updatePassword);

router.get('/', ctrl.getUserById);

export default router;