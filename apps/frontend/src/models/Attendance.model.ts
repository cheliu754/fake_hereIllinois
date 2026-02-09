export interface Attendance {
  _id: string;
  uin: string;
  sessionId: string;
  date: string;
  takenBy: string;
}

export interface AttendanceFormData {
  uin: string;
  sessionId: string;
  takenBy: string;
  operationUser?: string; // Required for update operations (becomes new takenBy)
}
