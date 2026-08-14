import { Smartphone, User } from 'lucide-react';
import type { JourneyStep } from '../../../core/components';
import type { CustomerFlowData } from '../context/useCustomerFlow';
import { TOTAL_CUSTOMER_FLOW_STEPS } from '../context/useCustomerFlow';
import './ApplicationSummaryPanel.css';

interface ApplicationSummaryPanelProps {
  data: CustomerFlowData;
  step: number;
  /** Short step labels, in order — used only for the "completed so far"
   *  mini-checklist. Passed down from `CustomerFlowContainer`'s own step
   *  list so this panel never needs its own separate copy of it. */
  steps: JourneyStep[];
}

const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Persistent right-rail "Application Summary" — a running snapshot of the
 * application's key facts, visible on every Customer Flow screen via
 * `JourneyLayout`'s generic `sidePanel` slot (core has no idea what this
 * renders; it only provides the layout column). Journey-local, not core,
 * since its fields are specific to this journey's `CustomerFlowData` shape.
 *
 * v2: redesigned with an applicant avatar, a completion-percentage progress
 * ring, an icon per data row, and a "completed so far" mini-checklist,
 * replacing the v1 plain label/value list — per the approved ribbon
 * redesign (see docs/journey-01-idbi-personal-loan-plan.md).
 *
 * Still deliberately only surfaces facts already collected earlier in the
 * flow (never anything from the current screen's own in-progress fields),
 * so it reads as a trustworthy running record rather than a duplicate of
 * the form the customer is mid-way through filling in.
 */
function ApplicationSummaryPanel({ data, step, steps }: ApplicationSummaryPanelProps) {
  const applicantName = [data.kycFirstName, data.kycLastName].filter(Boolean).join(' ');
  const initials =
    [data.kycFirstName?.[0], data.kycLastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';
  const percentComplete = Math.round((step / TOTAL_CUSTOMER_FLOW_STEPS) * 100);
  const ringOffset = RING_CIRCUMFERENCE - (percentComplete / 100) * RING_CIRCUMFERENCE;

  return (
    <div className="app-summary-panel">
      <div className="app-summary-panel-top">
        <span className="app-summary-panel-avatar" aria-hidden="true">
          {initials}
        </span>
        <div className="app-summary-panel-top-text">
          <p className="app-summary-panel-name">{applicantName || 'Not yet available'}</p>
          <p className="app-summary-panel-role">IDBI Personal Loan</p>
        </div>
      </div>

      <div className="app-summary-panel-ring-row">
        <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r={RING_RADIUS} fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle
            cx="20"
            cy="20"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--brand-navy)"
            strokeWidth="4"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={ringOffset}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
          />
        </svg>
        <div className="app-summary-panel-ring-text">
          <span className="app-summary-panel-ring-pct">{percentComplete}%</span>
          <span className="app-summary-panel-ring-label">application complete</span>
        </div>
      </div>

      <dl className="app-summary-panel-list">
        <div className="app-summary-panel-row">
          <span className="app-summary-panel-row-icon" aria-hidden="true">
            <Smartphone size={12} />
          </span>
          <div>
            <dt>Mobile No.</dt>
            <dd>{data.mobileNumber ? `+91 ${data.mobileNumber}` : 'Not yet available'}</dd>
          </div>
        </div>
        <div className="app-summary-panel-row">
          <span className="app-summary-panel-row-icon" aria-hidden="true">
            <User size={12} />
          </span>
          <div>
            <dt>Applicant</dt>
            <dd>{applicantName || 'Not yet available'}</dd>
          </div>
        </div>
      </dl>

      <div className="app-summary-panel-checklist">
        <p className="app-summary-panel-checklist-title">Completed so far</p>
        {steps.slice(0, step - 1).map((s) => (
          <p key={s.id} className="app-summary-panel-checklist-item">
            <span className="app-summary-panel-checklist-dot" aria-hidden="true">
              ✓
            </span>
            {s.label}
          </p>
        ))}
        {step === 1 && (
          <p className="app-summary-panel-checklist-empty">Nothing completed yet.</p>
        )}
      </div>
    </div>
  );
}

export default ApplicationSummaryPanel;
