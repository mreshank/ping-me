import { pingMe } from '@ping-me/core';
import Koa from 'koa';
import Router from 'koa-router';

export function withPingMeKoa(
  app: Koa,
  router: Router,
  options: {
    route?: string;
    interval?: number;
    log?: boolean;
  }
) {
  const route = options.route || '/ping-me';
  const interval = options.interval || 300000;

  router.get(route, ctx => {
    ctx.body = 'pong';
  });

  app.use(router.routes());

  pingMe({
    url: `http://localhost:3000${route}`,
    interval,
    log: options.log ? console.log : () => {}
  });
}