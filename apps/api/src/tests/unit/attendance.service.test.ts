import { attendanceService } from '../../services/attendance.service';
import { Attendance } from '../../models/Attendance.model';
import { Log } from '../../models/Log.model';

describe('AttendanceService', () => {
  describe('create', () => {
    it('should create attendance record and log', async () => {
      const data = {
        uin: '12345678',
        sessionId: '20251001',
        takenBy: 'instructor1',
      };

      const result = await attendanceService.create(data, 'instructor1');

      expect(result.uin).toBe(data.uin);
      expect(result.sessionId).toBe(data.sessionId);
      expect(result.takenBy).toBe(data.takenBy);
      expect(result._id).toBeDefined();

      // Verify log was created
      const logs = await Log.find({ attendanceId: result._id.toString() });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('ADD');
      expect(logs[0].after?.uin).toBe(data.uin);
      expect(logs[0].before).toBeNull();
      expect(logs[0].after).toMatchObject({
        uin: data.uin,
        sessionId: data.sessionId,
        takenBy: data.takenBy,
      });
    });

    it('should set default date if not provided', async () => {
      const data = {
        uin: '87654321',
        sessionId: '20251002',
        takenBy: 'instructor2',
      };

      const result = await attendanceService.create(data, 'instructor2');

      expect(result.date).toBeDefined();
      expect(result.date).toBeInstanceOf(Date);
    });

    it('should fail when creating duplicate attendance (same uin + sessionId)', async () => {
      const data = {
        uin: '11111111',
        sessionId: '20251003',
        takenBy: 'instructor1',
      };

      await attendanceService.create(data, 'instructor1');

      await expect(attendanceService.create(data, 'instructor1')).rejects.toThrow();
    });

    it('should rollback if transaction fails', async () => {
      // Create first record
      const data = {
        uin: '22222222',
        sessionId: '20251004',
        takenBy: 'instructor1',
      };
      await attendanceService.create(data, 'instructor1');

      // Try to create duplicate (should fail)
      try {
        await attendanceService.create(data, 'instructor1');
      } catch (e) {
        // Expected to fail
      }

      // Should still have only 1 attendance and 1 log
      const attendances = await Attendance.find({ uin: data.uin });
      const logs = await Log.find({ 'after.uin': data.uin });
      expect(attendances).toHaveLength(1);
      expect(logs).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should fully replace attendance record and create log with changes', async () => {
      // Create initial record
      const created = await attendanceService.create({
        uin: '33333333',
        sessionId: '20250931',
        takenBy: 'instructor1',
      }, 'instructor1');

      // PUT: full replacement (operationUser becomes takenBy, date preserved)
      const updated = await attendanceService.update(
        created._id.toString(),
        { uin: '33333333', sessionId: '20251001', takenBy: 'Jack' },
        'Jack'
      );

      expect(updated).not.toBeNull();
      expect(updated!.sessionId).toBe('20251001');
      expect(updated!.takenBy).toBe('Jack');

      // Verify log was created with changes
      const logs = await Log.find({
        attendanceId: created._id.toString(),
        action: 'EDIT'
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].operationUser).toBe('Jack');
      const changeFields = logs[0].changes.map((c: any) => c.field);
      expect(changeFields).toContain('sessionId');
      expect(changeFields).toContain('takenBy');
      expect(logs[0].before?.sessionId).toBe('20250931');
      expect(logs[0].after?.sessionId).toBe('20251001');
    });

    it('should return null when updating non-existent record', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await attendanceService.update(
        fakeId,
        { uin: '99999999', sessionId: '20251001', takenBy: 'instructor1' },
        'instructor1'
      );

      expect(result).toBeNull();
    });

    it('should not create log entry when no changes made', async () => {
      const created = await attendanceService.create({
        uin: '44444444',
        sessionId: '20251005',
        takenBy: 'instructor1',
      }, 'instructor1');

      // PUT with same values — no changes
      await attendanceService.update(
        created._id.toString(),
        { uin: '44444444', sessionId: '20251005', takenBy: 'instructor1' },
        'instructor1'
      );

      const logs = await Log.find({
        attendanceId: created._id.toString(),
        action: 'EDIT'
      });

      // No log should be created when no actual changes
      expect(logs).toHaveLength(0);
    });

    it('should track all field changes', async () => {
      const created = await attendanceService.create({
        uin: '55555555',
        sessionId: '20251006',
        takenBy: 'instructor1',
      }, 'instructor1');

      await attendanceService.update(
        created._id.toString(),
        {
          uin: '55555556',
          sessionId: '20251007',
          takenBy: 'admin',
        },
        'admin'
      );

      const logs = await Log.find({
        attendanceId: created._id.toString(),
        action: 'EDIT'
      });

      // uin, sessionId, takenBy changed (not date)
      expect(logs[0].changes).toHaveLength(3);
      const fields = logs[0].changes.map((c: any) => c.field);
      expect(fields).toContain('uin');
      expect(fields).toContain('sessionId');
      expect(fields).toContain('takenBy');
    });
  });

  describe('findById', () => {
    it('should find attendance by id', async () => {
      const created = await attendanceService.create({
        uin: '66666666',
        sessionId: '20251008',
        takenBy: 'instructor1',
      }, 'instructor1');

      const found = await attendanceService.findById(created._id.toString());

      expect(found).not.toBeNull();
      expect(found!.uin).toBe('66666666');
    });

    it('should return null for non-existent id', async () => {
      const found = await attendanceService.findById('507f1f77bcf86cd799439011');
      expect(found).toBeNull();
    });
  });

  describe('findByUinAndSession', () => {
    it('should find attendance by uin and sessionId', async () => {
      await attendanceService.create({
        uin: '77777777',
        sessionId: '20251009',
        takenBy: 'instructor1',
      }, 'instructor1');

      const found = await attendanceService.findByUinAndSession('77777777', '20251009');

      expect(found).not.toBeNull();
      expect(found!.uin).toBe('77777777');
      expect(found!.sessionId).toBe('20251009');
    });

    it('should return null when not found', async () => {
      const found = await attendanceService.findByUinAndSession('99999999', '00000000');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all attendance records', async () => {
      await attendanceService.create({
        uin: '88888881',
        sessionId: '20251010',
        takenBy: 'instructor1',
      }, 'instructor1');

      await attendanceService.create({
        uin: '88888882',
        sessionId: '20251010',
        takenBy: 'instructor1',
      }, 'instructor1');

      const all = await attendanceService.findAll();

      expect(all).toHaveLength(2);
    });
  });
});
