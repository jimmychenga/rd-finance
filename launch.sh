#!/bin/bash
# RD Finance desktop launcher

APP_DIR="/Users/jimmycheng/rd-finance"
PORT=3001
LOG="$APP_DIR/server.log"
BREW="/opt/homebrew/bin"

export PATH="$BREW:$PATH"

# Kill any process already on the port
lsof -ti :$PORT | xargs kill -9 2>/dev/null
sleep 0.5

# Rebuild client if source is newer than the dist bundle
if [ ! -f "$APP_DIR/client/dist/index.html" ] || \
   find "$APP_DIR/client/src" -newer "$APP_DIR/client/dist/index.html" -name "*.jsx" -o \
   -name "*.js" -o -name "*.css" 2>/dev/null | grep -q .; then
  echo "[RD Finance] Building client..." | tee -a "$LOG"
  cd "$APP_DIR/client" && "$BREW/npm" run build >> "$LOG" 2>&1
fi

# Start Express (serves API + built React app)
echo "[RD Finance] Starting server on :$PORT" | tee -a "$LOG"
cd "$APP_DIR/server"
"$BREW/node" src/index.js >> "$LOG" 2>&1 &
SERVER_PID=$!

# Wait until the server responds (up to 10 s)
for i in $(seq 1 20); do
  sleep 0.5
  if curl -s "http://localhost:$PORT/api/health" > /dev/null 2>&1; then
    break
  fi
done

# Open in the default browser
open "http://localhost:$PORT"

# Keep script alive so the app stays running; kill server when script exits
trap "kill $SERVER_PID 2>/dev/null" EXIT
wait $SERVER_PID
