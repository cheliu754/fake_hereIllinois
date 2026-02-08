import { Router } from 'express';
import { logController } from '../controllers/log.controller';

const router = Router();

router.get('/', (req, res, next) => logController.getAll(req, res, next));
router.get('/uin/:uin', (req, res, next) => logController.getByUin(req, res, next));
router.get('/session/:sessionId', (req, res, next) => logController.getBySessionId(req, res, next));

export default router;
