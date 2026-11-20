export type Program = 'air' | 'land' | 'commercial';
export type FeeType = 'application' | 'renewal' | 'replacement';
export type Surcharge = 'expedite' | 'late';

export interface ProgramFees {
  label: string;
  /** Base fees in integer cents. */
  baseCents: Record<FeeType, number>;
}

export const FEE_SCHEDULE: {
  programs: Record<Program, ProgramFees>;
  /** Surcharge rates as a fraction of the base fee. */
  surchargeRates: Record<Surcharge, number>;
} = {
  programs: {
    air: {
      label: 'TrustLane Air',
      baseCents: { application: 12000, renewal: 12000, replacement: 2500 },
    },
    land: {
      label: 'TrustLane Land',
      baseCents: { application: 12000, renewal: 12000, replacement: 2500 },
    },
    commercial: {
      label: 'TrustLane Commercial',
      baseCents: { application: 5000, renewal: 5000, replacement: 2500 },
    },
  },
  surchargeRates: { expedite: 0.15, late: 0.1 },
};
