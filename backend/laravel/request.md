Here are example `curl` requests for different scan types using your API:

### 1. Full Scan (Comprehensive scan with all checks)

```bash
curl -X POST http://localhost:8000/api/v1/scan \
-H "Content-Type: application/json" \
-d '{
  "url": "https://example.com",
  "scan_type": "full",
  "scan_id": "scan_full_123456",
  "callback_url": "https://your-callback-url.com/results"
}'
```

### 2. Fast Scan (Quick scan with essential checks)

```bash
curl -X POST http://localhost:8000/api/v1/scan \
-H "Content-Type: application/json" \
-d '{
  "url": "https://example.com",
  "scan_type": "fast",
  "scan_id": "scan_fast_789012",
  "callback_url": "https://your-callback-url.com/results"
}'
```

### 3. Custom Scan - Network Focus (Ports and services)

```bash
curl -X POST http://localhost:8000/api/v1/scan \
-H "Content-Type: application/json" \
-d '{
  "url": "https://example.com",
  "scan_type": "custom",
  "scan_id": "scan_network_345678",
  "callback_url": "https://your-callback-url.com/results",
  "custom_options": {
    "network": true,
    "ports": "all",
    "intensity": "high"
  }
}'
```

### 4. Custom Scan - Web Application Focus

```bash
curl -X POST http://localhost:8000/api/v1/scan \
-H "Content-Type: application/json" \
-d '{
  "url": "https://example.com",
  "scan_type": "custom",
  "scan_id": "scan_webapp_901234",
  "callback_url": "https://your-callback-url.com/results",
  "custom_options": {
    "http": true,
    "headers": true,
    "waf": true,
    "intensity": "medium"
  }
}'
```

### 5. Custom Scan - Security Focus (SSL and Firewall)

```bash
curl -X POST http://localhost:8000/api/v1/scan \
-H "Content-Type: application/json" \
-d '{
  "url": "https://example.com",
  "scan_type": "custom",
  "scan_id": "scan_security_567890",
  "callback_url": "https://your-callback-url.com/results",
  "custom_options": {
    "ssl": true,
    "firewall": true,
    "intensity": "high"
  }
}'
```

### 6. Minimal Scan (Just URL verification)

```bash
curl -X POST http://localhost:8000/api/v1/scan \
-H "Content-Type: application/json" \
-d '{
  "url": "https://example.com",
  "scan_type": "custom",
  "scan_id": "scan_minimal_123123",
  "custom_options": {
    "http": true,
    "intensity": "low"
  }
}'
```

### Notes:

1. All requests require:

    - `url`: The target URL to scan
    - `scan_type`: Either "full", "fast", or "custom"
    - `scan_id`: Unique identifier for tracking the scan

2. For custom scans:

    - Specify which scan types you want in `custom_options`
    - Available options: network, firewall, ssl, http, waf, headers
    - Intensity levels: low, medium, high

3. The `callback_url` is optional - if provided, results will be POSTed to this URL when complete

4. Response will include:
    - Initial acknowledgment with scan ID
    - Results can be retrieved later or sent to callback URL

You can test these requests against your running API endpoint to verify different scanning scenarios.
