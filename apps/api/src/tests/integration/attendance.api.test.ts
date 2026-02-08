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
      expect(res.body.error).toContain('exists');
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

  describe('PATCH /api/attendance/:id', () => {
    it('should update an existing attendance record', async () => {
      // Create initial record
      const createRes = await request(app)
        .post('/api/attendance')
        .send({
          uin: '33333333',
          sessionId: '20250931',
          takenBy: 'instructor1',
        });

      // Update (scenario: Jack edits Bob's record from 20250931 to 20251001)
      const updateRes = await request(app)
        .patch(`/api/attendance/${createRes.body._id}`)
        .send({
          sessionId: '20251001',
          operationUser: 'Jack',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.sessionId).toBe('20251001');

      // Verify log was created
      const logs = await Log.find({
        attendanceId: createRes.body._id,
        action: 'EDIT',
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].operationUser).toBe('Jack');
      expect(logs[0].changes[0].field).toBe('sessionId');
      expect(logs[0].changes[0].oldValue).toBe('20250931');
      expect(logs[0].changes[0].newValue).toBe('20251001');
    });

    it('should return 400 when operationUser is missing', async () => {
      const createRes = await request(app)
        .post('/api/attendance')
        .send({
          uin: '44444444',
          sessionId: '20251001',
          takenBy: 'instructor1',
        });

      const updateRes = await request(app)
        .patch(`/api/attendance/${createRes.body._id}`)
        .send({
          sessionId: '20251002',
        });

      expect(updateRes.status).toBe(400);
    });

    it('should return 404 when attendance not found', async () => {
      const res = await request(app)
        .patch('/api/attendance/507f1f77bcf86cd799439011')
        .send({
          sessionId: '20251001',
          operationUser: 'instructor1',
        });

      expect(res.status).toBe(404);
    });

    it('should update multiple fields at once', async () => {
      const createRes = await request(app)
        .post('/api/attendance')
        .send({
          uin: '55555555',
          sessionId: '20251001',
          takenBy: 'instructor1',
        });

      const updateRes = await request(app)
        .patch(`/api/attendance/${createRes.body._id}`)
        .send({
          uin: '55555556',
          sessionId: '20251002',
          operationUser: 'admin',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.uin).toBe('55555556');
      expect(updateRes.body.sessionId).toBe('20251002');

      const logs = await Log.find({
        attendanceId: createRes.body._id,
        action: 'EDIT',
      });
      expect(logs[0].changes).toHaveLength(2);
    });

    it('should reject attempts to modify takenBy field', async () => {
      const createRes = await request(app)
        .post('/api/attendance')
        .send({
          uin: '55555557',
          sessionId: '20251001',
          takenBy: 'instructor1',
        });

      const updateRes = await request(app)
        .patch(`/api/attendance/${createRes.body._id}`)
        .send({
          takenBy: 'instructor2',
          operationUser: 'admin',
        });

      expect(updateRes.status).toBe(400);
      expect(updateRes.body.error).toContain('takenBy');
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

    // Step 3: Jack edits Bob's record (API 2: Edit)
    const bobEdited = await request(app)
      .patch(`/api/attendance/${bobInitial.body._id}`)
      .send({
        sessionId: '20251001', // Correct date
        operationUser: 'Jack',
      });

    expect(bobEdited.status).toBe(200);
    expect(bobEdited.body.sessionId).toBe('20251001');

    // Step 4: Jack views the logs (API 3: View logs)
    const logsRes = await request(app).get('/api/logs');

    expect(logsRes.status).toBe(200);
    expect(logsRes.body.length).toBeGreaterThanOrEqual(3); // At least 3 logs

    // Verify ADD log for Adam
    const adamLog = logsRes.body.find(
      (log: any) => log.affectedUin === 'Adam123' && log.action === 'ADD'
    );
    expect(adamLog).toBeDefined();
    expect(adamLog.operationUser).toBe('Jack');

    // Verify EDIT log for Bob
    const bobEditLog = logsRes.body.find(
      (log: any) => log.affectedUin === 'Bob456' && log.action === 'EDIT'
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

    // Missing operationUser on update
    const createRes = await request(app)
      .post('/api/attendance')
      .send({
        uin: 'TestUser',
        sessionId: '20251001',
        takenBy: 'instructor1',
      });

    const res2 = await request(app)
      .patch(`/api/attendance/${createRes.body._id}`)
      .send({
        sessionId: '20251002',
        // Missing operationUser
      });
    expect(res2.status).toBe(400);
  });
});
