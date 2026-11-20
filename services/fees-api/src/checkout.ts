import { calculateFee, type FeeRequest } from './calculate.ts';
import { buildPaymentRequest, type PaymentReceipt, type PaymentRequest } from './fedcollect-client.ts';

export interface CheckoutRequest extends FeeRequest {
  applicationId: string;
}

export interface CheckoutResult {
  applicationId: string;
  confirmationId: string;
  amount: string;
  status: PaymentReceipt['status'];
}

export type SubmitPayment = (request: PaymentRequest) => Promise<PaymentReceipt>;

export function checkout(request: CheckoutRequest, submit: SubmitPayment): Promise<CheckoutResult> {
  const quote = calculateFee(request);
  const payment = buildPaymentRequest(request.applicationId, quote);
  return submit(payment).then((receipt) => ({
    applicationId: request.applicationId,
    confirmationId: receipt.confirmationId,
    amount: payment.amount,
    status: receipt.status,
  }));
}
