import { useState } from 'react';
import BankerHeader from './BankerHeader';
import BankerDashboard from './BankerDashboard';
import BankerApplicationsList from './BankerApplicationsList';
import BankerApplicationDetail from './BankerApplicationDetail';
import type { ApplicationDetailTab } from './BankerApplicationDetail';
import type { BankerApplicationSummary } from './mockBankerData.constants';
import './BankerTheme.css';
import './BankerFlowContainer.css';

interface BankerFlowContainerProps {
  /** Ends the banker's session, back to the platform Hub. */
  onExit: () => void;
}

type BankerScreen = 'dashboard' | 'applications' | 'application-detail';

/**
 * IDBI Bank Personal Loan Journey — Banker role workspace.
 *
 * Fully independent of the Customer Flow (`../customer/`): its own root
 * container, its own screens, its own mock data, and its own local IDBI
 * theme tokens (scoped to `.banker-shell` only, see BankerTheme.css) — no
 * file in this folder imports from, or is imported by, `../customer/`, so
 * a change on either side can never affect the other (per this journey's
 * folder-isolation requirement between roles, and CLAUDE.md rule 1/2).
 *
 * Reference: Figma screenshots of IDBI's own Banker portal, supplied
 * directly rather than sourced from a live/public product.
 */
function BankerFlowContainer({ onExit }: BankerFlowContainerProps) {
  const [screen, setScreen] = useState<BankerScreen>('dashboard');
  const [selectedApplication, setSelectedApplication] = useState<BankerApplicationSummary | null>(null);
  const [detailTab, setDetailTab] = useState<ApplicationDetailTab>('overview');

  const openApplication = (application: BankerApplicationSummary) => {
    setSelectedApplication(application);
    setDetailTab('overview');
    setScreen('application-detail');
  };

  const backToApplications = () => {
    setScreen('applications');
    setSelectedApplication(null);
  };

  const showTabs = screen === 'dashboard' || screen === 'applications';

  return (
    <div className="banker-shell">
      <BankerHeader onLogout={onExit} />

      {showTabs && (
        <nav className="banker-tabs" aria-label="Banker sections">
          <button
            type="button"
            className={`banker-tab ${screen === 'dashboard' ? 'banker-tab--active' : ''}`}
            onClick={() => setScreen('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`banker-tab ${screen === 'applications' ? 'banker-tab--active' : ''}`}
            onClick={() => setScreen('applications')}
          >
            All Application
          </button>
        </nav>
      )}

      {screen === 'dashboard' && <BankerDashboard onViewAllApplications={() => setScreen('applications')} />}
      {screen === 'applications' && <BankerApplicationsList onViewApplication={openApplication} />}
      {screen === 'application-detail' && selectedApplication && (
        <BankerApplicationDetail
          application={selectedApplication}
          activeTab={detailTab}
          onTabChange={setDetailTab}
          onBackToApplications={backToApplications}
        />
      )}
    </div>
  );
}

export default BankerFlowContainer;
