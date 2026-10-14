import { Router } from 'express';
import {
  cancelBooking,
  createBooking,
  getBookingByPnr,
  getUserBookings,
} from '../controllers/bookingController';

const router = Router();

router.post('/', createBooking);
router.get('/user', getUserBookings);
router.get('/pnr/:pnr', getBookingByPnr);
router.post('/cancel/:pnr', cancelBooking);

export default router;
