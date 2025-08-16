import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller'

const router = Router();

router.get('/', ctrl.list);
router.get('/total', ctrl.total);
router.get('/:cam_id', ctrl.maintenance);

export default router;