import { Hono } from 'hono';
import { pingMe } from '@ping-me/core';

export function withPingMeHono(
  app: Hono,
  options: {
    route?: string;
    interval?: number;
    log?: boolean;
    baseUrl: string;
  }
) {
  const route = options.route || '/ping-me';
  const interval = options.interval || 300000;

  app.get(route, c => c.text('pong'));

  pingMe({
    url: `${options.baseUrl}${route}`,
    interval,
    log: options.log ? console.log : () => {}
  });
}