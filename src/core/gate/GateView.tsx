import { useState } from 'react';
import type { FormEvent } from 'react';
import scoreMeLogo from '../../assets/scoreme-logo.png';
import { TextField, Button } from '../components';
import { GATE_USER_ID, GATE_PASSWORD } from './gate.constants';
import './GateView.css';

interface GateViewProps {
  /** Called with the trimmed, matched user ID once credentials check out. */
  onSuccess: (userId: string) => void;
}

/**
 * Screen 1 — Access Gate.
 *
 * Client-side-only "soft" gate for this prototype (see gate.constants.ts).
 * On successful match it hands off to the Hub (Screen 2) via `onSuccess`;
 * this component owns no notion of what happens after that.
 */
function GateView({ onSuccess }: GateViewProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // User ID: leading/trailing whitespace is trimmed before comparing,
    // since accidental spaces around an ID are a common, harmless typo.
    // Password: compared exactly as typed (no trimming), since whitespace
    // could intentionally be part of a password.
    const trimmedUserId = userId.trim();
    const isMatch =
      trimmedUserId === GATE_USER_ID && password === GATE_PASSWORD;

    if (isMatch) {
      setError('');
      onSuccess(trimmedUserId);
    } else {
      setError('User ID or password is incorrect. Please try again.');
    }
  };

  return (
    <main className="gate-screen">
      {/* Brand panel — desktop/tablet only, hidden entirely ≤768px. Purely
          decorative marketing content that duplicates the accessible
          logo/heading already present in the form panel, so it is removed
          from the accessibility tree instead of being announced twice. */}
      <section className="gate-brand" aria-hidden="true">
        {/* Abstract network/connectivity motif — pure inline SVG line-art,
            no image assets. Positioned to the right of the text content so
            it never collides with the logo chip or tagline. */}
        <svg
          className="gate-brand-accent"
          viewBox="0 0 420 420"
          fill="none"
          focusable="false"
        >
          <g stroke="rgba(255, 255, 255, 0.16)" strokeWidth="1">
            <line x1="46" y1="66" x2="156" y2="146" />
            <line x1="156" y1="146" x2="124" y2="264" />
            <line x1="156" y1="146" x2="284" y2="122" />
            <line x1="284" y1="122" x2="362" y2="214" />
            <line x1="284" y1="122" x2="232" y2="238" />
            <line x1="124" y1="264" x2="232" y2="238" />
            <line x1="232" y1="238" x2="302" y2="336" />
            <line x1="362" y1="214" x2="302" y2="336" />
          </g>
          <g fill="rgba(79, 195, 247, 0.34)">
            <circle cx="46" cy="66" r="4" />
            <circle cx="156" cy="146" r="5" />
            <circle cx="284" cy="122" r="4" />
            <circle cx="124" cy="264" r="4" />
            <circle cx="362" cy="214" r="5" />
            <circle cx="232" cy="238" r="4" />
            <circle cx="302" cy="336" r="4" />
          </g>
          <g fill="rgba(255, 255, 255, 0.5)">
            <circle cx="156" cy="146" r="2" />
            <circle cx="284" cy="122" r="2" />
            <circle cx="362" cy="214" r="2" />
          </g>
        </svg>

        <div className="gate-brand-content">
          <div className="gate-brand-logo-chip">
            <img src={scoreMeLogo} alt="" className="gate-brand-logo" />
          </div>
          <p className="gate-brand-tagline">
            Powering Digital Lending Journeys
          </p>

          <ul className="gate-brand-trust">
            <li className="gate-brand-trust-item">
              <svg
                className="gate-brand-trust-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                <path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3z" />
                <path d="M9.25 12.25l1.85 1.85 3.65-3.85" />
              </svg>
              <span>Bank-grade security</span>
            </li>
            <li className="gate-brand-trust-item">
              <svg
                className="gate-brand-trust-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M8.25 12.5l2.4 2.4L15.75 9.5" />
              </svg>
              <span>Enterprise-ready platform</span>
            </li>
            <li className="gate-brand-trust-item">
              <svg
                className="gate-brand-trust-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7.25V12l3.25 2" />
              </svg>
              <span>24x7 availability</span>
            </li>
          </ul>
        </div>
      </section>

      <div className="gate-form-panel">
        <div className="gate-card">
          <img src={scoreMeLogo} alt="ScoreMe" className="gate-logo" />

          <h1 className="gate-title">ScoreMe DLP Platform</h1>
          <p className="gate-subtitle">Enter your credentials to continue.</p>

          <form className="gate-form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="gate-user-id"
              name="userId"
              type="text"
              label="User ID"
              autoComplete="username"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />

            <TextField
              id="gate-password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error && (
              <p className="core-form-error" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="gate-submit">
              Enter
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default GateView;
