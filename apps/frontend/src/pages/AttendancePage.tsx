import { useState, useEffect } from 'react';
import { attendanceApi, IAttendance } from '../api/attendanceApi';
import AttendanceForm from '../components/AttendanceForm';

function AttendancePage() {
  const [records, setRecords] = useState<IAttendance[]>([]);
  const [editing, setEditing] = useState<IAttendance | null>(null);

  const fetchRecords = async () => {
    const data = await attendanceApi.getAll();
    setRecords(data);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSuccess = () => {
    fetchRecords();
    setEditing(null);
  };

  return (
    <div>
      <h1>Attendance</h1>
      <AttendanceForm attendance={editing || undefined} onSuccess={handleSuccess} />

      <h2>Records</h2>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>UIN</th>
            <th>Session</th>
            <th>Date</th>
            <th>Taken By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>{r.uin}</td>
              <td>{r.sessionId}</td>
              <td>{r.date ? new Date(r.date).toLocaleString() : '-'}</td>
              <td>{r.takenBy}</td>
              <td>
                <button onClick={() => setEditing(r)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendancePage;
