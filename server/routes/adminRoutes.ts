import { Router } from 'express';
import {
  addTrain,
  getAllBookings,
  getNotifications,
  getSystemStats,
  markNotificationAsRead,
  updateLiveStatus,
} from '../controllers/adminController';

const router = Router();

router.get('/bookings', getAllBookings);
router.post('/trains', addTrain);
router.post('/trains/:trainNumber/live-status', updateLiveStatus);
router.get('/stats', getSystemStats);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);

export default router;
