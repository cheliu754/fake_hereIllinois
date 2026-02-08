import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';

const router = Router();

router.get('/', (req, res, next) => attendanceController.findAll(req, res, next));
router.get('/:id', (req, res, next) => attendanceController.findById(req, res, next));
router.post('/', (req, res, next) => attendanceController.create(req, res, next));
router.patch('/:id', (req, res, next) => attendanceController.update(req, res, next));

export default router;
