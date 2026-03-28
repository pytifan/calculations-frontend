#!/bin/sh
# Write runtime environment variables to /usr/share/nginx/html/env.js
# This file is loaded by index.html before the React bundle,
# so window.__ENV__ is available at startup.

cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  VITE_API_URL: "${REACT_APP_API_URL}"
};
EOF

exec nginx -g "daemon off;"
