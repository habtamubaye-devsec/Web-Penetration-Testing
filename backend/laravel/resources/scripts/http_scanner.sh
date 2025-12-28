#!/bin/bash

# Trap SIGTERM
cleanup() {
    echo '{"error": "HTTP scan was cancelled", "exit_code": 1}'
    exit 1
}
trap cleanup SIGTERM

url=$1
mode=$2

# Check HTTP headers and redirects
http_headers=$(curl -I -L -s -o /dev/null -w "%{http_code} %{redirect_url} %{content_type}" $url 2>&1)
http_code=$(echo $http_headers | awk '{print $1}')
redirect_url=$(echo $http_headers | awk '{print $2}')
content_type=$(echo $http_headers | awk '{print $3}')

# Run nikto if detailed mode
nikto_result="{}"
if [ "$mode" == "--detailed" ]; then
    nikto_result=$(nikto -h $url -Format json -output /tmp/nikto_$$.json 2>&1)
    nikto_exit=$?
    nikto_output=$(cat /tmp/nikto_$$.json 2>/dev/null || echo "{}")
    rm -f /tmp/nikto_$$.json
fi

# Run nuclei if detailed mode
nuclei_result="{}"
if [ "$mode" == "--detailed" ]; then
    nuclei_result=$(nuclei -u $url -json -o /tmp/nuclei_$$.json 2>&1)
    nuclei_exit=$?
    nuclei_output=$(cat /tmp/nuclei_$$.json 2>/dev/null || echo "{}")
    rm -f /tmp/nuclei_$$.json
fi

# Prepare JSON output
echo '{
  "http_headers": {
    "status_code": '$http_code',
    "redirect_url": "'$redirect_url'",
    "content_type": "'$content_type'"
  },
  "security_headers": {
    "csp": "'$(curl -I -s $url | grep -i "Content-Security-Policy" | head -1 | tr -d '\r')'",
    "xss": "'$(curl -I -s $url | grep -i "X-XSS-Protection" | head -1 | tr -d '\r')'",
    "frame": "'$(curl -I -s $url | grep -i "X-Frame-Options" | head -1 | tr -d '\r')'",
    "hsts": "'$(curl -I -s $url | grep -i "Strict-Transport-Security" | head -1 | tr -d '\r')'"
  },
  "nikto": '$nikto_output',
  "nuclei": '$nuclei_output'
}'