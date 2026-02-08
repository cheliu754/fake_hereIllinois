import { Log, ILog, ILogDocument, AuditAction, IChange } from '../models/Log.model';
import { IAttendance } from '../models/Attendance.model';

export class LogService {
  async createLog(params: {
    attendanceId: string;
    operationUser: string;
    action: AuditAction;
    changes?: IChange[];
    before?: IAttendance | null;
    after?: IAttendance | null;
  }): Promise<ILogDocument> {
    const log = new Log({
      attendanceId: params.attendanceId,
      operationUser: params.operationUser,
      operationTime: new Date(),
      action: params.action,
      changes: params.changes || [],
      before: params.before || null,
      after: params.after || null,
    });

    return log.save();
  }

  async getAllLogs(): Promise<ILog[]> {
    return Log.find().sort({ operationTime: -1 });
  }

  async getLogsByUin(uin: string): Promise<ILog[]> {
    return Log.find({ 'after.uin': uin }).sort({ operationTime: -1 });
  }

  async getLogsBySessionId(sessionId: string): Promise<ILog[]> {
    return Log.find({ 'after.sessionId': sessionId }).sort({ operationTime: -1 });
  }
}

export const logService = new LogService();
