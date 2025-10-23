#!/usr/bin/env bash
set -euo pipefail
export PORT=${PORT:-7788}
export TOKEN=${TOKEN:-agent-FIXO-PARA-TESTE}
HDR="Authorization: Bearer ${TOKEN}"

echo "[health]"; curl -sS "http://localhost:$PORT/health" | jq .
echo "[token]";  curl -sS "http://localhost:$PORT/__debug-token" | jq .
echo "[auth]";   curl -sS -H "$HDR" "http://localhost:$PORT/__echo-auth" | jq .

TASK=$'bash -lc '\''set -euo pipefail; echo "[tick] 1"; sleep 0.2; echo "[tick] 2"; echo "[done] ok"'\'''
ID=$(jq -n --arg t "$TASK" '{task:$t}' \
  | curl -sS -H "$HDR" -H "Content-Type: application/json" \
       -X POST --data-binary @- "http://localhost:$PORT/run-async" | jq -r .taskId)
echo "taskId=$ID"

curl -sS -H "$HDR" "http://localhost:$PORT/tasks/$ID/status" | jq .
