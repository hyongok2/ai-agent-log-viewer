import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

/**
 * Delete files older than specified days
 */
async function cleanupOldFiles(dirPath, retentionDays) {
  try {
    const stats = await fs.stat(dirPath);

    if (!stats.isDirectory()) {
      return { deleted: 0, errors: 0 };
    }

    const now = Date.now();
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
    let deleted = 0;
    let errors = 0;

    const items = await fs.readdir(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);

      try {
        const itemStats = await fs.stat(itemPath);

        if (itemStats.isDirectory()) {
          // Recursively clean subdirectories
          const result = await cleanupOldFiles(itemPath, retentionDays);
          deleted += result.deleted;
          errors += result.errors;
        } else {
          // Check if file is older than retention period
          const fileAge = now - itemStats.mtime.getTime();

          if (fileAge > retentionMs) {
            await fs.unlink(itemPath);
            deleted++;
            console.log(`Deleted old file: ${itemPath} (age: ${Math.floor(fileAge / (24 * 60 * 60 * 1000))} days)`);
          }
        }
      } catch (err) {
        console.error(`Error processing ${itemPath}:`, err.message);
        errors++;
      }
    }

    return { deleted, errors };
  } catch (err) {
    console.error(`Error cleaning up directory ${dirPath}:`, err.message);
    return { deleted: 0, errors: 1 };
  }
}

/**
 * Run cleanup task
 */
export async function runCleanup() {
  const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS || '7', 10);

  console.log(`Starting log cleanup (retention: ${retentionDays} days)...`);

  const result = await cleanupOldFiles(config.logPath, retentionDays);

  console.log(`Cleanup completed: ${result.deleted} files deleted, ${result.errors} errors`);

  return result;
}

/**
 * Schedule cleanup to run daily at midnight
 */
export function scheduleCleanup() {
  const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS || '7', 10);

  console.log(`Scheduling daily log cleanup (retention: ${retentionDays} days)`);

  // Calculate time until next midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const timeUntilMidnight = tomorrow - now;

  // Schedule first run at midnight
  setTimeout(() => {
    runCleanup();

    // Then schedule to run every 24 hours
    setInterval(() => {
      runCleanup();
    }, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);

  console.log(`First cleanup scheduled in ${Math.floor(timeUntilMidnight / (60 * 60 * 1000))} hours`);
}
