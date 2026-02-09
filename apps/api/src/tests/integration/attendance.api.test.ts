import request from 'supertest';
import app from '../testApp';
import { Attendance } from '../../models/Attendance.model';
import { Log } from '../../models/Log.model';

describe('Attendance API', () => {
  describe('POST /api/attendance', () => {
    it('should create a new attendance record', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .send({
          uin: '12345678',
          sessionId: '20251001',
          takenBy: 'instructor1',
        });

      expect(res.status).toBe(201);
      expect(res.body.uin).toBe('12345678');
      expect(res.body.sessionId).toBe('20251001');
      expect(res.body._id).toBeDefined();

      // Verify log was created
      const logs = await Log.find({ attendanceId: res.body._id });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('ADD');
    });

    it('should return 400 when uin is missing', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .send({
          sessionId: '20251001',
          takenBy: 'instructor1',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 when sessionId is missing', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .send({
          uin: '12345678',
          takenBy: 'instructor1',
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 when takenBy is missing', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .send({
          uin: '12345678',
          sessionId: '20251001',
        });

      expect(res.status).toBe(400);
    });

    it('should return 409 when attendance already exists', async () => {
      await request(app)
        .post('/api/attendance')
        .send({
          uin: '11111111',
          sessionId: '20251001',
          takenBy: 'instructor1',
        });

      const res = await request(app)
        .post('/api/attendance')
        .send({
          uin: '11111111',
          sessionId: '20251001',
          takenBy: 'instructor1',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already been taken');
    });

    it('should accept optional date field', async () => {
      const testDate = '2025-10-01T10:00:00.000Z';
      const res = await request(app)
        .post('/api/attendance')
        .send({
          uin: '22222222',
          sessionId: '20251001',
          takenBy: 'instructor1',
          date: testDate,
        });

      expect(res.status).toBe(201);
      expect(new Date(res.body.date).toISOString()).toBe(testDate);
    });
  });

  describe('PUT /api/attendance/:id', () => {
    it('should fully replace an existing attendance record', async () => {
      // Create initial record
      const createRes = await request(app)
        .post('/api/attendance')
        .send({
          uin: '33333333',
          sessionId: '20250931',
          takenBy: 'instructor1',
        });

      // PUT: full replacement (operationUser becomes takenBy, date preserved)
      const updateRes = await request(app)
        .put(`/api/attendance/${createRes.body._id}`)
        .send({
          uin: '33333333',
          sessionId: '20251001',
          operationUser: 'Jack',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.sessionId).toBe('20251001');
      expect(updateRes.body.takenBy).toBe('Jack');

      // Verify log was created
      const logs = await Log.find({
        attendanceId: createRes.body._id,
        action: 'EDIT',
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].operationUser).toBe('Jack');
      const changeFields = logs[0].changes.map((c: any) => c.field);
      expect(changeFields).toContain('sessionId');
      expect(changeFields).toContain('takenBy');
    });

    it('should return 400 when required fields are missing', async () => {
      const createRes = await request(app)
        .post('/api/attendance')
        .send({
          uin: '44444444',
          sessionId: '20251001',
          takenBy: 'instructor1',
        });

      // Missing uin and operationUser
      const res1 = await request(app)
        .put(`/api/attendance/${createRes.body._id}`)
        .send({
          sessionId: '20251002',
        });
      expect(res1.status).toBe(400);

      // Missing sessionId
      const res2 = await request(app)
        .put(`/api/attendance/${createRes.body._id}`)
        .send({
          uin: '44444444',
          operationUser: 'admin',
        });
      expect(res2.status).toBe(400);
    });

    it('should return 404 when attendance not found', async () => {
      const res = await request(app)
        .put('/api/attendance/507f1f77bcf86cd799439011')
        .send({
          uin: '99999999',
          sessionId: '20251001',
          operationUser: 'instructor1',
        });

      expect(res.status).toBe(404);
    });

    it('should replace all fields and preserve date', async () => {
      const createRes = await request(app)
        .post('/api/attendance')
        .send({
          uin: '55555555',
          sessionId: '20251001',
          takenBy: 'instructor1',
        });

      const originalDate = createRes.body.date;

      const updateRes = await request(app)
        .put(`/api/attendance/${createRes.body._id}`)
        .send({
          uin: '55555556',
          sessionId: '20251002',
          operationUser: 'admin',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.uin).toBe('55555556');
      expect(updateRes.body.sessionId).toBe('20251002');
      expect(updateRes.body.takenBy).toBe('admin');
      expect(updateRes.body.date).toBe(originalDate);

      const logs = await Log.find({
        attendanceId: createRes.body._id,
        action: 'EDIT',
      });
      // uin, sessionId, takenBy changed (not date)
      expect(logs[0].changes).toHaveLength(3);
    });

    it('should set operationUser as new takenBy', async () => {
      const createRes = await request(app)
        .post('/api/attendance')
        .send({
          uin: '55555557',
          sessionId: '20251001',
          takenBy: 'instructor1',
        });

      const updateRes = await request(app)
        .put(`/api/attendance/${createRes.body._id}`)
        .send({
          uin: '55555557',
          sessionId: '20251001',
          operationUser: 'instructor2',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.takenBy).toBe('instructor2');
    });

    it('should return 409 when updating to duplicate uin+sessionId', async () => {
      // Create two records
      await request(app)
        .post('/api/attendance')
        .send({
          uin: '66666661',
          sessionId: '20251010',
          takenBy: 'instructor1',
        });

      const second = await request(app)
        .post('/api/attendance')
        .send({
          uin: '66666662',
          sessionId: '20251010',
          takenBy: 'instructor1',
        });

      // Try to update second record to match first record's uin+sessionId
      const updateRes = await request(app)
        .put(`/api/attendance/${second.body._id}`)
        .send({
          uin: '66666661',
          sessionId: '20251010',
          operationUser: 'admin',
        });

      expect(updateRes.status).toBe(409);
      expect(updateRes.body.error).toContain('already been taken');
    });
  });

  describe('GET /api/attendance', () => {
    it('should return all attendance records', async () => {
      await request(app)
        .post('/api/attendance')
        .send({ uin: '66666661', sessionId: '20251001', takenBy: 'instructor1' });

      await request(app)
        .post('/api/attendance')
        .send({ uin: '66666662', sessionId: '20251001', takenBy: 'instructor1' });

      const res = await request(app).get('/api/attendance');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('should return empty array when no records', async () => {
      const res = await request(app).get('/api/attendance');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /api/attendance/:id', () => {
    it('should return attendance by id', async () => {
      const createRes = await request(app)
        .post('/api/attendance')
        .send({ uin: '77777777', sessionId: '20251001', takenBy: 'instructor1' });

      const res = await request(app).get(`/api/attendance/${createRes.body._id}`);

      expect(res.status).toBe(200);
      expect(res.body.uin).toBe('77777777');
    });

    it('should return 404 when not found', async () => {
      const res = await request(app).get('/api/attendance/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
    });
  });
});

// Functional Test: Complete scenario
describe('Functional Test: Instructor Editing Scenario', () => {
  it('should complete Jack editing attendance records scenario', async () => {
    // Scenario: Jack is an instructor reviewing student attendances

    // Step 1: Jack adds missing attendance for Adam (API 1: Insert)
    const adamAttendance = await request(app)
      .post('/api/attendance')
      .send({
        uin: 'Adam123',
        sessionId: '20251001',
        takenBy: 'Jack',
      });

    expect(adamAttendance.status).toBe(201);
    expect(adamAttendance.body.uin).toBe('Adam123');

    // Step 2: Create Bob's incorrect record first
    const bobInitial = await request(app)
      .post('/api/attendance')
      .send({
        uin: 'Bob456',
        sessionId: '20250931', // Wrong date
        takenBy: 'AutoSystem',
      });

    expect(bobInitial.status).toBe(201);

    // Step 3: Jack edits Bob's record (PUT: full replacement)
    const bobEdited = await request(app)
      .put(`/api/attendance/${bobInitial.body._id}`)
      .send({
        uin: 'Bob456',
        sessionId: '20251001', // Correct date
        operationUser: 'Jack',
      });

    expect(bobEdited.status).toBe(200);
    expect(bobEdited.body.sessionId).toBe('20251001');
    expect(bobEdited.body.takenBy).toBe('Jack');

    // Step 4: Jack views the logs (API 3: View logs)
    const logsRes = await request(app).get('/api/logs');

    expect(logsRes.status).toBe(200);
    expect(logsRes.body.length).toBeGreaterThanOrEqual(3); // At least 3 logs

    // Verify ADD log for Adam
    const adamLog = logsRes.body.find(
      (log: any) => log.after?.uin === 'Adam123' && log.action === 'ADD'
    );
    expect(adamLog).toBeDefined();
    expect(adamLog.operationUser).toBe('Jack');

    // Verify EDIT log for Bob
    const bobEditLog = logsRes.body.find(
      (log: any) => log.after?.uin === 'Bob456' && log.action === 'EDIT'
    );
    expect(bobEditLog).toBeDefined();
    expect(bobEditLog.operationUser).toBe('Jack');
    expect(bobEditLog.changes[0].oldValue).toBe('20250931');
    expect(bobEditLog.changes[0].newValue).toBe('20251001');
  });

  it('should reject request when validation fails', async () => {
    // Scenario: Request is rejected due to missing required fields

    // Missing uin
    const res1 = await request(app)
      .post('/api/attendance')
      .send({
        sessionId: '20251001',
        takenBy: 'instructor1',
      });
    expect(res1.status).toBe(400);

    // Missing required fields on PUT update
    const createRes = await request(app)
      .post('/api/attendance')
      .send({
        uin: 'TestUser',
        sessionId: '20251001',
        takenBy: 'instructor1',
      });

    const res2 = await request(app)
      .put(`/api/attendance/${createRes.body._id}`)
      .send({
        sessionId: '20251002',
        // Missing uin and operationUser
      });
    expect(res2.status).toBe(400);
  });
});
