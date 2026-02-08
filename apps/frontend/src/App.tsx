import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AttendancePage from './pages/AttendancePage';
import LogsPage from './pages/LogsPage';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Attendance</Link> | <Link to="/logs">Logs</Link>
      </nav>
      <Routes>
        <Route path="/" element={<AttendancePage />} />
        <Route path="/logs" element={<LogsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
