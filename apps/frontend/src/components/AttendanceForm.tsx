import { useState } from 'react';
import { attendanceApi, IAttendance } from '../api/attendanceApi';

interface Props {
  attendance?: IAttendance;
  onSuccess: () => void;
}

function AttendanceForm({ attendance, onSuccess }: Props) {
  const [uin, setUin] = useState(attendance?.uin || '');
  const [sessionId, setSessionId] = useState(attendance?.sessionId || '');
  const [takenBy, setTakenBy] = useState(attendance?.takenBy || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!attendance?._id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await attendanceApi.update(attendance._id!, {
          uin,
          sessionId,
          takenBy,
          operationUser: takenBy,
        });
      } else {
        await attendanceApi.create({ uin, sessionId, takenBy });
      }
      onSuccess();
      if (!isEdit) {
        setUin('');
        setSessionId('');
        setTakenBy('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{isEdit ? 'Edit Attendance' : 'Add Attendance'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>UIN:</label>
        <input value={uin} onChange={(e) => setUin(e.target.value)} required />
      </div>
      <div>
        <label>Session ID:</label>
        <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} required />
      </div>
      <div>
        <label>Taken By:</label>
        <input value={takenBy} onChange={(e) => setTakenBy(e.target.value)} required />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
      </button>
    </form>
  );
}

export default AttendanceForm;
