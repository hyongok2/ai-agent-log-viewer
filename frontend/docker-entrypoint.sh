#!/bin/sh
set -e

# Generate config.js from environment variable
cat > /usr/share/nginx/html/config.js <<EOF
// Runtime configuration - injected by Docker at startup
window.APP_CONFIG = {
  API_URL: '${API_URL:-http://localhost:5701}'
};
EOF

echo "Generated config.js with API_URL=${API_URL:-http://localhost:5701}"

# Start nginx
exec "$@"
