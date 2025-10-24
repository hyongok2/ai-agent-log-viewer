import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load default configuration
const defaultConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'default.json'), 'utf-8')
);

// Override with environment variables
const config = {
  ...defaultConfig,
  logPath: process.env.LOG_PATH || defaultConfig.logPath,
  port: process.env.PORT || defaultConfig.port,
};

// Resolve log path to absolute
config.logPath = path.resolve(config.logPath);

export default config;
