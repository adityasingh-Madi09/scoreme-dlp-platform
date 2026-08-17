import { LogOut } from 'lucide-react';
import scoreMeLogo from '../../../../assets/scoreme-logo.png';
import IdbiBankLogo from './IdbiBankLogo';
import './BankerHeader.css';

interface BankerHeaderProps {
  /** Ends the banker's session and returns to the platform Hub. */
  onLogout: () => void;
}

/**
 * Top bar for every Banker screen (banker-local, not shared with
 * components/customer/'s `JourneyHeader`) — a co-branded lockup (IDBI
 * Bank's own mark, since bankers are working inside their own
 * institution's tool, plus a small "Powered by ScoreMe" credit reusing
 * the platform's shared logo asset) and a Logout action.
 */
function BankerHeader({ onLogout }: BankerHeaderProps) {
  return (
    <header className="banker-header">
      <div className="banker-header-brand">
        <IdbiBankLogo />
        <span className="banker-header-divider" aria-hidden="true" />
        <div className="banker-header-powered-by">
          <span className="banker-header-powered-by-label">Powered by</span>
          <img src={scoreMeLogo} alt="ScoreMe" className="banker-header-scoreme-logo" />
        </div>
      </div>
      <button type="button" className="banker-logout" onClick={onLogout}>
        <LogOut size={15} aria-hidden="true" />
        Logout
      </button>
    </header>
  );
}

export default BankerHeader;
