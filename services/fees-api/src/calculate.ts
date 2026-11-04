import { FEE_SCHEDULE, type FeeType, type Program, type Surcharge } from './fee-schedule.ts';

export interface FeeRequest {
  program: Program;
  feeType: FeeType;
  surcharges?: Surcharge[];
}

export interface FeeQuote {
  program: Program;
  feeType: FeeType;
  surcharges: Surcharge[];
  baseCents: number;
  surchargeCents: number;
  totalCents: number;
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
  // Each surcharge is a share of the base fee (not compounded), rounded to the cent,
  // as published in the fee notice.
  let surchargeCents = 0;
  for (const surcharge of surcharges) {
    surchargeCents += Math.round((baseCents * FEE_SCHEDULE.surchargeBps[surcharge]) / 10_000);
  }

  return {
    program: request.program,
    feeType: request.feeType,
    surcharges,
    baseCents,
    surchargeCents,
    totalCents: baseCents + surchargeCents,
  };
}
