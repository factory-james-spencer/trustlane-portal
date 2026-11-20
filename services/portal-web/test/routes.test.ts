import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveRoute } from '../src/routes.ts';

test('fee checkout is proxied to fees-api', () => {
  assert.equal(resolveRoute('POST', '/api/fees/checkout')?.route.upstream, 'fees-api');
});

test('sign-in is proxied to identity-gateway', () => {
  assert.equal(resolveRoute('POST', '/api/auth/sign-in')?.route.upstream, 'identity-gateway');
});

test('path parameters are forwarded', () => {
  assert.equal(
    resolveRoute('GET', '/api/status/APP-100234')?.url,
    'http://status-api.portal.internal:8080/v1/status/APP-100234',
  );
});
