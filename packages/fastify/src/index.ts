import { pingMe } from '@ping-me/core';
import { FastifyInstance } from 'fastify';

export function withPingMeFastify(
  app: FastifyInstance,
  options: {
    route?: string;
    interval?: number;
    log?: boolean;
  }
) {
  const route = options.route || '/ping-me';
  const interval = options.interval || 300000;

  app.get(route, async (_, reply) => reply.send('pong'));

  pingMe({
    url: `http://localhost:3000${route}`,
    interval,
    log: options.log ? console.log : () => {}
  });
}