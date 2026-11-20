import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateFee, UnknownFeeError } from '../src/calculate.ts';

test('TrustLane Air renewal fee', () => {
  const quote = calculateFee({ program: 'air', feeType: 'renewal' });
  assert.equal(quote.total, 120);
});

test('TrustLane Commercial application fee', () => {
  const quote = calculateFee({ program: 'commercial', feeType: 'application' });
  assert.equal(quote.total, 50);
});

test('unknown fee type is rejected', () => {
  assert.throws(() => calculateFee({ program: 'land', feeType: 'transfer' as never }), UnknownFeeError);
});
