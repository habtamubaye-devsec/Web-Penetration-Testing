#!/bin/bash

# Trap SIGTERM
cleanup() {
    echo '{"error": "Headers scan was cancelled", "exit_code": 1}'
    exit 1
}
trap cleanup SIGTERM

url=$1

# Get all headers
headers=$(curl -I -s $url)

# Check for security headers
security_headers=$(echo "$headers" | grep -iE 'Content-Security-Policy|X-XSS-Protection|X-Frame-Options|Strict-Transport-Security|X-Content-Type-Options|Referrer-Policy|Feature-Policy|Permissions-Policy')

# Prepare JSON output
echo '{
  "all_headers": '$(echo "$headers" | jq -R -s -c '.')',
  "security_headers": '$(echo "$security_headers" | jq -R -s -c '.')'
}'