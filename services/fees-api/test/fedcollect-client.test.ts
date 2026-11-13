import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateFee } from '../src/calculate.ts';
import { buildPaymentRequest } from '../src/fedcollect-client.ts';

test('builds a FedCollect request for a renewal', () => {
  const quote = calculateFee({ program: 'land', feeType: 'renewal' });
  const request = buildPaymentRequest('APP-100234', quote);

  assert.equal(request.amount, '120.00');
  assert.equal(request.currency, 'USD');
  assert.equal(request.referenceId, 'APP-100234-renewal');
  assert.equal(request.description, 'TrustLane Land renewal');
});

test('formats floating-point surcharge totals to two decimal places', () => {
  const quote = calculateFee({ program: 'air', feeType: 'renewal', surcharges: ['expedite'] });
  assert.equal(buildPaymentRequest('APP-EXPEDITE', quote).amount, '138.00');
  assert.equal(buildPaymentRequest('APP-LATE', { ...quote, total: 104.50000000000001 }).amount, '104.50');
});

test('builds a FedCollect request for a replacement card', () => {
  const quote = calculateFee({ program: 'air', feeType: 'replacement' });
  assert.equal(buildPaymentRequest('APP-100871', quote).amount, '25.00');
});
