import { Router } from 'express';
import {
  advanceSimulationStep,
  checkAvailability,
  getAlternativeRoutes,
  getLiveTrainTracking,
  getStations,
  getTrainByNumber,
  searchTrains,
} from '../controllers/trainController';

const router = Router();

router.get('/stations', getStations);
router.get('/search', searchTrains);
router.get('/alternatives', getAlternativeRoutes);
router.get('/availability', checkAvailability);
router.get('/tracking/:trainNumber', getLiveTrainTracking);
router.post('/simulate-step/:trainNumber', advanceSimulationStep);
router.get('/:trainNumber', getTrainByNumber);

export default router;
