#!/bin/bash

# Trap SIGTERM
cleanup() {
    echo '{"error": "SSL scan was cancelled", "exit_code": 1}'
    exit 1

}
trap cleanup SIGTERM

domain=$1
mode=$2

# Determine testssl parameters based on intensity
testssl_args=""
if [ "$mode" == "--full" ]; then
    testssl_args="--color 0 --wide --ip one --fast --bugs --protocols --server-defaults --phone-out"
else
    testssl_args="--color 0 --wide --ip one --fast"
fi

# Run testssl.sh
testssl_result=$(testssl $testssl_args --jsonfile /tmp/testssl_$$.json https://$domain 2>&1)
testssl_exit=$?

# Run sslscan with appropriate parameters
sslscan_args=""
if [ "$mode" == "--full" ]; then
    sslscan_args="--no-colour --verbose --show-certificate --ssl2 --ssl3 --tls1 --tls11 --tls12 --tls13"
else
    sslscan_args="--no-colour --tlsall"
fi

sslscan_result=$(sslscan $sslscan_args $domain:443 2>&1)
sslscan_exit=$?

# Run nmap with appropriate parameters
nmap_args="-sV --script ssl-enum-ciphers"
if [ "$mode" == "--full" ]; then
    nmap_args="$nmap_args -A -T4"
fi

nmap_result=$(nmap $nmap_args -p 443 $domain 2>&1)
nmap_exit=$?

# Prepare JSON output
echo '{
  "testssl": {
    "exit_code": '$testssl_exit',
    "output": '$(echo "$testssl_result" | jq -R -s -c '.')',
    "json_result": '$(cat /tmp/testssl_$$.json 2>/dev/null || echo "null")'
  },
  "sslscan": {
    "exit_code": '$sslscan_exit',
    "output": '$(echo "$sslscan_result" | jq -R -s -c '.')'
  },
  "nmap": {
    "exit_code": '$nmap_exit',
    "output": '$(echo "$nmap_result" | jq -R -s -c '.')'
  }
}'

# Clean up
rm -f /tmp/testssl_$$.json