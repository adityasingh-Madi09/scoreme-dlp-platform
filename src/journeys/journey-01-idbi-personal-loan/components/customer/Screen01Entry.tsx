import { useEffect, useState } from 'react';
import { Button } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import InlineNotice from '../InlineNotice';
import './Screen01Entry.css';

const FEATURES = [
  'Instant personal loan up to ₹10 lakhs',
  'Cash-flow based assessment',
  'Digital verification',
  'Flexible tenure up to 60 months',
  'Competitive interest rates',
];

function CheckIcon() {
  return (
    <svg
      className="screen-entry-feature-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

/**
 * Customer Flow — Screen 1 (Entry). Short value proposition, the feature
 * checklist, and two in-content secondary actions: "Resume Saved
 * Application" and "Track Application Status" (both mocked — show an
 * inline "coming soon" notice and never navigate).
 *
 * PROOF OF WIRING for the `stepActions` mechanism (see
 * `useCustomerFlow.ts`): the primary "Apply Now" action is no longer this
 * screen's own inline button — it wires `canContinue: true` and
 * `onContinue: goNext` into the Customer Flow context instead, so
 * `CustomerFlowContainer`'s shared `JourneyLayout` footer (labeled "Apply
 * Now" for this step specifically) is what actually advances to Screen 2.
 */
function Screen01Entry() {
  const { goNext, setStepActions } = useCustomerFlow();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setStepActions({ canContinue: true, onContinue: goNext });
    return () => setStepActions(null);
  }, [goNext, setStepActions]);

  return (
    <section className="screen-entry">
      <div className="screen-entry-card">
        <div>
          <p className="screen-entry-lead">Apply for a personal loan, fully online.</p>
          <p className="screen-entry-subtext">
            Check your eligibility, verify your details digitally, and get a
            decision faster with IDBI Bank&rsquo;s fully digital personal loan
            process.
          </p>
        </div>

        <div>
          <h2 className="screen-entry-features-title">IDBI Personal Loan Features</h2>
          <ul className="screen-entry-features-list">
            {FEATURES.map((feature) => (
              <li className="screen-entry-feature" key={feature}>
                <CheckIcon />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {notice && <InlineNotice message={notice} />}

        <div className="screen-entry-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setNotice('Resume Saved Application is coming soon.')}
          >
            Resume Saved Application
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setNotice('Track Application Status is coming soon.')}
          >
            Track Application Status
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Screen01Entry;
