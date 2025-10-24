import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import apiRoutes from './routes/api.js';
import { scheduleCleanup } from './scheduler/cleanupScheduler.js';

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Log Viewer API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      tree: 'GET /api/tree',
      file: 'GET /api/file?path=<file_path>',
      reload: 'POST /api/reload'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Log Viewer API server running on port ${PORT}`);
  console.log(`Log path: ${config.logPath}`);
  console.log(`Allowed extensions: ${config.fileExtensions.join(', ')}`);

  // Start cleanup scheduler
  const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS || '7', 10);
  console.log(`Log retention: ${retentionDays} days`);

  if (process.env.ENABLE_AUTO_CLEANUP !== 'false') {
    scheduleCleanup();
  } else {
    console.log('Auto cleanup disabled');
  }
});
