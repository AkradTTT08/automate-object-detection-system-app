import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller'

const router = Router();

router.get('/', ctrl.list);
router.get('/:cam_id/event-detection', ctrl.listEventDetection);


export default router;