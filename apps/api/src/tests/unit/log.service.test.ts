import { logService } from '../../services/log.service';

describe('LogService', () => {
  describe('createLog', () => {
    it('should create a log entry', async () => {
      const log = await logService.createLog({
        attendanceId: '507f1f77bcf86cd799439011',
        operationUser: 'instructor1',
        action: 'ADD',
        affectedUin: '12345678',
        sessionId: '20251001',
        changes: [],
        before: null,
        after: {
          uin: '12345678',
          sessionId: '20251001',
          date: new Date(),
          takenBy: 'instructor1',
        },
      });

      expect(log._id).toBeDefined();
      expect(log.action).toBe('ADD');
      expect(log.operationUser).toBe('instructor1');
      expect(log.operationTime).toBeDefined();
    });

    it('should create log with changes for EDIT action', async () => {
      const log = await logService.createLog({
        attendanceId: '507f1f77bcf86cd799439011',
        operationUser: 'Jack',
        action: 'EDIT',
        affectedUin: '12345678',
        sessionId: '20251001',
        changes: [
          { field: 'sessionId', oldValue: '20250931', newValue: '20251001' },
        ],
        before: {
          uin: '12345678',
          sessionId: '20250931',
          date: new Date(),
          takenBy: 'instructor1',
        },
        after: {
          uin: '12345678',
          sessionId: '20251001',
          date: new Date(),
          takenBy: 'instructor1',
        },
      });

      expect(log.action).toBe('EDIT');
      expect(log.changes).toHaveLength(1);
      expect(log.changes[0].field).toBe('sessionId');
      expect(log.before?.sessionId).toBe('20250931');
      expect(log.after?.sessionId).toBe('20251001');
    });
  });

  describe('getAllLogs', () => {
    it('should return all logs sorted by operationTime descending', async () => {
      // Create logs with different times
      await logService.createLog({
        attendanceId: '507f1f77bcf86cd799439011',
        operationUser: 'user1',
        action: 'ADD',
        affectedUin: '11111111',
        sessionId: '20251001',
      });

      await logService.createLog({
        attendanceId: '507f1f77bcf86cd799439012',
        operationUser: 'user2',
        action: 'ADD',
        affectedUin: '22222222',
        sessionId: '20251002',
      });

      const logs = await logService.getAllLogs();

      expect(logs).toHaveLength(2);
      // Most recent first
      expect(logs[0].affectedUin).toBe('22222222');
      expect(logs[1].affectedUin).toBe('11111111');
    });

    it('should return empty array when no logs exist', async () => {
      const logs = await logService.getAllLogs();
      expect(logs).toHaveLength(0);
    });
  });

  describe('getLogsByUin', () => {
    it('should return logs for specific uin', async () => {
      await logService.createLog({
        attendanceId: '507f1f77bcf86cd799439011',
        operationUser: 'user1',
        action: 'ADD',
        affectedUin: '12345678',
        sessionId: '20251001',
      });

      await logService.createLog({
        attendanceId: '507f1f77bcf86cd799439012',
        operationUser: 'user1',
        action: 'EDIT',
        affectedUin: '12345678',
        sessionId: '20251001',
      });

      await logService.createLog({
        attendanceId: '507f1f77bcf86cd799439013',
        operationUser: 'user1',
        action: 'ADD',
        affectedUin: '87654321',
        sessionId: '20251001',
      });

      const logs = await logService.getLogsByUin('12345678');

      expect(logs).toHaveLength(2);
      logs.forEach(log => {
        expect(log.affectedUin).toBe('12345678');
      });
    });

    it('should return empty array for non-existent uin', async () => {
      const logs = await logService.getLogsByUin('99999999');
      expect(logs).toHaveLength(0);
    });
  });

  describe('getLogsBySessionId', () => {
    it('should return logs for specific sessionId', async () => {
      await logService.createLog({
        attendanceId: '507f1f77bcf86cd799439011',
        operationUser: 'user1',
        action: 'ADD',
        affectedUin: '11111111',
        sessionId: '20251001',
      });

      await logService.createLog({
        attendanceId: '507f1f77bcf86cd799439012',
        operationUser: 'user1',
        action: 'ADD',
        affectedUin: '22222222',
        sessionId: '20251001',
      });

      await logService.createLog({
        attendanceId: '507f1f77bcf86cd799439013',
        operationUser: 'user1',
        action: 'ADD',
        affectedUin: '33333333',
        sessionId: '20251002',
      });

      const logs = await logService.getLogsBySessionId('20251001');

      expect(logs).toHaveLength(2);
      logs.forEach(log => {
        expect(log.sessionId).toBe('20251001');
      });
    });

    it('should return empty array for non-existent sessionId', async () => {
      const logs = await logService.getLogsBySessionId('99999999');
      expect(logs).toHaveLength(0);
    });
  });
});
