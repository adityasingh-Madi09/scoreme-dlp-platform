/**
 * Loan-offer terms shown on Step 5 (Loan Offer) and cross-referenced on
 * Step 6 (Verify & Consent) and Step 7 (Success).
 *
 * v2: Loan Amount and Tenure are now customer-adjustable (via sliders on
 * Step 5, within the min/max bounds below) rather than fixed values — the
 * interest rate and processing fee stay fixed for this prototype.
 * `calculateEmi` recomputes EMI + total interest live as either slider
 * moves, using a standard reducing-balance formula (no real underwriting/
 * scoring engine behind it — this is a prototype).
 */
export const LOAN_MIN_AMOUNT = 50000;
/** The mock "you're eligible for up to" ceiling shown on Step 5. */
export const LOAN_ELIGIBLE_MAX_AMOUNT = 600000;
export const LOAN_AMOUNT_STEP = 10000;
/** Starting slider position — mid-range, comfortably below the eligible max. */
export const LOAN_DEFAULT_AMOUNT = 400000;

export const LOAN_MIN_TENURE_MONTHS = 6;
export const LOAN_MAX_TENURE_MONTHS = 60;
export const LOAN_TENURE_STEP_MONTHS = 6;
export const LOAN_DEFAULT_TENURE_MONTHS = 36;

/** Fixed for this prototype — not customer-editable. */
export const LOAN_OFFER_INTEREST_RATE_PERCENT = 11;
export const LOAN_OFFER_PROCESSING_FEE = 4000;
export const LOAN_OFFER_SUPPORT_EMAIL = 'support@scoremedlp-demo.com';

export interface LoanCalculation {
  emi: number;
  totalInterest: number;
  /** Cosmetic-only approximation for the Key Fact Statement — a real APR
   *  would run a proper IRR against the fee-adjusted cash flows; this
   *  prototype uses a fixed +0.8 offset over the flat rate, matching the
   *  original mock's 11% / 11.8% relationship. */
  aprPercent: number;
}

/**
 * Standard reducing-balance EMI formula:
 *   EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
 * where `r` is the monthly rate and `n` is the tenure in months.
 */
export function calculateEmi(
  principal: number,
  tenureMonths: number,
  annualRatePercent: number = LOAN_OFFER_INTEREST_RATE_PERCENT,
): LoanCalculation {
  const monthlyRate = annualRatePercent / 12 / 100;
  const growth = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * growth) / (growth - 1);
  const totalInterest = emi * tenureMonths - principal;

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    aprPercent: Math.round((annualRatePercent + 0.8) * 10) / 10,
  };
}

/** Generates a readable, unique-looking mock application ID once per flow
 *  (called on first mount of Step 5 — see CustomerFlowContext). Not a
 *  real application/reference-number scheme, just prototype flavor. */
export function generateApplicationId(): string {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SMDLP-IDBI-${random}`;
}

/** Formats "today" as the mock sanction date, e.g. "14 Aug 2026". */
export function formatSanctionDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
