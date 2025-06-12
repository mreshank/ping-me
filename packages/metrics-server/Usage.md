# Ping-Me Metrics Server

A standalone metrics server for collecting, storing, and retrieving uptime and performance data from your services and applications. This server is part of the Ping-Me monitoring ecosystem.

## Features

- **Ping Logging**: Store response times, status codes, and errors from your monitored endpoints
- **Metrics API**: Query and analyze performance data
- **User Management**: API key-based authentication
- **Alerting**: Receive email notifications when endpoints exceed thresholds
- **Admin Interface**: Manage users and view system-wide metrics
- **Rate Limiting**: Protection against abuse

## Setup

### Prerequisites

- Node.js 18 or higher
- MongoDB database

### Installation

1. Clone the repository or install via npm:

```bash
npm install @ping-me/metrics-server
```

2. Create a `.env` file based on the example:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ping-me

# Server Configuration
PORT=5000

# Security
JWT_SECRET=your-jwt-secret-key
ADMIN_API_KEY=your-admin-api-key

# App Settings
MAX_LOGS_PER_ENDPOINT=1000

# Email Alerts (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
FROM_EMAIL=alerts@ping-me.com
```

3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## Usage

### Creating a User

First, create a user to get an API key:

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

The response will include your API key:

```json
{
  "apiKey": "your-api-key",
  "settings": {
    "pingInterval": 300000,
    "alertEnabled": false,
    "alertThreshold": 500
  }
}
```

### Logging Pings

Use the API key to log ping data:

```bash
curl -X POST http://localhost:5000/api/log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "endpoint": "https://example.com/api",
    "status": 200,
    "responseTime": 150,
    "error": null
  }'
```

### Retrieving Metrics

Get metrics for your monitored endpoints:

```bash
curl -X GET "http://localhost:5000/api/metrics?limit=10" \
  -H "Authorization: Bearer your-api-key"
```

### Updating Settings

Enable alerts when endpoints exceed thresholds:

```bash
curl -X POST http://localhost:5000/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "alertEnabled": true,
    "alertThreshold": 500,
    "alertEmail": "alerts@example.com"
  }'
```

## Integration with Client Libraries

This metrics server works with any of the Ping-Me client libraries:

### Node.js (Express)

```javascript
const { pingMe } = require('@ping-me/express');

// Setup ping-me middleware
app.use(pingMe({
  apiKey: 'your-api-key',
  metricsServer: 'http://localhost:5000'
}));
```

### Python

```python
from ping_me import PingMe

ping = PingMe(
    api_key='your-api-key',
    metrics_server='http://localhost:5000'
)

@ping.monitor
def my_function():
    # Your code here
    pass
```

## Admin API

The following endpoints are only accessible with an admin API key:

- `GET /api/users` - List all users
- `DELETE /api/users/:email` - Delete a user and their data

## License

MIT 