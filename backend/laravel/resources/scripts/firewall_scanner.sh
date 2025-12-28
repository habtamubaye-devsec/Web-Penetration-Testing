#!/bin/bash

# Trap SIGTERM
cleanup() {
    echo '{"error": "Firewall scan was cancelled", "exit_code": 1}'
    exit 1
}
trap cleanup SIGTERM

domain=$1
mode=$2

# Basic firewall detection
basic_result=$(nmap -sA $domain -p 80,443 2>&1)
basic_exit=$?

# Advanced evasion techniques if requested
evasion_result="{}"
if [ "$mode" == "--evasion" ]; then
    evasion_result=$(nmap -f --mtu 16 -D RND:10 --data-length 300 -T2 $domain -p 80,443 2>&1)
    evasion_exit=$?
fi

# WAF detection
waf_result=$(wafw00f $url -o /tmp/waf_$$.json 2>&1)
waf_exit=$?
waf_output=$(cat /tmp/waf_$$.json 2>/dev/null || echo "{}")
rm -f /tmp/waf_$$.json

# Prepare JSON output
echo '{
  "basic_firewall": {
    "exit_code": '$basic_exit',
    "output": '$(echo "$basic_result" | jq -R -s -c '.')'
  },
  "evasion_techniques": {
    "exit_code": '$evasion_exit',
    "output": '$(echo "$evasion_result" | jq -R -s -c '.')'
  },
  "waf_detection": '$waf_output'
}'