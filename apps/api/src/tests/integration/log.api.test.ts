import request from 'supertest';
import app from '../testApp';
import { logService } from '../../services/log.service';

describe('Logs API', () => {
  describe('GET /api/logs', () => {
    it('should return all logs', async () => {
      // Create some logs via attendance operations
      await request(app)
        .post('/api/attendance')
        .send({ uin: '11111111', sessionId: '20251001', takenBy: 'instructor1' });

      await request(app)
        .post('/api/attendance')
        .send({ uin: '22222222', sessionId: '20251001', takenBy: 'instructor1' });

      const res = await request(app).get('/api/logs');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].action).toBe('ADD');
    });

    it('should return logs sorted by operationTime descending', async () => {
      await request(app)
        .post('/api/attendance')
        .send({ uin: '33333331', sessionId: '20251001', takenBy: 'instructor1' });

      await request(app)
        .post('/api/attendance')
        .send({ uin: '33333332', sessionId: '20251001', takenBy: 'instructor1' });

      const res = await request(app).get('/api/logs');

      expect(res.status).toBe(200);
      // Most recent first
      expect(res.body[0].affectedUin).toBe('33333332');
      expect(res.body[1].affectedUin).toBe('33333331');
    });

    it('should return empty array when no logs', async () => {
      const res = await request(app).get('/api/logs');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /api/logs/uin/:uin', () => {
    it('should return logs for specific uin', async () => {
      // Create attendance for specific uin
      const createRes = await request(app)
        .post('/api/attendance')
        .send({ uin: '44444444', sessionId: '20251001', takenBy: 'instructor1' });

      // Update it
      await request(app)
        .patch(`/api/attendance/${createRes.body._id}`)
        .send({ sessionId: '20251002', operationUser: 'instructor2' });

      // Create another attendance for different uin
      await request(app)
        .post('/api/attendance')
        .send({ uin: '55555555', sessionId: '20251001', takenBy: 'instructor1' });

      const res = await request(app).get('/api/logs/uin/44444444');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2); // ADD + EDIT
      res.body.forEach((log: any) => {
        expect(log.affectedUin).toBe('44444444');
      });
    });

    it('should return empty array for non-existent uin', async () => {
      const res = await request(app).get('/api/logs/uin/99999999');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /api/logs/session/:sessionId', () => {
    it('should return logs for specific sessionId', async () => {
      await request(app)
        .post('/api/attendance')
        .send({ uin: '66666661', sessionId: '20251001', takenBy: 'instructor1' });

      await request(app)
        .post('/api/attendance')
        .send({ uin: '66666662', sessionId: '20251001', takenBy: 'instructor1' });

      await request(app)
        .post('/api/attendance')
        .send({ uin: '66666663', sessionId: '20251002', takenBy: 'instructor1' });

      const res = await request(app).get('/api/logs/session/20251001');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      res.body.forEach((log: any) => {
        expect(log.sessionId).toBe('20251001');
      });
    });

    it('should return empty array for non-existent sessionId', async () => {
      const res = await request(app).get('/api/logs/session/99999999');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });
});

// Additional functional tests for logging service
describe('Functional Test: Logging Accountability', () => {
  it('should maintain complete audit trail for all operations', async () => {
    // Create initial attendance
    const createRes = await request(app)
      .post('/api/attendance')
      .send({
        uin: 'AuditTest',
        sessionId: '20251001',
        takenBy: 'instructor1',
      });

    const attendanceId = createRes.body._id;

    // Perform multiple updates
    await request(app)
      .patch(`/api/attendance/${attendanceId}`)
      .send({ sessionId: '20251002', operationUser: 'editor1' });

    await request(app)
      .patch(`/api/attendance/${attendanceId}`)
      .send({ sessionId: '20251003', operationUser: 'editor2' });

    // Get all logs for this uin
    const logsRes = await request(app).get('/api/logs/uin/AuditTest');

    expect(logsRes.status).toBe(200);
    expect(logsRes.body).toHaveLength(3); // 1 ADD + 2 EDIT

    // Verify chronological changes
    const logs = logsRes.body.reverse(); // Oldest first

    // First log: ADD
    expect(logs[0].action).toBe('ADD');
    expect(logs[0].after.sessionId).toBe('20251001');
    expect(logs[0].after.takenBy).toBe('instructor1');

    // Second log: EDIT sessionId
    expect(logs[1].action).toBe('EDIT');
    expect(logs[1].operationUser).toBe('editor1');
    expect(logs[1].before.sessionId).toBe('20251001');
    expect(logs[1].after.sessionId).toBe('20251002');

    // Third log: EDIT sessionId again
    expect(logs[2].action).toBe('EDIT');
    expect(logs[2].operationUser).toBe('editor2');
    expect(logs[2].before.sessionId).toBe('20251002');
    expect(logs[2].after.sessionId).toBe('20251003');
  });

  it('should log before and after snapshots correctly', async () => {
    const createRes = await request(app)
      .post('/api/attendance')
      .send({
        uin: 'SnapshotTest',
        sessionId: '20251001',
        takenBy: 'instructor1',
      });

    await request(app)
      .patch(`/api/attendance/${createRes.body._id}`)
      .send({
        uin: 'SnapshotTestUpdated',
        sessionId: '20251002',
        operationUser: 'admin',
      });

    const logsRes = await request(app).get('/api/logs/uin/SnapshotTestUpdated');
    const editLog = logsRes.body.find((l: any) => l.action === 'EDIT');

    // Verify before snapshot
    expect(editLog.before.uin).toBe('SnapshotTest');
    expect(editLog.before.sessionId).toBe('20251001');
    expect(editLog.before.takenBy).toBe('instructor1');

    // Verify after snapshot
    expect(editLog.after.uin).toBe('SnapshotTestUpdated');
    expect(editLog.after.sessionId).toBe('20251002');
    expect(editLog.after.takenBy).toBe('instructor1');
  });
});
