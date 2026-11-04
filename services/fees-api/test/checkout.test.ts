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
