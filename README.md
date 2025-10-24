# AI Agent Log Viewer

**Version: v1.0.0**

Cross-platform log file viewer specialized for LLM and MCP request/response logs. View and browse log files with intelligent JSON formatting and error detection.

## Features

- 📂 **Folder Tree Navigation** - Browse entire directory structure with resizable sidebar
- 📄 **Intelligent Log Viewer** - JSON auto-detection with syntax highlighting
- 🔍 **Search Functionality** - Full-text search with Ctrl+F support
- 🚨 **Error Detection** - Automatic error highlighting in JSON blocks
- 💾 **File Download** - Save logs locally for analysis
- 🔄 **Real-time Reload** - Refresh directory tree on demand
- 🎨 **Syntax Highlighting** - Color-coded JSON keys, values, and types
- 🐳 **Docker Ready** - Easy deployment with versioned images
- 🌐 **Cross-platform** - Works on Linux, Windows, macOS
- ⚙️ **Configurable** - Set log path and file extensions

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Edit docker-compose.yml to set your log directory
# Then start both services:
docker-compose up -d

# Access the UI at http://localhost:5700
```

### Manual Setup

#### Backend

```bash
cd backend
npm install
npm start

# Backend runs on http://localhost:5701
```

#### Frontend

```bash
cd frontend
npm install
npm run dev

# Frontend runs on http://localhost:5700
```

## Configuration

### Frontend Configuration (API URL)

✅ **Runtime Configuration** - Change API URL without rebuilding!

**Development (local):**
```bash
# Edit frontend/public/config.js
window.APP_CONFIG = {
  API_URL: 'http://localhost:5701'
};
```

**Docker Deployment:**

Simply edit the environment variable in `docker-compose.yml`:

```yaml
# docker-compose.yml
frontend:
  environment:
    - API_URL=http://192.168.1.100:5701  # Your server IP
    # or
    - API_URL=http://your-domain.com:5701
```

**Change IP without rebuild:**
```bash
# 1. Edit docker-compose.yml to change API_URL
# 2. Restart only the frontend container
docker-compose up -d frontend
```

⚠️ **Important**: Use an IP/domain the browser can access (not `http://backend:5701`).

### Backend Configuration

Edit [backend/src/config/default.json](backend/src/config/default.json):

```json
{
  "logPath": "./logs",
  "fileExtensions": [".log", ".txt", ".json"],
  "port": 5701
}
```

Or use environment variables:

```bash
LOG_PATH=/var/log/myapp
PORT=5701
ENABLE_AUTO_CLEANUP=true      # Enable automatic log cleanup
LOG_RETENTION_DAYS=7          # Keep logs for 7 days
```

### Auto Cleanup Configuration

The backend automatically deletes log files older than the configured retention period.

**Docker Compose** (recommended):
```yaml
environment:
  - ENABLE_AUTO_CLEANUP=true    # Set to 'false' to disable
  - LOG_RETENTION_DAYS=7        # Keep logs for 7 days (default)
```

**Features**:
- Runs daily at midnight
- Recursively scans all subdirectories
- Deletes files older than retention period
- Manual trigger via API: `POST /api/cleanup`

**Disable cleanup**:
```yaml
environment:
  - ENABLE_AUTO_CLEANUP=false
```

### Docker Volume Mapping

Map your log directory to `/logs` in the container:

```bash
docker run -p 5701:5701 -v /path/to/logs:/logs log-viewer-backend
```

## Architecture

```
log-viewer/
├── backend/          # Node.js + Express API (Port 5701)
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # File system operations
│   │   └── config/   # Configuration
│   └── Dockerfile
│
└── frontend/         # React + Vite UI (Port 5700)
    ├── src/
    │   ├── components/
    │   │   ├── FileTree.jsx
    │   │   └── LogViewer.jsx
    │   └── App.jsx
    └── Dockerfile
```

## API Endpoints

### GET /api/health
Health check and configuration status

**Response:**
```json
{
  "success": true,
  "status": "ok",
  "logPath": {
    "exists": true,
    "isDirectory": true,
    "path": "/logs"
  },
  "cleanup": {
    "enabled": true,
    "retentionDays": 7
  }
}
```

### GET /api/tree
Get complete directory tree structure

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "logs",
    "path": "/logs",
    "type": "directory",
    "children": [...]
  }
}
```

### GET /api/file?path=<file_path>
Get file content

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "/logs/app.log",
    "name": "app.log",
    "content": "...",
    "size": 1024,
    "modified": "2024-10-24T10:00:00.000Z"
  }
}
```

### POST /api/reload
Reload directory tree

### POST /api/cleanup
Manually trigger log cleanup

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": 15,
    "errors": 0
  },
  "message": "Cleanup completed: 15 files deleted"
}
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-restart on changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot module replacement
```

## Building for Production

### Build and Tag Docker Images

**Linux/Mac:**
```bash
chmod +x build-and-tag.sh
./build-and-tag.sh
```

**Windows:**
```bash
build-and-tag.bat
```

**Manual Build:**
```bash
# Build with version tags
docker-compose build

# Images will be created:
# - log-viewer-backend:v1.0.0
# - log-viewer-frontend:v1.0.0
```

### Push to Registry

```bash
# Tag for your registry
docker tag log-viewer-backend:v1.0.0 your-registry/log-viewer-backend:v1.0.0
docker tag log-viewer-frontend:v1.0.0 your-registry/log-viewer-frontend:v1.0.0

# Push
docker push your-registry/log-viewer-backend:v1.0.0
docker push your-registry/log-viewer-frontend:v1.0.0
```

### Individual Builds
```bash
# Backend
cd backend
docker build -t log-viewer-backend:v1.0.0 .

# Frontend (with API URL configuration)
cd frontend
docker build -t log-viewer-frontend:v1.0.0 \
  --build-arg VITE_API_URL=http://192.168.1.100:5701 .
```

## Deployment Guide

### Closed Network (Air-Gapped) Deployment

✅ **No IP hardcoding needed** - Configure at runtime!

**Step 1: Build images once (on a machine with internet)**
```bash
# Build images (no IP configuration needed at build time)
docker-compose build
```

**Step 2: Save images to tar files**
```bash
docker save log-viewer-backend:v1.0.0 -o log-viewer-backend-v1.0.0.tar
docker save log-viewer-frontend:v1.0.0 -o log-viewer-frontend-v1.0.0.tar
```

**Step 3: Transfer files to target server**
```bash
# Copy these files to your server:
# - log-viewer-backend-v1.0.0.tar
# - log-viewer-frontend-v1.0.0.tar
# - docker-compose.yml
```

**Step 4: Load images on target server**
```bash
docker load -i log-viewer-backend-v1.0.0.tar
docker load -i log-viewer-frontend-v1.0.0.tar
```

**Step 5: Configure for your environment**
```bash
# Edit docker-compose.yml:
# 1. Set log directory volume path (line 14)
# 2. Set API_URL to your server IP (line 41)

# Example:
# volumes:
#   - /var/log/ai-agent:/logs
# environment:
#   - API_URL=http://192.168.10.50:5701
```

**Step 6: Start services**
```bash
docker-compose up -d

# Check status:
docker-compose ps
docker-compose logs -f
```

**Need to change IP later?**
```bash
# 1. Edit API_URL in docker-compose.yml
# 2. Restart frontend only (no rebuild needed!)
docker-compose up -d frontend
```

**Step 6: Access the UI**
```
Open browser: http://<server-ip>:5700
```

### Regular Deployment (with Registry)

**Step 1: Build and tag**
```bash
# Set your registry and server IP
export REGISTRY=your-registry.com
export SERVER_IP=192.168.1.100

# Build with API URL
docker build -t ${REGISTRY}/log-viewer-backend:v1.0.0 ./backend
docker build -t ${REGISTRY}/log-viewer-frontend:v1.0.0 \
  --build-arg VITE_API_URL=http://${SERVER_IP}:5701 \
  ./frontend
```

**Step 2: Push to registry**
```bash
docker push ${REGISTRY}/log-viewer-backend:v1.0.0
docker push ${REGISTRY}/log-viewer-frontend:v1.0.0
```

**Step 3: Pull and run on target server**
```bash
docker pull ${REGISTRY}/log-viewer-backend:v1.0.0
docker pull ${REGISTRY}/log-viewer-frontend:v1.0.0
docker-compose up -d
```

## Version History

### v1.0.0 (2024-10-24)
- Initial release
- JSON auto-detection and formatting
- Search functionality with Ctrl+F
- Error detection and highlighting
- File download capability
- Resizable sidebar
- Syntax highlighting for JSON
- LLM/MCP log support

## License

MIT
