import { useState } from 'react';
import JourneyHeader from './JourneyHeader';
import InlineNotice from './InlineNotice';
import './RoleSelectScreen.css';

interface RoleSelectScreenProps {
  /** Advances into the Customer Flow. */
  onSelectCustomer: () => void;
  /** Advances into the Banker workspace. */
  onSelectBanker: () => void;
  /** Hands control back to the Hub. */
  onExit: () => void;
}

type InertRole = 'admin';

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" strokeLinecap="round" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Journey entry point — shown immediately when `IdbiPersonalLoanView`
 * mounts, before either role's workspace. "Customer" and "Banker" are both
 * wired up now, each into its own fully independent component tree
 * (`../customer/` and `../banker/` respectively — see CLAUDE.md rule 1/2
 * and this journey's folder-isolation requirement between roles). "Admin"
 * stays fully focusable/keyboard-reachable (real accessibility, not a
 * disabled dead-end) but only ever shows an inert "coming soon" notice.
 */
function RoleSelectScreen({ onSelectCustomer, onSelectBanker, onExit }: RoleSelectScreenProps) {
  const [inertRole, setInertRole] = useState<InertRole | null>(null);

  const roleLabel: Record<InertRole, string> = { admin: 'Admin' };

  return (
    <div className="role-select-screen">
      <JourneyHeader onExit={onExit} />

      <main className="role-select-main">
        <div className="role-select-panel">
          <div className="role-select-intro">
            <h1 className="role-select-heading">Choose your role</h1>
            <p className="role-select-subtext">
              Select how you&rsquo;d like to continue with the IDBI Bank Personal Loan
              journey.
            </p>
          </div>

          {inertRole && (
            <InlineNotice message={`${roleLabel[inertRole]} access is coming soon.`} />
          )}

          <div className="role-select-grid">
            <button
              type="button"
              className="role-card role-card--active"
              onClick={onSelectCustomer}
            >
              <span className="role-card-icon" aria-hidden="true">
                <PersonIcon />
              </span>
              <h2 className="role-card-title">Customer</h2>
              <p className="role-card-description">
                Apply for a new personal loan or continue an existing application.
              </p>
            </button>

            <button
              type="button"
              className="role-card role-card--active"
              onClick={onSelectBanker}
            >
              <span className="role-card-icon" aria-hidden="true">
                <BriefcaseIcon />
              </span>
              <h2 className="role-card-title">Banker</h2>
              <p className="role-card-description">
                Review, verify and process customer loan applications.
              </p>
            </button>

            <button
              type="button"
              className="role-card role-card--inert"
              onClick={() => setInertRole('admin')}
            >
              <span className="role-card-badge">Coming soon</span>
              <span className="role-card-icon" aria-hidden="true">
                <ShieldIcon />
              </span>
              <h2 className="role-card-title">Admin</h2>
              <p className="role-card-description">
                Configure journey settings and oversee platform activity.
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RoleSelectScreen;
