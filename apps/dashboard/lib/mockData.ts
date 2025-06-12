export interface Endpoint {
  id: string;
  url: string;
  status: string;
  lastPing: string;
  logs: EndpointLog[];
  cachedSize: string;
}

export interface EndpointLog {
  time: number;
  responseTime: number;
  status: number;
  region: string;
}

export interface MetricsSummary {
  totalLogs: number;
  averageResponseTime: string;
  lastStatusCode: number;
  status: string;
}

export const mockUser = {
  id: 'user_12345',
  name: 'Eshank Tyagi',
  apiKey: 'pm_test_7a3a2b9fd8819a01234567890abcdef',
};

export const mockEndpoints: Endpoint[] = [
  {
    id: 'ep_1',
    url: 'https://myapi.render.com',
    status: 'up',
    lastPing: new Date().toISOString(),
    logs: [
      { time: Date.now() - 1000 * 60 * 60, responseTime: 212, status: 200, region: 'IN' },
      { time: Date.now() - 1000 * 60 * 30, responseTime: 198, status: 200, region: 'IN' },
      { time: Date.now() - 1000 * 60 * 10, responseTime: 310, status: 200, region: 'IN' },
    ],
    cachedSize: '45KB',
  },
  {
    id: 'ep_2',
    url: 'https://myfastapi.cyclic.app',
    status: 'down',
    lastPing: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    logs: [
      { time: Date.now() - 1000 * 60 * 45, responseTime: 400, status: 500, region: 'US' },
      { time: Date.now() - 1000 * 60 * 25, responseTime: 380, status: 503, region: 'US' },
      { time: Date.now() - 1000 * 60 * 5, responseTime: 420, status: 504, region: 'US' },
    ],
    cachedSize: '33KB',
  },
];

export function getMetricsSummary(endpoint: Endpoint): MetricsSummary {
  const total = endpoint.logs.length;
  const avgResponse = (
    endpoint.logs.reduce((acc: number, cur: EndpointLog) => acc + cur.responseTime, 0) / total
  ).toFixed(2);
  const lastStatus = endpoint.logs[endpoint.logs.length - 1]?.status;

  return {
    totalLogs: total,
    averageResponseTime: `${avgResponse} ms`,
    lastStatusCode: lastStatus,
    status: endpoint.status,
  };
}
  