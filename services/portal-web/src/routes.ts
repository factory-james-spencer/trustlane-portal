export type Upstream = 'fees-api' | 'renewals-api' | 'status-api' | 'identity-gateway';

export interface Route {
  method: 'GET' | 'POST';
  path: string;
  upstream: Upstream;
  upstreamPath: string;
  timeoutMs: number;
}

export const UPSTREAM_URLS: Record<Upstream, string> = {
  'fees-api': 'http://fees-api.portal.internal:8080',
  'renewals-api': 'http://renewals-api.portal.internal:8080',
  'status-api': 'http://status-api.portal.internal:8080',
  'identity-gateway': 'http://identity-gateway.portal.internal:8080',
};

export const ROUTES: Route[] = [
  { method: 'POST', path: '/api/fees/checkout', upstream: 'fees-api', upstreamPath: '/v1/checkout', timeoutMs: 15_000 },
  { method: 'POST', path: '/api/auth/sign-in', upstream: 'identity-gateway', upstreamPath: '/v1/sign-in', timeoutMs: 8_000 },
  { method: 'GET', path: '/api/auth/callback', upstream: 'identity-gateway', upstreamPath: '/v1/callback', timeoutMs: 8_000 },
  { method: 'POST', path: '/api/renewals', upstream: 'renewals-api', upstreamPath: '/v1/renewals', timeoutMs: 5_000 },
  { method: 'GET', path: '/api/status/:applicationId', upstream: 'status-api', upstreamPath: '/v1/status/:applicationId', timeoutMs: 3_000 },
];

export function resolveRoute(method: string, path: string): { route: Route; url: string } | undefined {
  for (const route of ROUTES) {
    if (route.method !== method) continue;
    const params = matchPath(route.path, path);
    if (!params) continue;
    const upstreamPath = route.upstreamPath.replace(/:(\w+)/g, (_, name: string) => encodeURIComponent(params[name] ?? ''));
    return { route, url: UPSTREAM_URLS[route.upstream] + upstreamPath };
  }
  return undefined;
}

function matchPath(pattern: string, path: string): Record<string, string> | undefined {
  const patternParts = pattern.split('/');
  const pathParts = path.split('?')[0]!.split('/');
  if (patternParts.length !== pathParts.length) return undefined;
  const params: Record<string, string> = {};
  for (const [i, part] of patternParts.entries()) {
    const actual = pathParts[i]!;
    if (part.startsWith(':')) params[part.slice(1)] = decodeURIComponent(actual);
    else if (part !== actual) return undefined;
  }
  return params;
}
