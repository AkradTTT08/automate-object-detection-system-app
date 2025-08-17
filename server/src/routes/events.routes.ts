import { Router } from "express";
import * as ctrl from '../controllers/events.controller';

const router = Router();

router.get('/event-detection', ctrl.listEventDetection);

export default router;
