import express from 'express';
import cors from 'cors';

import attendanceRoutes from '../routes/attendance.routes';
import logRoutes from '../routes/log.routes';
import { errorHandler } from '../middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/attendance', attendanceRoutes);
app.use('/api/logs', logRoutes);

app.use(errorHandler);

export default app;
