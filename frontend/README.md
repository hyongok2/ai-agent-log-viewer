# Log Viewer - Frontend

React-based web interface for the Log Viewer application.

## Features

- Modern, dark-themed UI inspired by VS Code
- Tree view for directory navigation
- Syntax-highlighted log viewer with color-coded log levels
- Responsive design
- Real-time reload functionality

## Development

```bash
npm install
npm run dev
```

Frontend will be available at http://localhost:5700

## Building

```bash
npm run build
```

Built files will be in the `dist/` directory.

## Configuration

The API URL is configured in [src/App.jsx](src/App.jsx):

```javascript
const API_URL = 'http://localhost:5701';
```

For production, you may want to use environment variables or a config file.

## Docker

```bash
docker build -t log-viewer-frontend .
docker run -p 5700:5700 log-viewer-frontend
```

## Tech Stack

- React 18
- Vite (build tool)
- CSS3 (no external UI libraries)
