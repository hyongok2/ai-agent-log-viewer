# Log Viewer - Backend API

Simple and lightweight API server for viewing log files.

## Features

- Cross-platform (Windows, Linux, macOS)
- Configurable log directory and file extensions
- RESTful API
- CORS enabled
- Docker ready

## Configuration

Edit `src/config/default.json` or use environment variables:

```bash
LOG_PATH=/path/to/logs    # Log directory path
PORT=5701                 # Server port
```

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### GET /api/health
Health check and configuration status

### GET /api/tree
Get complete directory tree structure

### GET /api/file?path=<file_path>
Get file content

### POST /api/reload
Reload directory tree

## Docker

```bash
# Build
docker build -t log-viewer-backend .

# Run
docker run -p 5701:5701 -v /host/logs:/logs log-viewer-backend
```
