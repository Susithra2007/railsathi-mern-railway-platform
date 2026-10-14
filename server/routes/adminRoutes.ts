import { Router } from 'express';
import {
  addTrain,
  getAllBookings,
  getAllUsers,
  getNotifications,
  getSystemStats,
  markNotificationAsRead,
  toggleTrainStatus,
  updateFareRules,
  updateLiveStatus,
} from '../controllers/adminController';

const router = Router();

router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.post('/trains', addTrain);
router.post('/trains/:trainNumber/toggle', toggleTrainStatus);
router.post('/trains/:trainNumber/live-status', updateLiveStatus);
router.post('/fare-rules', updateFareRules);
router.get('/stats', getSystemStats);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);

export default router;
