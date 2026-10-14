import { Router } from 'express';
import { askAiAssistant } from '../controllers/aiController';

const router = Router();

router.post('/assistant', askAiAssistant);

export default router;
