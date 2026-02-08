import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { logService } from '../services/log.service';

const UinParamSchema = z.object({
  uin: z.string().min(1),
});

const SessionIdParamSchema = z.object({
  sessionId: z.string().min(1),
});

export class LogController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await logService.getAllLogs();
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  async getByUin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = UinParamSchema.safeParse(req.params);

      if (!result.success) {
        res.status(400).json({ error: result.error.flatten() });
        return;
      }

      const logs = await logService.getLogsByUin(result.data.uin);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  async getBySessionId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = SessionIdParamSchema.safeParse(req.params);

      if (!result.success) {
        res.status(400).json({ error: result.error.flatten() });
        return;
      }

      const logs = await logService.getLogsBySessionId(result.data.sessionId);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
}

export const logController = new LogController();
