@echo off
REM AI Agent Log Viewer - Build and Tag Script (Windows)
set VERSION=v1.0.0

echo Building AI Agent Log Viewer %VERSION%...

REM Build images
docker-compose build

REM Tag images with version
docker tag log-viewer-backend:v1.0.0 log-viewer-backend:latest
docker tag log-viewer-frontend:v1.0.0 log-viewer-frontend:latest

echo Build complete!
echo.
echo Images created:
echo   - log-viewer-backend:%VERSION%
echo   - log-viewer-backend:latest
echo   - log-viewer-frontend:%VERSION%
echo   - log-viewer-frontend:latest
echo.
echo To push to registry:
echo   docker tag log-viewer-backend:%VERSION% your-registry/log-viewer-backend:%VERSION%
echo   docker tag log-viewer-frontend:%VERSION% your-registry/log-viewer-frontend:%VERSION%
echo   docker push your-registry/log-viewer-backend:%VERSION%
echo   docker push your-registry/log-viewer-frontend:%VERSION%
