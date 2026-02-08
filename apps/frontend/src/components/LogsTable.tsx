import { ILog } from '../api/attendanceApi';

interface Props {
  logs: ILog[];
}

function LogsTable({ logs }: Props) {
  return (
    <table border={1} cellPadding={8}>
      <thead>
        <tr>
          <th>Time</th>
          <th>Action</th>
          <th>UIN</th>
          <th>Session</th>
          <th>Operator</th>
          <th>Changes</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log._id}>
            <td>{new Date(log.operationTime).toLocaleString()}</td>
            <td>{log.action}</td>
            <td>{log.affectedUin}</td>
            <td>{log.sessionId}</td>
            <td>{log.operationUser}</td>
            <td>
              {log.changes.length > 0
                ? log.changes.map((c) => `${c.field}: ${c.oldValue} → ${c.newValue}`).join(', ')
                : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default LogsTable;
