import express from 'express';
import { getDirectoryTree, getFileContent, checkLogPath } from '../services/fileService.js';
import { runCleanup } from '../scheduler/cleanupScheduler.js';

const router = express.Router();

/**
 * GET /api/tree
 * Get directory tree structure
 */
router.get('/tree', async (req, res) => {
  try {
    const tree = await getDirectoryTree();
    res.json({ success: true, data: tree });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/file
 * Get file content by path
 */
router.get('/file', async (req, res) => {
  try {
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'Path parameter is required'
      });
    }

    const fileData = await getFileContent(path);
    res.json({ success: true, data: fileData });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/reload
 * Reload directory tree (same as GET /tree but using POST for semantic clarity)
 */
router.post('/reload', async (req, res) => {
  try {
    const tree = await getDirectoryTree();
    res.json({ success: true, data: tree });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  const logPathStatus = await checkLogPath();
  const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS || '7', 10);
  const autoCleanup = process.env.ENABLE_AUTO_CLEANUP !== 'false';

  res.json({
    success: true,
    status: 'ok',
    logPath: logPathStatus,
    cleanup: {
      enabled: autoCleanup,
      retentionDays: retentionDays
    }
  });
});

/**
 * POST /api/cleanup
 * Manually trigger log cleanup
 */
router.post('/cleanup', async (req, res) => {
  try {
    console.log('Manual cleanup triggered');
    const result = await runCleanup();
    res.json({
      success: true,
      data: result,
      message: `Cleanup completed: ${result.deleted} files deleted`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
