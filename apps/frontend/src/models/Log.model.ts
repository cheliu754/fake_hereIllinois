import type { Attendance } from "./Attendance.model";

export interface AuditLog {
  _id: string;
  attendanceId: string;
  operationUser: string;
  operationTime: string;
  action: "ADD" | "EDIT" | "REMOVE";
  changes: Change[];
  before: Attendance | null;
  after: Attendance | null;
}

export interface Change {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}
