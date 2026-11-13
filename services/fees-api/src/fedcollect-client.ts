import type { FeeQuote } from './calculate.ts';
import { FEE_SCHEDULE } from './fee-schedule.ts';

export const FEDCOLLECT_AGENCY_CODE = 'TLP';

export interface PaymentRequest {
  agencyCode: string;
  referenceId: string;
  amount: string;
  currency: 'USD';
  description: string;
}

export interface PaymentReceipt {
  confirmationId: string;
  status: 'settled' | 'pending';
}

export interface FedCollectClientOptions {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
}

export class FedCollectValidationError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(`${status} ${code}: ${message}`);
    this.name = 'FedCollectValidationError';
    this.status = status;
    this.code = code;
  }
}

export function buildPaymentRequest(applicationId: string, quote: FeeQuote): PaymentRequest {
  return {
    agencyCode: FEDCOLLECT_AGENCY_CODE,
    referenceId: `${applicationId}-${quote.feeType}`,
    amount: quote.total.toFixed(2),
    currency: 'USD',
    description: `${FEE_SCHEDULE.programs[quote.program].label} ${quote.feeType}`,
  };
}

export async function submitPayment(
  request: PaymentRequest,
  options: FedCollectClientOptions,
): Promise<PaymentReceipt> {
  const response = await fetch(new URL('/v2/collections', options.baseUrl), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${options.apiKey}`,
      'idempotency-key': request.referenceId,
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
  });

  if (response.status === 422) {
    const body = (await response.json()) as { error: string; message: string };
    throw new FedCollectValidationError(422, body.error, body.message);
  }
  if (!response.ok) {
    throw new Error(`FedCollect request failed with HTTP ${response.status}`);
  }
  return (await response.json()) as PaymentReceipt;
}
