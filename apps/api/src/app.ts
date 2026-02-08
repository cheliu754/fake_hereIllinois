import path from 'path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import attendanceRoutes from './routes/attendance.routes';
import logRoutes from './routes/log.routes';
import { errorHandler } from './middleware/errorHandler';

// Load .env from deploy folder (relative to project root)
dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', 'deploy', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/attendance', attendanceRoutes);
app.use('/logs', logRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
