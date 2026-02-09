import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service';

const CreateAttendanceSchema = z.object({
  uin: z.string().min(1),
  sessionId: z.string().min(1),
  date: z.coerce.date().optional(),
  takenBy: z.string().min(1),
});

const UpdateAttendanceSchema = z.object({
  uin: z.string().min(1),
  sessionId: z.string().min(1),
  operationUser: z.string().min(1),
});

const IdParamSchema = z.object({
  id: z.string().min(1),
});

export class AttendanceController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = CreateAttendanceSchema.safeParse(req.body);

      if (!result.success) {
        res.status(400).json({ error: result.error.flatten() });
        return;
      }

      const { uin, sessionId, date, takenBy } = result.data;

      const attendance = await attendanceService.create(
        { uin, sessionId, date, takenBy },
        takenBy
      );

      res.status(201).json(attendance);
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({ error: 'This student\'s attendance has already been taken for this session' });
        return;
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idResult = IdParamSchema.safeParse(req.params);

      if (!idResult.success) {
        res.status(400).json({ error: idResult.error.flatten() });
        return;
      }

      const { id } = idResult.data;

      const result = UpdateAttendanceSchema.safeParse(req.body);

      if (!result.success) {
        res.status(400).json({ error: result.error.flatten() });
        return;
      }

      const { operationUser, uin, sessionId } = result.data;

      const updated = await attendanceService.update(
        id,
        { uin, sessionId, takenBy: operationUser },
        operationUser
      );

      if (!updated) {
        res.status(404).json({ error: 'Attendance record not found' });
        return;
      }

      res.json(updated);
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({ error: 'This student\'s attendance has already been taken for this session' });
        return;
      }
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = await attendanceService.findAll();
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idResult = IdParamSchema.safeParse(req.params);

      if (!idResult.success) {
        res.status(400).json({ error: idResult.error.flatten() });
        return;
      }

      const { id } = idResult.data;

      const record = await attendanceService.findById(id);

      if (!record) {
        res.status(404).json({ error: 'Attendance record not found' });
        return;
      }

      res.json(record);
    } catch (error) {
      next(error);
    }
  }
}

export const attendanceController = new AttendanceController();
