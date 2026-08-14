/**
 * Customer Flow shared state — the React context "brain" behind the IDBI
 * Personal Loan Customer journey. Scoped entirely inside this journey's
 * folder; never imported by core or any other journey.
 *
 * v2: consolidated from 14 screens down to 7 (Get Started, Identity &
 * Basic Info, Address & Employment, Income & Nominee, Loan Offer, Verify &
 * Consent, Success) per the approved ribbon redesign — see
 * docs/journey-01-idbi-personal-loan-plan.md. `CustomerFlowData`'s field
 * shape is unchanged; only which screen owns/reads each field moved.
 *
 * Split into two files purely to satisfy this project's react-refresh lint
 * rule (`react-refresh/only-export-components`), which errors on any
 * `.tsx` file that exports both a component and non-component values:
 *   - this file (`useCustomerFlow.ts`, plain `.ts`, no JSX) owns the actual
 *     `Context` object, the shared types/constants, and the
 *     `useCustomerFlow` hook.
 *   - `CustomerFlowContext.tsx` owns only the `CustomerFlowProvider`
 *     component that renders `<CustomerFlowContext.Provider>` around the
 *     flow.
 */
import { createContext, useContext } from 'react';
import {
  calculateEmi,
  LOAN_DEFAULT_AMOUNT,
  LOAN_DEFAULT_TENURE_MONTHS,
  LOAN_OFFER_INTEREST_RATE_PERCENT,
  LOAN_OFFER_PROCESSING_FEE,
} from '../mockLoanOffer.constants';

/** Total number of screens in the full Customer Flow, per the approved
 *  7-step consolidated plan. */
export const TOTAL_CUSTOMER_FLOW_STEPS = 7;

/**
 * Highest step number with a real screen built so far. `CustomerFlowContainer`
 * shows a "more screens coming soon" placeholder for any step beyond this.
 * Equal to `TOTAL_CUSTOMER_FLOW_STEPS` — all 7 Customer Flow screens are
 * built, so that placeholder is effectively dead code today, but is left in
 * place as a defensive fallback should `TOTAL_CUSTOMER_FLOW_STEPS` ever grow
 * again before the next screen is built.
 */
export const MAX_BUILT_STEP = 7;

/**
 * Data collected across the Customer Flow. Screens 1-3 populate the
 * mobile-number fields; Screen 4 (Aadhaar + PAN entry, mock Aadhaar-linked
 * OTP) adds the identity fields and the mock "auto-fetched KYC record";
 * Screen 5 (Basic Information) adds the editable profile fields; Screen 6
 * (Address) adds the current/permanent address fields and the address
 * proof upload filename; Screen 7 (Professional/Employment) adds the
 * occupation/employment fields; Screen 8 (Income Details) adds the primary
 * bank, ITR-fetch and optional Udyam registration fields; Screen 9
 * (Nominee Details) adds the optional nominee and the director/senior
 * officer relationship-disclosure fields; Screen 10 (Loan Offer) adds the
 * mock application ID/sanction date/loan terms and the accept/reject
 * outcome; Screen 11 (Liveliness Check) adds the simulated-check pass
 * state; Screen 12 (Terms & Conditions) adds the T&C acceptance checkbox
 * state; Screen 13 (Final OTP Confirmation) adds the final-OTP-verified
 * flag that actually confirms/accepts the loan offer. Screen 14 (Success)
 * reads existing fields only (application ID, loan terms) and adds none of
 * its own.
 */
export interface CustomerFlowData {
  /** Raw 10-digit mobile number entered on Screen 2. */
  mobileNumber: string;
  /** Set once Screen 3's OTP verification succeeds. */
  isMobileVerified: boolean;

  /** Raw 12-digit Aadhaar number entered on Screen 4. */
  aadhaarNumber: string;
  /** PAN entered on Screen 4, always stored upper-cased. */
  panNumber: string;
  /** Set once Screen 4's Aadhaar-linked mobile OTP verification succeeds —
   *  marks the customer's identity as fully authenticated for this flow. */
  isAuthComplete: boolean;

  /** Mock "auto-fetched KYC record" populated on Screen 4 OTP success,
   *  simulating a real KYC/Aadhaar data-pull. Read-only from Screen 5
   *  onward — static placeholder values, not real PII. */
  kycFirstName: string;
  kycMiddleName: string;
  kycLastName: string;
  kycGender: string;
  kycDateOfBirth: string;
  kycMotherMaidenName: string;
  kycFatherName: string;

  /** Screen 5 (Basic Information) — editable fields. */
  title: string;
  preferredCardName: string;
  maritalStatus: string;
  /** Only required/rendered when `maritalStatus` is 'Married'. */
  spouseName: string;
  educationalQualification: string;
  personalEmail: string;
  /** Set once Screen 5's email OTP verification succeeds. Gates "Save &
   *  Continue" on that screen. */
  isEmailVerified: boolean;

  /** Screen 6 (Address) — Current Address section. */
  currentAddressLine1: string;
  /** Optional. */
  currentAddressLine2: string;
  currentPincode: string;
  currentCity: string;
  currentState: string;

  /** Screen 6 (Address) — Permanent Address section. When
   *  `permanentSameAsCurrent` is true, the permanent* fields below are kept
   *  in sync with their current* counterparts (see Screen06Address's
   *  effect) and rendered read-only; unchecking leaves whatever values were
   *  last there editable again. */
  permanentSameAsCurrent: boolean;
  permanentAddressLine1: string;
  /** Optional. */
  permanentAddressLine2: string;
  permanentPincode: string;
  permanentCity: string;
  permanentState: string;

  /** Screen 6 (Address) — address proof upload. Only the selected file's
   *  *name* is kept here (for display/"change file" purposes) rather than
   *  the actual `File` object — this is a client-only mock flow with no
   *  real upload/network call, and `File` objects aren't easily
   *  serializable/typed as plain flow state, so persisting just the
   *  filename string keeps `CustomerFlowData` simple, plain data. */
  addressProofFileName: string;

  /** Screen 7 (Professional/Employment) — editable fields. */
  occupationType: string;
  employerType: string;
  employmentType: string;
  officeCompanyName: string;
  designation: string;
  department: string;
  officeFlatBuilding: string;
  officeRoadName: string;
  officePincode: string;
  presentCity: string;
  /** Optional. */
  presentLandmark: string;
  officeMobile: string;
  officeEmail: string;
  yearsInCurrentOrg: string;
  noOfDependents: string;

  /** Screen 8 (Income Details) — Primary Bank Details. `bankName` is a mock
   *  "looked up from IFSC" value only ever populated by the Verify Bank
   *  Details action (see Screen08Income), never typed directly. */
  ifscCode: string;
  accountNumber: string;
  isBankVerified: boolean;
  bankName: string;

  /** Screen 8 (Income Details) — ITR fetch (informational/optional; does
   *  not gate that screen's "Save & Continue" — see Screen08Income). */
  itrUsername: string;
  itrPassword: string;
  isItrFetched: boolean;

  /** Screen 8 (Income Details) — Udyam Registration Details. Entirely
   *  optional; does not gate "Save & Continue". */
  urnNumber: string;
  isUrnVerified: boolean;

  /** Screen 9 (Nominee Details) — nominee toggle + fields. `''` means "not
   *  yet chosen"; only rendered/required when set to 'Yes'. Switching to
   *  'No' clears any previously entered nominee* fields below (same
   *  conditional-clear pattern as Screen05's spouse name). */
  hasNominee: 'Yes' | 'No' | '';
  nomineeName: string;
  nomineeRelationship: string;
  nomineeDateOfBirth: string;
  nomineeAddress: string;
  nomineePincode: string;
  nomineeCity: string;
  nomineeState: string;

  /** Screen 9 (Nominee Details) — Relationship Disclosure (bank KYC/
   *  compliance field). `''` means "not yet chosen"; the two fields below
   *  are only rendered/required when set to 'Yes', and get cleared when
   *  switched back to 'No'. */
  isRelatedToDirector: 'Yes' | 'No' | '';
  directorRelationship: string;
  directorName: string;

  /** Step 5 (Loan Offer) — mock application ID + sanction date, generated
   *  once on first mount of that screen and left as `''` until then.
   *  `loanOfferAmount`/`loanOfferTenureMonths` are now customer-adjustable
   *  via sliders (see Step5LoanOffer + `mockLoanOffer.constants.ts`'s
   *  `calculateEmi`) rather than fixed values — `loanOfferEmi` and
   *  `loanOfferAprPercent` are recomputed every time either slider moves,
   *  so later screens (Verify & Consent, Success) always read the
   *  customer's actually-chosen numbers. `loanOfferInterestRatePercent`
   *  and `loanOfferProcessingFee` stay fixed for this prototype. */
  applicationId: string;
  loanOfferSanctionDate: string;
  loanOfferAmount: number;
  loanOfferTenureMonths: number;
  loanOfferInterestRatePercent: number;
  loanOfferProcessingFee: number;
  loanOfferEmi: number;
  loanOfferAprPercent: number;
  /** '' = not yet decided; set by the Accept/Reject Offer buttons on
   *  Step 5. 'Rejected' shows a graceful terminal state on that same
   *  screen rather than advancing. */
  loanOfferOutcome: 'Accepted' | 'Rejected' | '';

  /** Step 6 (Verify & Consent) — set once the simulated liveliness check
   *  completes, unlocking that screen's Terms & Conditions section. */
  isLivelinessComplete: boolean;

  /** Step 6 (Verify & Consent) — set once the applicant checks "I have
   *  read and accepted the Terms & Conditions and Guidelines", unlocking
   *  that same screen's final e-sign OTP section. */
  termsAccepted: boolean;

  /** Step 6 (Verify & Consent) — set once the final confirmation OTP is
   *  verified, which is what actually confirms/accepts the loan offer and
   *  unlocks Step 7 (Success). */
  finalOtpVerified: boolean;
}

export const initialCustomerFlowData: CustomerFlowData = {
  mobileNumber: '',
  isMobileVerified: false,

  aadhaarNumber: '',
  panNumber: '',
  isAuthComplete: false,

  kycFirstName: '',
  kycMiddleName: '',
  kycLastName: '',
  kycGender: '',
  kycDateOfBirth: '',
  kycMotherMaidenName: '',
  kycFatherName: '',

  title: '',
  preferredCardName: '',
  maritalStatus: '',
  spouseName: '',
  educationalQualification: '',
  personalEmail: '',
  isEmailVerified: false,

  currentAddressLine1: '',
  currentAddressLine2: '',
  currentPincode: '',
  currentCity: '',
  currentState: '',

  permanentSameAsCurrent: false,
  permanentAddressLine1: '',
  permanentAddressLine2: '',
  permanentPincode: '',
  permanentCity: '',
  permanentState: '',

  addressProofFileName: '',

  occupationType: '',
  employerType: '',
  employmentType: '',
  officeCompanyName: '',
  designation: '',
  department: '',
  officeFlatBuilding: '',
  officeRoadName: '',
  officePincode: '',
  presentCity: '',
  presentLandmark: '',
  officeMobile: '',
  officeEmail: '',
  yearsInCurrentOrg: '',
  noOfDependents: '',

  ifscCode: '',
  accountNumber: '',
  isBankVerified: false,
  bankName: '',

  itrUsername: '',
  itrPassword: '',
  isItrFetched: false,

  urnNumber: '',
  isUrnVerified: false,

  hasNominee: '',
  nomineeName: '',
  nomineeRelationship: '',
  nomineeDateOfBirth: '',
  nomineeAddress: '',
  nomineePincode: '',
  nomineeCity: '',
  nomineeState: '',

  isRelatedToDirector: '',
  directorRelationship: '',
  directorName: '',

  applicationId: '',
  loanOfferSanctionDate: '',
  loanOfferAmount: LOAN_DEFAULT_AMOUNT,
  loanOfferTenureMonths: LOAN_DEFAULT_TENURE_MONTHS,
  loanOfferInterestRatePercent: LOAN_OFFER_INTEREST_RATE_PERCENT,
  loanOfferProcessingFee: LOAN_OFFER_PROCESSING_FEE,
  // Pre-computed so the sliders' starting position and the summary tiles
  // agree from the very first render, before the customer touches either
  // slider — see Step5LoanOffer, which recomputes both on every drag.
  loanOfferEmi: calculateEmi(LOAN_DEFAULT_AMOUNT, LOAN_DEFAULT_TENURE_MONTHS).emi,
  loanOfferAprPercent: calculateEmi(LOAN_DEFAULT_AMOUNT, LOAN_DEFAULT_TENURE_MONTHS).aprPercent,
  loanOfferOutcome: '',

  isLivelinessComplete: false,

  termsAccepted: false,
  finalOtpVerified: false,
};

/**
 * The generic shared footer's "Continue" behavior for whichever screen is
 * currently mounted. Each screen calls `setStepActions` (via a `useEffect`
 * keyed on its own validity/handler dependencies, with a `setStepActions
 * (null)` cleanup on unmount) to wire itself into `CustomerFlowContainer`'s
 * single `JourneyLayout` instance, instead of every screen owning its own
 * inline submit button. Screens that haven't been migrated yet (or that
 * deliberately have no generic "Continue", e.g. terminal/branching screens)
 * simply never call this, leaving `stepActions` `null` — which is exactly
 * the state that makes `JourneyLayout` render no Continue button at all.
 */
export interface CustomerFlowStepActions {
  canContinue: boolean;
  onContinue: () => void;
}

export interface CustomerFlowContextValue {
  /** 1-based current screen number within the Customer Flow. */
  step: number;
  /** Advance to `step + 1`, clamped to `TOTAL_CUSTOMER_FLOW_STEPS`. */
  goNext: () => void;
  /** Return to `step - 1`, clamped to 1 (never exits the flow itself). */
  goBack: () => void;
  /** Jump directly to an arbitrary step (e.g. "change mobile number"). */
  goToStep: (step: number) => void;
  data: CustomerFlowData;
  /** Shallow-merges a partial patch into `data`. */
  updateData: (patch: Partial<CustomerFlowData>) => void;
  /** See `CustomerFlowStepActions`. `null` until the current screen wires
   *  itself in (or once it unmounts). */
  stepActions: CustomerFlowStepActions | null;
  setStepActions: (actions: CustomerFlowStepActions | null) => void;
}

export const CustomerFlowContext = createContext<CustomerFlowContextValue | null>(
  null,
);

/**
 * Reads the Customer Flow context. Must be called from a component
 * rendered inside `CustomerFlowProvider` (see `CustomerFlowContext.tsx`).
 */
export function useCustomerFlow(): CustomerFlowContextValue {
  const ctx = useContext(CustomerFlowContext);
  if (!ctx) {
    throw new Error('useCustomerFlow must be used within a CustomerFlowProvider');
  }
  return ctx;
}
