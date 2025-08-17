import { Router } from 'express';
import cameras from './cameras.routes'
import login from './login.routes';
import register from './register.routes';
import events from './events.routes';

const router = Router();

// Authentication routes
router.use('/auth', login);

// Registration routes
router.use('/register', register);

// Camera routes
router.use('/cameras', cameras);

router.use('/events', events);

export default router;