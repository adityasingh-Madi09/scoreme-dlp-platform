import scoreMeLogo from '../../../../assets/scoreme-logo.png';
import { Button, JourneyLayout } from '../../../../core/components';
import type { JourneyStep } from '../../../../core/components';
import ApplicationSummaryPanel from '../ApplicationSummaryPanel';
import CustomerFlowProvider from '../../context/CustomerFlowContext';
import { MAX_BUILT_STEP, TOTAL_CUSTOMER_FLOW_STEPS, useCustomerFlow } from '../../context/useCustomerFlow';
import Step1GetStarted from './Step1GetStarted';
import Step2IdentityBasicInfo from './Step2IdentityBasicInfo';
import Step3AddressEmployment from './Step3AddressEmployment';
import Step4IncomeNominee from './Step4IncomeNominee';
import Step5LoanOffer from './Step5LoanOffer';
import Step6VerifyConsent from './Step6VerifyConsent';
import Step7Success from './Step7Success';
import './CustomerFlowContainer.css';

/**
 * The 7 consolidated Customer Flow steps, in order — drives `JourneyLayout`'s
 * always-visible stepper and the ribbon page title. `label` is the full
 * descriptive name (shown in the ribbon title and the Application Summary
 * panel's checklist); `shortLabel` is the compact version shown under each
 * stepper circle, per the v3 "combine both" stepper redesign — see
 * docs/journey-01-idbi-personal-loan-plan.md.
 */
const CUSTOMER_FLOW_STEPS: JourneyStep[] = [
  { id: 'get-started', label: 'Get Started', shortLabel: 'Get Started' },
  { id: 'identity-basic-info', label: 'Identity & Basic Info', shortLabel: 'Identity' },
  { id: 'address-employment', label: 'Address & Employment', shortLabel: 'Address' },
  { id: 'income-nominee', label: 'Income & Nominee', shortLabel: 'Income' },
  { id: 'loan-offer', label: 'Loan Offer', shortLabel: 'Loan Offer' },
  { id: 'verify-consent', label: 'Verify & Consent', shortLabel: 'Verify' },
  { id: 'success', label: 'Success', shortLabel: 'Success' },
];

interface CustomerFlowContainerProps {
  /** Hands control back to the Hub, closing this journey's workspace. */
  onExit: () => void;
  /** Returns to the Role Select screen (does not exit the journey). */
  onBackToRoleSelect: () => void;
}

/**
 * Customer Flow stepper shell. Wraps everything in `CustomerFlowProvider`
 * so any descendant screen can read/update the shared flow state via
 * `useCustomerFlow`, and renders whichever screen matches the current step
 * inside the shared `JourneyLayout` shell (core).
 *
 * All 7 consolidated Customer Flow screens are real — `MoreScreensPlaceholder`
 * below is kept only as a defensive fallback (renders for any step beyond
 * `MAX_BUILT_STEP`, which equals `TOTAL_CUSTOMER_FLOW_STEPS`, so in practice
 * it never shows).
 */
function CustomerFlowContainer({ onExit, onBackToRoleSelect }: CustomerFlowContainerProps) {
  return (
    <CustomerFlowProvider>
      <CustomerFlowSteps onExit={onExit} onBackToRoleSelect={onBackToRoleSelect} />
    </CustomerFlowProvider>
  );
}

interface CustomerFlowStepsProps {
  onExit: () => void;
  onBackToRoleSelect: () => void;
}

/**
 * Not exported — must stay a descendant of `CustomerFlowProvider` so it can
 * call `useCustomerFlow`. Renders the shared `JourneyLayout` (header +
 * always-visible stepper + ribbon page title + scrollable main + sticky
 * action footer) around whichever screen matches the current step.
 *
 * The footer's Continue button is driven entirely by `stepActions` on the
 * Customer Flow context (see `useCustomerFlow.ts`) — only Step 1 wires
 * itself into this mechanism (via `setStepActions`); every other step owns
 * its own inline "Save & Continue" / equivalent action, so `stepActions`
 * stays `null` for them and `JourneyLayout` renders no footer Continue
 * button at all (matching the platform's existing per-screen convention).
 */
function CustomerFlowSteps({ onExit, onBackToRoleSelect }: CustomerFlowStepsProps) {
  const { step, data, goBack, stepActions } = useCustomerFlow();
  const currentStepMeta = CUSTOMER_FLOW_STEPS[step - 1];

  return (
    <JourneyLayout
      journeyName="IDBI Bank Personal Loan"
      logoSrc={scoreMeLogo}
      steps={CUSTOMER_FLOW_STEPS}
      currentStepIndex={step - 1}
      pageTitle={currentStepMeta?.label ?? 'Personal Loan Application'}
      onExit={onExit}
      onBack={goBack}
      hideBack={step === 1}
      onContinue={stepActions?.onContinue}
      continueDisabled={!stepActions?.canContinue}
      sidePanel={<ApplicationSummaryPanel data={data} step={step} steps={CUSTOMER_FLOW_STEPS} />}
    >
      {step > MAX_BUILT_STEP ? (
        <MoreScreensPlaceholder step={step} onBackToRoleSelect={onBackToRoleSelect} />
      ) : (
        <CustomerFlowStep step={step} onExit={onExit} />
      )}
    </JourneyLayout>
  );
}

interface CustomerFlowStepProps {
  step: number;
  onExit: () => void;
}

function CustomerFlowStep({ step, onExit }: CustomerFlowStepProps) {
  switch (step) {
    case 1:
      return <Step1GetStarted />;
    case 2:
      return <Step2IdentityBasicInfo />;
    case 3:
      return <Step3AddressEmployment />;
    case 4:
      return <Step4IncomeNominee />;
    case 5:
      return <Step5LoanOffer onExit={onExit} />;
    case 6:
      return <Step6VerifyConsent />;
    case 7:
      return <Step7Success onExit={onExit} />;
    default:
      return <Step1GetStarted />;
  }
}

interface MoreScreensPlaceholderProps {
  step: number;
  onBackToRoleSelect: () => void;
}

/**
 * Shown for any step beyond `MAX_BUILT_STEP`. Since `MAX_BUILT_STEP` equals
 * `TOTAL_CUSTOMER_FLOW_STEPS` (all 7 Customer Flow screens are built), this
 * never actually renders today — kept only as a defensive fallback should
 * the total step count grow again before the next screen is built.
 */
function MoreScreensPlaceholder({ step, onBackToRoleSelect }: MoreScreensPlaceholderProps) {
  return (
    <section className="customer-flow-placeholder">
      <h1 className="customer-flow-placeholder-heading">More screens coming soon</h1>
      <p className="customer-flow-placeholder-text">
        Step {step} of {TOTAL_CUSTOMER_FLOW_STEPS} in the Customer Flow isn&rsquo;t built yet — it lands in an
        upcoming task. Your details so far have been saved.
      </p>
      <Button type="button" variant="secondary" onClick={onBackToRoleSelect}>
        Back to Role Select
      </Button>
    </section>
  );
}

export default CustomerFlowContainer;
