#!/bin/bash

# Trap SIGTERM
cleanup() {
    echo '{"error": "WAF scan was cancelled", "exit_code": 1}'
    exit 1
}
trap cleanup SIGTERM
url=$1

# Run wafw00f
waf_result=$(wafw00f $url -o /tmp/waf_$$.json 2>&1)
waf_exit=$?

# Run nmap WAF scripts
nmap_result=$(nmap --script http-waf-detect,http-waf-fingerprint $url 2>&1)
nmap_exit=$?

# Prepare JSON output
echo '{
  "wafw00f": {
    "exit_code": '$waf_exit',
    "output": '$(cat /tmp/waf_$$.json 2>/dev/null || echo "{}")'
  },
  "nmap_waf": {
    "exit_code": '$nmap_exit',
    "output": '$(echo "$nmap_result" | jq -R -s -c '.')'
  }
}'

# Clean up
rm -f /tmp/waf_$$.json