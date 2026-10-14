import { Router } from 'express';
import {
  forgotPassword,
  getProfile,
  login,
  register,
  updateProfile,
} from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.get('/me', getProfile);
router.put('/me', updateProfile);

export default router;
