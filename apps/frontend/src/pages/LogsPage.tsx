import { useState, useEffect } from 'react';
import { logsApi, ILog } from '../api/attendanceApi';
import LogsTable from '../components/LogsTable';

function LogsPage() {
  const [logs, setLogs] = useState<ILog[]>([]);

  useEffect(() => {
    logsApi.getAll().then(setLogs);
  }, []);

  return (
    <div>
      <h1>Logs</h1>
      <LogsTable logs={logs} />
    </div>
  );
}

export default LogsPage;
