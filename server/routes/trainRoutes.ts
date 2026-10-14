import { Router } from 'express';
import {
  checkAvailability,
  getAlternativeRoutes,
  getStations,
  getTrainByNumber,
  searchTrains,
} from '../controllers/trainController';

const router = Router();

router.get('/stations', getStations);
router.get('/search', searchTrains);
router.get('/alternatives', getAlternativeRoutes);
router.get('/availability', checkAvailability);
router.get('/:trainNumber', getTrainByNumber);

export default router;
