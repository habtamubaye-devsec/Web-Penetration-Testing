#!/bin/bash

# Trap SIGTERM
cleanup() {
    echo '{"error": "Network scan was cancelled", "status": "cancelled"}'
    exit 1
}
trap cleanup SIGTERM

# Validate input
if [ -z "$1" ]; then
    echo '{"error": "Domain argument is required", "status": "failed"}'
    exit 1
fi

domain=$1
mode=$2

# Initialize JSON output
output='{
  "nmap": {
    "exit_code": 0,
    "output": "",
    "status": "success"
  }
}'

# Determine scan parameters
ports="21,22,23,25,53,80,110,111,135,139,143,443,445,993,995,1723,3306,3389,5900,8080"
scan_args="-sS -sV --min-rate=1000"

if [ "$mode" == "--all-ports" ]; then
    ports="-p-"
elif [ "$mode" == "--aggressive" ]; then
    scan_args="-sS -sV -A -T4 --min-rate=10000"
fi

# Run nmap
nmap_result=$(nmap $scan_args $ports $domain 2>&1)
nmap_exit=$?

# Update JSON output
output=$(echo "$output" | jq \
    --arg code "$nmap_exit" \
    --arg result "$nmap_result" \
    '.nmap.exit_code = ($code | tonumber) | .nmap.output = $result')

if [ $nmap_exit -ne 0 ]; then
    output=$(echo "$output" | jq '.nmap.status = "failed"')
fi

# Output final JSON
echo "$output" | jq -c .
