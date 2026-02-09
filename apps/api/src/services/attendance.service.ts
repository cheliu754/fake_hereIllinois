import mongoose from 'mongoose';
import { Attendance, IAttendance, IAttendanceDocument } from '../models/Attendance.model';
import { Log, IChange } from '../models/Log.model';
import {normalizeValueForDiff} from '../common/utils'

export class AttendanceService {
  async create(data: IAttendance, operationUser: string): Promise<IAttendanceDocument> {
    const session = await mongoose.startSession();

    try {
      let saved!: IAttendanceDocument;

      await session.withTransaction(async () => {
        saved = await Attendance.create([data], { session }).then(r => r[0]);

        await Log.create([{
          attendanceId: saved._id.toString(),
          operationUser,
          operationTime: new Date(),
          action: 'ADD',
          changes: [],
          before: null,
          after: {
            uin: saved.uin,
            sessionId: saved.sessionId,
            date: saved.date,
            takenBy: saved.takenBy,
          },
        }], { session });
      });

      return saved;
    } finally {
      session.endSession();
    }
  }


  async update(
    id: string,
    data: Pick<IAttendance, 'uin' | 'sessionId' | 'takenBy'>,
    operationUser: string
  ): Promise<IAttendanceDocument | null> {
    const session = await mongoose.startSession();

    try {
      let updated: IAttendanceDocument | null = null;

      await session.withTransaction(async () => {
        const existing = await Attendance.findById(id, null, { session });
        if (!existing) {
          updated = null;
          return;
        }

        const before: IAttendance = {
          uin: existing.uin,
          sessionId: existing.sessionId,
          date: existing.date,
          takenBy: existing.takenBy,
        };

        // Full replacement: compare all fields for change tracking
        const replacementData: IAttendance = {
          uin: data.uin,
          sessionId: data.sessionId,
          takenBy: data.takenBy,
        };

        const changes: IChange[] = [];
        for (const key of ['uin', 'sessionId', 'takenBy'] as (keyof IAttendance)[]) {
          if (normalizeValueForDiff(replacementData[key]) !== normalizeValueForDiff((existing as any)[key])) {
            changes.push({
              field: key,
              oldValue: (existing as any)[key],
              newValue: replacementData[key],
            });
          }
        }

        // Full replacement: overwrite all fields, keep original date
        existing.uin = data.uin;
        existing.sessionId = data.sessionId;
        existing.takenBy = data.takenBy;
        updated = await existing.save({ session });

        // Skip log if no actual changes
        if (changes.length === 0) {
          return;
        }

        const after: IAttendance = {
          uin: updated.uin,
          sessionId: updated.sessionId,
          date: updated.date,
          takenBy: updated.takenBy,
        };

        await Log.create([{
          attendanceId: id,
          operationUser,
          operationTime: new Date(),
          action: 'EDIT',
          changes,
          before,
          after,
        }], { session });
      });

      return updated;
    } finally {
      session.endSession();
    }
  }

  async findById(id: string): Promise<IAttendanceDocument | null> {
    return Attendance.findById(id);
  }

  async findByUinAndSession(uin: string, sessionId: string): Promise<IAttendanceDocument | null> {
    return Attendance.findOne({ uin, sessionId });
  }

  async findAll(): Promise<IAttendanceDocument[]> {
    return Attendance.find();
  }
}

export const attendanceService = new AttendanceService();
