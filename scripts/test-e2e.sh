#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

pnpm exec next dev --turbopack -H 127.0.0.1 -p 3000 >/tmp/jpn-hs-dev-e2e.log 2>&1 &
DEV_PID=$!

cleanup() {
  kill "$DEV_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 60); do
  if curl -fsS "$BASE_URL" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

assert_contains() {
  local path="$1"
  local phrase="$2"
  if ! curl -fsS "$BASE_URL$path" | grep -q "$phrase"; then
    echo "Expected '$phrase' in $path"
    exit 1
  fi
}

assert_contains "/" "公立高校マッチングシステム"
assert_contains "/students" "学生一覧"
assert_contains "/schools" "高校一覧"
assert_contains "/admin" "教育委員会向けページ"
assert_contains "/students/1" "学生詳細"
assert_contains "/schools/1" "高校詳細"
assert_contains "/admin/sessions/1" "選考セッション詳細"

echo "E2E smoke tests passed."
