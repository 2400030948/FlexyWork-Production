#!/bin/sh
set -e

API_PORT="${API_PORT:-4000}"
WEB_PORT="${WEB_PORT:-${PORT:-3000}}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"
export API_URL="${API_URL:-http://127.0.0.1:${API_PORT}}"

echo "Starting FlexyWork API on port ${API_PORT}..."
PORT="${API_PORT}" node server/server.js &
API_PID=$!

echo "Starting FlexyWork web on ${HOSTNAME}:${WEB_PORT}..."
HOSTNAME="${HOSTNAME}" PORT="${WEB_PORT}" node ./node_modules/next/dist/bin/next start \
  --hostname "${HOSTNAME}" \
  --port "${WEB_PORT}" &
WEB_PID=$!

shutdown() {
  echo "Shutting down FlexyWork..."
  kill -TERM "${API_PID}" "${WEB_PID}" 2>/dev/null || true
  wait "${API_PID}" "${WEB_PID}" 2>/dev/null || true
  exit 0
}

trap shutdown TERM INT

while kill -0 "${API_PID}" 2>/dev/null && kill -0 "${WEB_PID}" 2>/dev/null; do
  wait -n "${API_PID}" "${WEB_PID}" 2>/dev/null || break
done

shutdown
