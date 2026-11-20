import { FEE_SCHEDULE, type FeeType, type Program, type Surcharge } from './fee-schedule.ts';

export interface FeeRequest {
  program: Program;
  feeType: FeeType;
  surcharges?: Surcharge[];
}

export interface LineItem {
  description: string;
  /** US dollars. */
  amount: number;
}

export interface FeeQuote {
  program: Program;
  feeType: FeeType;
  surcharges: Surcharge[];
  lineItems: LineItem[];
  /** US dollars. */
  total: number;
}

export class UnknownFeeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnknownFeeError';
  }
}

export function calculateFee(request: FeeRequest): FeeQuote {
  const programFees = FEE_SCHEDULE.programs[request.program];
  const baseCents = programFees?.baseCents[request.feeType];
  if (baseCents === undefined) {
    throw new UnknownFeeError(`no fee for ${request.program}/${request.feeType}`);
  }

  const surcharges = [...new Set(request.surcharges ?? [])];
  const lineItems: LineItem[] = [{ description: `${programFees.label} ${request.feeType}`, amount: baseCents / 100 }];
  let rate = 0;
  for (const surcharge of surcharges) {
    const surchargeRate = FEE_SCHEDULE.surchargeRates[surcharge];
    lineItems.push({ description: `${surcharge} surcharge`, amount: (baseCents * surchargeRate) / 100 });
    rate += surchargeRate;
  }

  return {
    program: request.program,
    feeType: request.feeType,
    surcharges,
    lineItems,
    total: (baseCents * (1 + rate)) / 100,
  };
}
