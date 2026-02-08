import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance {
  uin: string;
  sessionId: string;
  date?: Date;
  takenBy: string;
}

export interface IAttendanceDocument extends IAttendance, Document {}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    uin: { type: String, required: true },
    sessionId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    takenBy: { type: String, required: true },
  }
);

AttendanceSchema.index({ uin: 1, sessionId: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);