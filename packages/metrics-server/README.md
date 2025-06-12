# @ping-me/metrics-server

A standalone metrics server for collecting, storing, and retrieving uptime and performance data from your services and applications.

[![npm version](https://img.shields.io/npm/v/@ping-me/metrics-server)](https://www.npmjs.com/package/@ping-me/metrics-server)
[![License](https://img.shields.io/github/license/mreshank/ping-me)](https://github.com/mreshank/ping-me/blob/main/LICENSE)

## Overview

`@ping-me/metrics-server` is a powerful backend component of the Ping-Me ecosystem that provides:

- **Ping Logging**: Store response times, status codes, and errors from your monitored endpoints
- **Metrics API**: Query and analyze performance data
- **User Management**: API key-based authentication
- **Alerting**: Receive email notifications when endpoints exceed thresholds or go down
- **Admin Interface**: Manage users and view system-wide metrics
- **Rate Limiting**: Protection against abuse

This server works seamlessly with all Ping-Me client libraries, allowing you to collect comprehensive metrics from your applications and services.

## Installation

### Using npm

```bash
npm install @ping-me/metrics-server

# or with yarn
yarn add @ping-me/metrics-server

# or with pnpm
pnpm add @ping-me/metrics-server
```

### From Source

```bash
git clone https://github.com/mreshank/ping-me.git
cd ping-me/packages/metrics-server
npm install
```

## Prerequisites

- Node.js 18 or higher
- MongoDB database

## Quick Start

1. Create a `.env` file with the following configuration:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ping-me

# Server Configuration
PORT=5000

# Security
ADMIN_API_KEY=your-admin-api-key

# App Settings
MAX_LOGS_PER_ENDPOINT=1000

# Email Alerts (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
FROM_EMAIL=alerts@ping-me.com
```

2. Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

3. Create a user to get an API key:

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

4. Use the API key with any Ping-Me client to start sending metrics.

## Configuration Options

The metrics server can be configured using environment variables:

| Environment Variable | Description | Default |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ping-me` |
| `PORT` | Server port | `5000` |
| `ADMIN_API_KEY` | API key for admin access | *Required* |
| `MAX_LOGS_PER_ENDPOINT` | Maximum number of logs to keep per endpoint | `1000` |
| `SMTP_HOST` | SMTP server for sending alerts | *Optional* |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | *Optional* |
| `SMTP_PASS` | SMTP password | *Optional* |
| `FROM_EMAIL` | Email address to send alerts from | `alerts@ping-me.com` |
| `NODE_ENV` | Environment (development/production) | `development` |

## API Reference

### Authentication

All API requests (except user creation) require authentication using the `Authorization` header with a Bearer token:

```
Authorization: Bearer your-api-key
```

### User Management

#### Create a User

```
POST /api/users
```

Request body:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "apiKey": "generated-api-key",
  "settings": {
    "pingInterval": 300000,
    "alertEnabled": false,
    "alertThreshold": 500
  }
}
```

#### Regenerate API Key

```
POST /api/regenerate-key
```

Response:
```json
{
  "apiKey": "new-api-key"
}
```

### Ping Logging

#### Log a Ping

```
POST /api/log
```

Request body:
```json
{
  "endpoint": "https://example.com/api",
  "status": 200,
  "responseTime": 150,
  "timestamp": "2023-08-01T12:00:00Z",
  "error": null
}
```

Response:
```json
{
  "success": true,
  "id": "log-entry-id"
}
```

### Metrics

#### Get Metrics

```
GET /api/metrics
```

Query parameters:
- `endpoint` (optional): Filter by specific endpoint
- `limit` (optional): Maximum number of logs to return (default: 100)
- `since` (optional): Filter logs after this timestamp

Response:
```json
{
  "logs": [
    {
      "apiKey": "your-api-key",
      "endpoint": "https://example.com/api",
      "timestamp": "2023-08-01T12:00:00Z",
      "status": 200,
      "responseTime": 150,
      "error": null
    }
  ],
  "stats": [
    {
      "_id": "https://example.com/api",
      "totalCount": 100,
      "avgResponseTime": 125,
      "successCount": 98,
      "failCount": 2,
      "latestTimestamp": "2023-08-01T12:00:00Z"
    }
  ],
  "totalEndpoints": 1
}
```

### Settings

#### Get Settings

```
GET /api/settings
```

Response:
```json
{
  "settings": {
    "pingInterval": 300000,
    "alertEnabled": false,
    "alertThreshold": 500,
    "alertEmail": "alerts@example.com"
  }
}
```

#### Update Settings

```
POST /api/settings
```

Request body:
```json
{
  "pingInterval": 60000,
  "alertEnabled": true,
  "alertThreshold": 1000,
  "alertEmail": "alerts@example.com"
}
```

Response:
```json
{
  "success": true,
  "settings": {
    "pingInterval": 60000,
    "alertEnabled": true,
    "alertThreshold": 1000,
    "alertEmail": "alerts@example.com"
  }
}
```

### Health Check

```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2023-08-01T12:00:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "name": "ping-me"
  },
  "environment": "production",
  "alertsEnabled": true
}
```

### Admin API

These endpoints require the admin API key:

#### Get All Users

```
GET /api/users
```

Response:
```json
{
  "users": [
    {
      "email": "user1@example.com",
      "createdAt": "2023-08-01T12:00:00Z",
      "settings": {
        "pingInterval": 300000,
        "alertEnabled": false,
        "alertThreshold": 500,
        "alertEmail": "alerts@example.com"
      }
    }
  ]
}
```

#### Delete a User

```
DELETE /api/users/:email
```

Response:
```json
{
  "success": true,
  "message": "User and all associated data deleted"
}
```

## Integration with Client Libraries

The metrics server works with all Ping-Me client libraries. Here are some examples:

### With @ping-me/client

```javascript
import { PingMe } from '@ping-me/client';

const pingMe = new PingMe({
  apiKey: 'your-api-key',
  apiEndpoint: 'http://localhost:5000/api/log'
});

pingMe.register(['https://your-api.example.com']);
pingMe.start();
```

### With @ping-me/express

```javascript
const express = require('express');
const { withPingMe } = require('@ping-me/express');

const app = express();

withPingMe(app, {
  apiKey: 'your-api-key',
  apiEndpoint: 'http://localhost:5000/api/log'
});

app.listen(3000);
```

### With @ping-me/fastify

```javascript
const fastify = require('fastify')();
const { withPingMe } = require('@ping-me/fastify');

withPingMe(fastify, {
  apiKey: 'your-api-key',
  apiEndpoint: 'http://localhost:5000/api/log'
});

fastify.listen({ port: 3000 });
```

## Deployment Options

### Docker

A sample Dockerfile is provided:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY dist/ ./dist/

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t ping-me-metrics-server .
docker run -p 5000:5000 -e MONGODB_URI=mongodb://mongo:27017/ping-me ping-me-metrics-server
```

### Docker Compose

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/ping-me
      - ADMIN_API_KEY=your-admin-api-key
    depends_on:
      - mongo
  
  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

### Cloud Services

The metrics server can be deployed to any cloud service that supports Node.js applications:

- **Heroku**: Use the Procfile approach
- **Vercel**: Configure as a Node.js serverless function
- **AWS Elastic Beanstalk**: Deploy as a Node.js application
- **Google Cloud Run**: Deploy using a Docker container
- **Azure App Service**: Deploy as a Node.js web app

## Advanced Usage

### Custom MongoDB Connection

For advanced MongoDB configurations:

```javascript
// In your custom server setup
const mongoose = require('mongoose');
const { createMetricsServer } = require('@ping-me/metrics-server');

// Custom MongoDB connection
mongoose.connect('mongodb+srv://user:password@cluster.mongodb.net/ping-me', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  replicaSet: 'rs0',
  retryWrites: true,
  w: 'majority'
});

// Create and start the metrics server with custom options
const app = createMetricsServer({
  adminApiKey: process.env.ADMIN_API_KEY,
  maxLogsPerEndpoint: 5000,
  emailConfig: {
    host: 'smtp.gmail.com',
    port: 587,
    user: 'your-email@gmail.com',
    pass: 'your-app-password',
    fromEmail: 'alerts@your-domain.com'
  }
});

app.listen(5000);
```

### Handling High Traffic

For high-traffic scenarios, consider:

1. **Sharding**: Set up MongoDB sharding for horizontal scaling
2. **Caching**: Implement Redis caching for frequently accessed metrics
3. **Load Balancing**: Deploy multiple instances behind a load balancer
4. **Batch Processing**: Implement a queue system for processing logs

### Custom Alerting

You can extend the alerting system:

```javascript
// In your custom server setup
const { createMetricsServer, events } = require('@ping-me/metrics-server');

const app = createMetricsServer();

// Subscribe to ping events
events.on('ping', async (pingData) => {
  const { endpoint, status, responseTime, error } = pingData;
  
  // Custom alerting logic
  if (status >= 500 || responseTime > 2000) {
    // Send alert to Slack, PagerDuty, etc.
    await sendSlackAlert(endpoint, status, responseTime);
  }
});

app.listen(5000);
```

## Troubleshooting

### Common Issues

#### Connection to MongoDB failed

**Problem**: The server can't connect to MongoDB.

**Solution**:
1. Check that MongoDB is running
2. Verify the connection string in the environment variables
3. Ensure network connectivity between the server and MongoDB
4. Check MongoDB user permissions

#### Email Alerts Not Sending

**Problem**: Alerts are enabled but not being delivered.

**Solution**:
1. Verify SMTP settings
2. Check for firewall or network restrictions
3. Enable debug mode for more information
4. Try a different SMTP provider

#### High Memory Usage

**Problem**: The server is using too much memory.

**Solution**:
1. Reduce the `MAX_LOGS_PER_ENDPOINT` value
2. Implement database indexes for better performance
3. Enable MongoDB compression
4. Consider adding pagination to API responses

#### Rate Limiting Too Strict

**Problem**: Legitimate requests are being rate-limited.

**Solution**:
1. Adjust the rate limit settings in the code
2. Implement different rate limits for different endpoints
3. Use IP-based and API key-based rate limiting together

### Debugging

To enable verbose logging:

```bash
DEBUG=ping-me:* npm run dev
```

## Best Practices

### Security

- **API Keys**: Regenerate API keys periodically
- **HTTPS**: Always use HTTPS in production
- **Environment Variables**: Never hardcode sensitive information
- **Rate Limiting**: Keep rate limiting enabled to prevent abuse
- **Firewall**: Restrict access to the server at the network level

### Performance

- **Indexes**: Create MongoDB indexes for frequently queried fields
- **Monitoring**: Use a monitoring tool to track server performance
- **Compression**: Enable response compression
- **Caching**: Implement caching for frequent queries
- **Database Maintenance**: Regularly optimize the database

### Reliability

- **Backups**: Regularly backup the MongoDB database
- **High Availability**: Consider a replica set for MongoDB
- **Error Handling**: Implement robust error handling
- **Logging**: Set up comprehensive logging
- **Health Checks**: Implement health checks for automated monitoring

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details. 