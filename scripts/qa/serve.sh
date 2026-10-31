#!/usr/bin/env bash
# Restarts the production server on port ${PORT:-3100} (writes PID to /tmp/kroj-server.pid).
cd "$(dirname "$0")/../.."
PORT=${PORT:-3100}
if [ -f /tmp/kroj-server.pid ]; then kill "$(cat /tmp/kroj-server.pid)" 2>/dev/null; sleep 1; fi
nohup node node_modules/next/dist/bin/next start -p "$PORT" > /tmp/prod.log 2>&1 &
echo $! > /tmp/kroj-server.pid
for i in $(seq 1 30); do curl -s -o /dev/null "http://localhost:$PORT/" && break; sleep 0.5; done
echo "server pid $(cat /tmp/kroj-server.pid) on :$PORT"
