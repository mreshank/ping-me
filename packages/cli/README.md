# @ping-me/cli

Command-line interface for Ping-Me to keep your services alive and monitor their health.

[![npm version](https://img.shields.io/npm/v/@ping-me/cli)](https://www.npmjs.com/package/@ping-me/cli)
[![License](https://img.shields.io/github/license/mreshank/ping-me)](https://github.com/mreshank/ping-me/blob/main/LICENSE)

## Overview

`@ping-me/cli` provides a powerful command-line interface for Ping-Me, allowing you to:

- Keep your free-tier backend services alive by preventing sleep cycles
- Monitor service health and response times
- Register and manage multiple endpoints
- Configure ping intervals and other settings
- Start and stop monitoring from the command line
- View real-time ping statistics and status information

## Installation

### Global Installation

```bash
# Install globally with npm
npm install -g @ping-me/cli

# or with yarn
yarn global add @ping-me/cli

# or with pnpm
pnpm add -g @ping-me/cli
```

### Local Installation

```bash
# Install locally in your project
npm install @ping-me/cli

# or with yarn
yarn add @ping-me/cli

# or with pnpm
pnpm add @ping-me/cli
```

## Basic Usage

### Starting Ping-Me

```bash
# Start monitoring a single endpoint
ping-me start --api-key YOUR_API_KEY --url https://your-api.example.com

# Start monitoring multiple endpoints
ping-me start --api-key YOUR_API_KEY --url https://api1.example.com --url https://api2.example.com

# Start monitoring with a custom ping interval (in milliseconds)
ping-me start --api-key YOUR_API_KEY --url https://your-api.example.com --interval 60000
```

### Managing Endpoints

```bash
# List all registered endpoints
ping-me list --api-key YOUR_API_KEY

# Add a new endpoint to monitor
ping-me add --api-key YOUR_API_KEY --url https://new-api.example.com

# Remove an endpoint from monitoring
ping-me remove --api-key YOUR_API_KEY --url https://old-api.example.com
```

### Checking Status

```bash
# Check the status of all endpoints
ping-me status --api-key YOUR_API_KEY

# Check the status of a specific endpoint
ping-me status --api-key YOUR_API_KEY --url https://your-api.example.com
```

### Stopping Ping-Me

```bash
# Stop monitoring all endpoints
ping-me stop --api-key YOUR_API_KEY

# Stop monitoring a specific endpoint
ping-me stop --api-key YOUR_API_KEY --url https://your-api.example.com
```

## Command Reference

### `ping-me start`

Start monitoring one or more endpoints.

#### Options

- `--api-key, -k <key>`: Your Ping-Me API key (required)
- `--url, -u <url>`: URL(s) to monitor (can be specified multiple times)
- `--interval, -i <ms>`: Ping interval in milliseconds (default: 300000, which is 5 minutes)
- `--log, -l`: Enable detailed logging
- `--format, -f <format>`: Output format (json, table, text) (default: text)
- `--config, -c <path>`: Path to a configuration file

#### Examples

```bash
# Basic usage
ping-me start -k YOUR_API_KEY -u https://api.example.com

# Monitor multiple endpoints with 1-minute interval
ping-me start -k YOUR_API_KEY -u https://api1.example.com -u https://api2.example.com -i 60000

# Enable detailed logging with JSON output
ping-me start -k YOUR_API_KEY -u https://api.example.com -l -f json

# Use a configuration file
ping-me start -c ./ping-me-config.json
```

### `ping-me stop`

Stop monitoring endpoints.

#### Options

- `--api-key, -k <key>`: Your Ping-Me API key (required)
- `--url, -u <url>`: Specific URL(s) to stop monitoring (if omitted, stops all)
- `--format, -f <format>`: Output format (json, table, text) (default: text)

#### Examples

```bash
# Stop monitoring all endpoints
ping-me stop -k YOUR_API_KEY

# Stop monitoring specific endpoints
ping-me stop -k YOUR_API_KEY -u https://api1.example.com -u https://api2.example.com
```

### `ping-me list`

List all registered endpoints.

#### Options

- `--api-key, -k <key>`: Your Ping-Me API key (required)
- `--format, -f <format>`: Output format (json, table, text) (default: table)

#### Examples

```bash
# List all endpoints in table format
ping-me list -k YOUR_API_KEY

# List all endpoints in JSON format
ping-me list -k YOUR_API_KEY -f json
```

### `ping-me add`

Add one or more endpoints to monitor.

#### Options

- `--api-key, -k <key>`: Your Ping-Me API key (required)
- `--url, -u <url>`: URL(s) to add for monitoring (can be specified multiple times)
- `--format, -f <format>`: Output format (json, table, text) (default: text)

#### Examples

```bash
# Add a single endpoint
ping-me add -k YOUR_API_KEY -u https://new-api.example.com

# Add multiple endpoints
ping-me add -k YOUR_API_KEY -u https://api1.example.com -u https://api2.example.com
```

### `ping-me remove`

Remove one or more endpoints from monitoring.

#### Options

- `--api-key, -k <key>`: Your Ping-Me API key (required)
- `--url, -u <url>`: URL(s) to remove from monitoring (can be specified multiple times)
- `--format, -f <format>`: Output format (json, table, text) (default: text)

#### Examples

```bash
# Remove a single endpoint
ping-me remove -k YOUR_API_KEY -u https://old-api.example.com

# Remove multiple endpoints
ping-me remove -k YOUR_API_KEY -u https://api1.example.com -u https://api2.example.com
```

### `ping-me status`

Check the status of monitored endpoints.

#### Options

- `--api-key, -k <key>`: Your Ping-Me API key (required)
- `--url, -u <url>`: Specific URL(s) to check (if omitted, checks all)
- `--format, -f <format>`: Output format (json, table, text) (default: table)
- `--watch, -w`: Watch mode, continuously update status (default: false)
- `--interval, -i <ms>`: Refresh interval for watch mode in milliseconds (default: 5000)

#### Examples

```bash
# Check status of all endpoints
ping-me status -k YOUR_API_KEY

# Check status of specific endpoints
ping-me status -k YOUR_API_KEY -u https://api1.example.com -u https://api2.example.com

# Watch status with 2-second refresh interval
ping-me status -k YOUR_API_KEY -w -i 2000
```

### `ping-me ping`

Manually ping one or more endpoints.

#### Options

- `--api-key, -k <key>`: Your Ping-Me API key (required)
- `--url, -u <url>`: URL(s) to ping (can be specified multiple times)
- `--format, -f <format>`: Output format (json, table, text) (default: table)

#### Examples

```bash
# Ping a single endpoint
ping-me ping -k YOUR_API_KEY -u https://api.example.com

# Ping multiple endpoints
ping-me ping -k YOUR_API_KEY -u https://api1.example.com -u https://api2.example.com
```

### `ping-me config`

Manage configuration settings.

#### Options

- `--api-key, -k <key>`: Your Ping-Me API key (required)
- `--set <key=value>`: Set a configuration option
- `--get <key>`: Get a configuration option
- `--reset`: Reset all configuration options to defaults
- `--format, -f <format>`: Output format (json, table, text) (default: table)

#### Examples

```bash
# Set the default ping interval
ping-me config -k YOUR_API_KEY --set interval=60000

# Get the current ping interval
ping-me config -k YOUR_API_KEY --get interval

# Reset all configuration options
ping-me config -k YOUR_API_KEY --reset
```

## Configuration File

You can use a configuration file to store your settings. Create a file named `ping-me-config.json` in your project directory or home directory:

```json
{
  "apiKey": "your-api-key-here",
  "endpoints": [
    "https://api1.example.com",
    "https://api2.example.com"
  ],
  "interval": 60000,
  "log": true,
  "format": "table"
}
```

Then use it with:

```bash
ping-me start -c ./ping-me-config.json
```

## Environment Variables

You can also use environment variables to configure the CLI:

- `PING_ME_API_KEY`: Your Ping-Me API key
- `PING_ME_INTERVAL`: Default ping interval in milliseconds
- `PING_ME_LOG`: Enable detailed logging (true/false)
- `PING_ME_FORMAT`: Default output format (json/table/text)

Example:

```bash
export PING_ME_API_KEY=your-api-key-here
export PING_ME_INTERVAL=60000
export PING_ME_LOG=true
export PING_ME_FORMAT=json

# Now you can use the CLI without specifying these options
ping-me start -u https://api.example.com
```

## Advanced Usage

### Watching Status in Real-Time

You can monitor the status of your endpoints in real-time using the watch mode:

```bash
ping-me status -k YOUR_API_KEY -w
```

This will continuously update the status of your endpoints, showing response times and any issues.

### Using Ping-Me as a Service

You can run Ping-Me as a background service:

```bash
# Start as a background service
ping-me service start -k YOUR_API_KEY -u https://api.example.com

# Check service status
ping-me service status

# Stop the service
ping-me service stop
```

Note: This feature works on Linux, macOS, and Windows.

### Batch Processing

You can process multiple endpoints from a file:

```bash
# Create a file with one URL per line
echo "https://api1.example.com
https://api2.example.com
https://api3.example.com" > endpoints.txt

# Start monitoring all endpoints in the file
ping-me start -k YOUR_API_KEY --file endpoints.txt
```

### Custom Headers

You can add custom headers to your ping requests:

```bash
ping-me start -k YOUR_API_KEY -u https://api.example.com --header "Authorization: Bearer token" --header "X-Custom-Header: value"
```

### Conditional Pinging

You can set up conditional pinging based on time of day:

```bash
# Business hours only (9 AM to 5 PM)
ping-me start -k YOUR_API_KEY -u https://api.example.com --business-hours
```

## Integration with Other Tools

### Using with Cron

You can use cron to manage Ping-Me:

```bash
# Add to crontab to start Ping-Me every day at 9 AM
0 9 * * * ping-me start -k YOUR_API_KEY -u https://api.example.com

# Stop Ping-Me every day at 5 PM
0 17 * * * ping-me stop -k YOUR_API_KEY
```

### Using with Docker

You can run Ping-Me in a Docker container:

```bash
docker run -e PING_ME_API_KEY=your-api-key-here -e PING_ME_URLS=https://api.example.com pingme/cli:latest
```

### Using with CI/CD

You can include Ping-Me in your CI/CD pipeline:

```yaml
# GitHub Actions example
jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Keep services alive
        run: |
          npm install -g @ping-me/cli
          ping-me start -k ${{ secrets.PING_ME_API_KEY }} -u ${{ secrets.SERVICE_URL }}
```

## Troubleshooting

### Common Issues

#### Authentication Errors

If you're seeing authentication errors:

```
Error: Authentication failed. Invalid API key.
```

Make sure your API key is correct and has the necessary permissions.

#### Connection Errors

If endpoints are not being pinged successfully:

```
Error: Failed to ping https://api.example.com: connect ECONNREFUSED
```

1. Check that the endpoint is accessible from your network
2. Verify that there are no firewalls blocking the connection
3. Ensure the endpoint URL is correct (including protocol)

#### Rate Limiting

If you're experiencing rate limiting:

```
Error: Rate limit exceeded. Please try again later.
```

Try increasing the ping interval to reduce the frequency of requests.

### Debugging

You can enable debug mode for more detailed information:

```bash
ping-me start -k YOUR_API_KEY -u https://api.example.com --debug
```

This will show all API calls, responses, and internal processes to help diagnose issues.

## Best Practices

### Security

- **API Key Protection**: Store your API key securely. Consider using environment variables instead of command-line arguments.
- **Secure Endpoints**: Always use HTTPS URLs for your endpoints to ensure secure communication.
- **Avoid Overuse**: Don't set the ping interval too low, as this can lead to rate limiting and unnecessary resource usage.

### Performance

- **Optimal Intervals**: For most services, a ping interval of 5-10 minutes is sufficient to keep them alive. Only use shorter intervals if necessary.
- **Resource Usage**: Be mindful of the resources consumed by the CLI. If monitoring many endpoints, consider using a dedicated machine or container.
- **Batching**: If monitoring multiple endpoints, use batch commands instead of individual ones to reduce overhead.

### Reliability

- **Service Mode**: For critical services, use the service mode to ensure Ping-Me continues running even if your terminal session ends.
- **Monitoring**: Set up alerts or regular status checks to ensure Ping-Me itself is running correctly.
- **Redundancy**: For critical endpoints, consider setting up multiple instances of Ping-Me from different locations.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details. 