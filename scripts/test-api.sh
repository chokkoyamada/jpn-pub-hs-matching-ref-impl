#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

pnpm exec next dev --turbopack -H 127.0.0.1 -p 3000 >/tmp/jpn-hs-dev.log 2>&1 &
DEV_PID=$!

cleanup() {
  kill "$DEV_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 60); do
  if curl -fsS "$BASE_URL/api/students" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

status_code() {
  local method="$1"
  local path="$2"
  local body="${3:-}"

  if [[ -n "$body" ]]; then
    curl -sS -o /tmp/api-response.txt -w "%{http_code}" \
      -X "$method" \
      -H "Content-Type: application/json" \
      -d "$body" \
      "$BASE_URL$path"
  else
    curl -sS -o /tmp/api-response.txt -w "%{http_code}" \
      -X "$method" \
      "$BASE_URL$path"
  fi
}

assert_status() {
  local expected="$1"
  local method="$2"
  local path="$3"
  local body="${4:-}"
  local got
  got="$(status_code "$method" "$path" "$body")"
  if [[ "$got" != "$expected" ]]; then
    echo "Expected $expected for $method $path but got $got"
    cat /tmp/api-response.txt
    exit 1
  fi
}

assert_status "200" "GET" "/api/students"
assert_status "200" "GET" "/api/schools"
assert_status "200" "GET" "/api/admin/sessions"

assert_status "400" "GET" "/api/students/not-a-number"
assert_status "404" "GET" "/api/students/999999"
assert_status "400" "GET" "/api/schools/not-a-number"
assert_status "404" "GET" "/api/schools/999999"
assert_status "400" "POST" "/api/schools" '{"name":"x","capacity":0}'
assert_status "400" "POST" "/api/students" '{"contact_info":"only-contact"}'

echo "API smoke tests passed."
