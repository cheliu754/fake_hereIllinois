import mongoose, { Schema, type Document } from "mongoose";
import { IAttendance } from "./Attendance.model";

export type AuditAction = "ADD" | "EDIT" | "REMOVE";

export interface IChange {
  field: keyof IAttendance;
  oldValue: unknown;
  newValue: unknown;
}

export interface ILog {
  attendanceId: string;

  operationUser: string;
  operationTime: Date;

  action: AuditAction;

  affectedUin: string;
  sessionId: string;

  changes: IChange[];

  before: IAttendance | null;
  after: IAttendance | null;
}

export interface ILogDocument extends ILog, Document {}

const ChangeSchema = new Schema<IChange>(
  {
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed, required: true },
    newValue: { type: Schema.Types.Mixed, required: true }
  },
  { _id: false }
);

const AttendanceSnapshotSchema = new Schema<IAttendance>(
  {
    uin: { type: String, required: true },
    sessionId: { type: String, required: true },
    date: { type: Date, required: true },
    takenBy: { type: String, required: true }
  },
  { _id: false }
);

const LogSchema = new Schema<ILogDocument>(
  {
    attendanceId: { type: String, required: true },

    operationUser: { type: String, required: true },
    operationTime: { type: Date, required: true, default: () => new Date() },

    action: { type: String, enum: ["ADD", "EDIT", "REMOVE"], required: true },

    affectedUin: { type: String, required: true },
    sessionId: { type: String, required: true },

    changes: { type: [ChangeSchema], required: true, default: [] },

    before: {
      type: AttendanceSnapshotSchema,
      default: null,
      validate: { validator: (v: unknown) => v !== undefined, message: 'before is required' }
    },
    after: {
      type: AttendanceSnapshotSchema,
      default: null,
      validate: { validator: (v: unknown) => v !== undefined, message: 'after is required' }
    },
  },
  { timestamps: false }
);

LogSchema.index({ operationTime: -1 });
LogSchema.index({ affectedUin: 1, operationTime: -1 });
LogSchema.index({ sessionId: 1, operationTime: -1 });
LogSchema.index({ operationUser: 1, operationTime: -1 });
LogSchema.index({ action: 1, operationTime: -1 });
LogSchema.index({ attendanceId: 1, operationTime: -1 });

export const Log = mongoose.model<ILogDocument>("Log", LogSchema);
