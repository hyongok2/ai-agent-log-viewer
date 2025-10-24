import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

/**
 * Build directory tree structure
 */
export async function getDirectoryTree(dirPath = config.logPath) {
  try {
    const stats = await fs.stat(dirPath);
    const name = path.basename(dirPath);

    if (!stats.isDirectory()) {
      return null;
    }

    const children = await fs.readdir(dirPath);
    const tree = {
      name,
      path: dirPath,
      type: 'directory',
      children: []
    };

    for (const child of children) {
      const childPath = path.join(dirPath, child);
      try {
        const childStats = await fs.stat(childPath);

        if (childStats.isDirectory()) {
          const subTree = await getDirectoryTree(childPath);
          if (subTree) {
            tree.children.push(subTree);
          }
        } else {
          // Check if file matches allowed extensions
          const ext = path.extname(child);
          if (config.fileExtensions.includes(ext)) {
            tree.children.push({
              name: child,
              path: childPath,
              type: 'file',
              size: childStats.size,
              modified: childStats.mtime,
              created: childStats.birthtime
            });
          }
        }
      } catch (err) {
        console.error(`Error processing ${childPath}:`, err.message);
      }
    }

    // Sort children: directories first, then files (all alphabetically by name)
    tree.children.sort((a, b) => {
      if (a.type === 'directory' && b.type === 'directory') {
        return a.name.localeCompare(b.name);
      }
      if (a.type === 'directory') return -1;
      if (b.type === 'directory') return 1;

      // Files sorted alphabetically by name
      return a.name.localeCompare(b.name);
    });

    return tree;
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err.message);
    throw err;
  }
}

/**
 * Read file content
 */
export async function getFileContent(filePath) {
  try {
    // Security: ensure file is within log path
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(config.logPath)) {
      throw new Error('Access denied: path outside log directory');
    }

    const content = await fs.readFile(resolvedPath, 'utf-8');
    const stats = await fs.stat(resolvedPath);

    return {
      path: resolvedPath,
      name: path.basename(resolvedPath),
      content,
      size: stats.size,
      modified: stats.mtime
    };
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err.message);
    throw err;
  }
}

/**
 * Check if log path exists and is accessible
 */
export async function checkLogPath() {
  try {
    const stats = await fs.stat(config.logPath);
    return {
      exists: true,
      isDirectory: stats.isDirectory(),
      path: config.logPath
    };
  } catch (err) {
    return {
      exists: false,
      isDirectory: false,
      path: config.logPath,
      error: err.message
    };
  }
}
