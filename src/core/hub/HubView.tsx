import scoreMeLogo from '../../assets/scoreme-logo.png';
import { getJourneys } from '../registry/registry';
import './HubView.css';

interface HubViewProps {
  userId: string;
  onLogout: () => void;
  /** Called with a journey's `meta.id` when its card is activated. */
  onSelectJourney: (journeyId: string) => void;
}

/**
 * Screen 2 — Journey Hub.
 *
 * Single-row header (logo + session info + log out), a responsive grid of
 * journey cards sourced entirely from the registry, and a minimal footer.
 * Renders whatever `getJourneys()` returns — including today's empty
 * array, in which case a restrained empty state is shown instead of a
 * grid. This view must never import from src/journeys/ directly; the
 * registry is the only permitted seam.
 */
function HubView({ userId, onLogout, onSelectJourney }: HubViewProps) {
  const journeys = getJourneys();

  return (
    <div className="hub-screen">
      <header className="hub-header">
        <div className="hub-header-brand">
          <img src={scoreMeLogo} alt="ScoreMe" className="hub-logo" />
          <span className="hub-header-label">Journey Hub</span>
        </div>

        <div className="hub-header-session">
          <span className="hub-user">
            Signed in as <strong className="hub-user-id">{userId}</strong>
          </span>
          <button type="button" className="hub-logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="hub-main">
        <div>
          <h1 className="hub-heading">Journeys</h1>
          <p className="hub-subtext">Select a journey below to get started.</p>
        </div>

        {journeys.length === 0 ? (
          <div className="hub-empty">
            <svg
              className="hub-empty-icon"
              viewBox="0 0 64 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              focusable="false"
              aria-hidden="true"
            >
              <path d="M6 16a2 2 0 0 1 2-2h11l4 5h29a2 2 0 0 1 2 2v25a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V16Z" />
            </svg>
            <h2 className="hub-empty-title">No journeys available yet.</h2>
            <p className="hub-empty-subtext">
              Check back soon — new journeys will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="hub-grid">
            {journeys.map(({ meta }) => {
              const JourneyIcon = meta.icon;
              return (
                <button
                  type="button"
                  className="hub-card"
                  key={meta.id}
                  onClick={() => onSelectJourney(meta.id)}
                >
                  <span className="hub-card-icon" aria-hidden="true">
                    <JourneyIcon />
                  </span>
                  <h2 className="hub-card-title">{meta.title}</h2>
                  <p className="hub-card-description">{meta.description}</p>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <footer className="hub-footer">
        <span>© 2026 ScoreMe Solutions</span>
        <span className="hub-footer-version">v0.1.0</span>
      </footer>
    </div>
  );
}

export default HubView;
