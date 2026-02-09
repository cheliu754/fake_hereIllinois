export interface Attendance {
  _id: string;
  uin: string;
  sessionId: string;
  date: string;
  takenBy: string; // Read-only field, cannot be modified via PATCH
}

export interface AttendanceFormData {
  uin: string;
  sessionId: string;
  takenBy: string;
  operationUser?: string; // Required for update operations
  date?: string; // Optional date field
}
