import { Router } from 'express';
import { getProfile, login, register } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', getProfile);

export default router;
