import { http, HttpResponse } from "msw";

const API_BASE_URL = "https://api.here.illinihouse.space";

// Mock data
export const mockAttendanceRecords = [
  {
    _id: "1",
    uin: "123456789",
    sessionId: "20260208",
    date: "2026-02-08T10:00:00.000Z",
    takenBy: "John Doe",
  },
  {
    _id: "2",
    uin: "987654321",
    sessionId: "20260208",
    date: "2026-02-08T10:05:00.000Z",
    takenBy: "John Doe",
  },
  {
    _id: "3",
    uin: "456789123",
    sessionId: "20260207",
    date: "2026-02-07T14:30:00.000Z",
    takenBy: "Jane Smith",
  },
];

export const mockAuditLogs = [
  {
    _id: "log1",
    attendanceId: "1",
    operationUser: "John Doe",
    operationTime: "2026-02-08T10:00:00.000Z",
    action: "ADD" as const,
    changes: [],
    before: null,
    after: mockAttendanceRecords[0],
  },
  {
    _id: "log2",
    attendanceId: "2",
    operationUser: "John Doe",
    operationTime: "2026-02-08T10:05:00.000Z",
    action: "ADD" as const,
    changes: [],
    before: null,
    after: mockAttendanceRecords[1],
  },
];

export const handlers = [
  // GET /attendance - Get all attendance records
  http.get(`${API_BASE_URL}/attendance`, () => {
    return HttpResponse.json(mockAttendanceRecords);
  }),

  // POST /attendance - Create new attendance record
  http.post(`${API_BASE_URL}/attendance`, async ({ request }) => {
    const body = (await request.json()) as {
      uin: string;
      sessionId: string;
      takenBy: string;
    };
    const newRecord = {
      _id: String(Date.now()),
      uin: body.uin,
      sessionId: body.sessionId,
      date: new Date().toISOString(),
      takenBy: body.takenBy,
    };
    return HttpResponse.json(newRecord, { status: 201 });
  }),

  // PUT /attendance/:id - Update attendance record
  http.put(`${API_BASE_URL}/attendance/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as {
      uin: string;
      sessionId: string;
      operationUser: string;
    };
    const existingRecord = mockAttendanceRecords.find((r) => r._id === id);
    if (!existingRecord) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    const updatedRecord = {
      _id: existingRecord._id,
      uin: body.uin,
      sessionId: body.sessionId,
      date: existingRecord.date,
      takenBy: body.operationUser,
    };
    return HttpResponse.json(updatedRecord);
  }),

  // GET /logs - Get all audit logs
  http.get(`${API_BASE_URL}/logs`, () => {
    return HttpResponse.json(mockAuditLogs);
  }),
];
