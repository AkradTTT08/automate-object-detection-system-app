import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller'

const router = Router();

router.get('/', ctrl.list);
router.get('/:cam_id',ctrl.listMaintenanceByCamId)

export default router;