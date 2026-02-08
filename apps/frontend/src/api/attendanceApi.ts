const API_BASE = import.meta.env.VITE_API_URL;

export interface IAttendance {
  _id?: string;
  uin: string;
  sessionId: string;
  date?: string;
  takenBy: string;
}

export interface ILog {
  _id: string;
  attendanceId: string;
  operationUser: string;
  operationTime: string;
  action: 'ADD' | 'EDIT' | 'REMOVE';
  affectedUin: string;
  sessionId: string;
  changes: { field: string; oldValue: unknown; newValue: unknown }[];
  before: IAttendance | null;
  after: IAttendance | null;
}

export const attendanceApi = {
  getAll: async (): Promise<IAttendance[]> => {
    const res = await fetch(`${API_BASE}/attendance`);
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  create: async (data: Omit<IAttendance, '_id'>): Promise<IAttendance> => {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create attendance');
    return res.json();
  },

  update: async (id: string, data: Partial<IAttendance> & { operationUser: string }): Promise<IAttendance> => {
    const res = await fetch(`${API_BASE}/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update attendance');
    return res.json();
  },
};

export const logsApi = {
  getAll: async (): Promise<ILog[]> => {
    const res = await fetch(`${API_BASE}/logs`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },
};
