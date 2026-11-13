import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkout } from '../src/checkout.ts';
import type { PaymentRequest } from '../src/fedcollect-client.ts';

test('submits one payment and returns the confirmation', async () => {
  const submitted: PaymentRequest[] = [];
  const result = await checkout(
    { applicationId: 'APP-100512', program: 'commercial', feeType: 'renewal' },
    async (payment) => {
      submitted.push(payment);
      return { confirmationId: 'FC-20931', status: 'settled' };
    },
  );

  assert.equal(submitted.length, 1);
  assert.equal(submitted[0]?.referenceId, 'APP-100512-renewal');
  assert.equal(result.confirmationId, 'FC-20931');
  assert.equal(result.status, 'settled');
});

test('expedited checkout submits an amount accepted by FedCollect', async () => {
  const result = await checkout(
    { applicationId: 'APP-REGRESSION', program: 'air', feeType: 'renewal', surcharges: ['expedite'] },
    async (payment) => {
      assert.equal(payment.amount, '138.00');
      assert.match(payment.amount, /^\d+\.\d{2}$/);
      return { confirmationId: 'FC-REGRESSION', status: 'settled' };
    },
  );

  assert.equal(result.amount, '138.00');
  assert.equal(result.status, 'settled');
});
