/* ============================================================
   JourneyLayout — the mandatory shell for every multi-step
   journey screen (Header + always-visible compact stepper + navy
   ribbon page title + scrollable MainContent + sticky
   ActionFooter).

   v3: replaced the v2 hover-only "minimal progress bar + View all
   steps popover" with an always-visible horizontal stepper — every
   step's circle/connector is visible at all times (matching a
   traditional bank-portal stepper, per client reference screenshots),
   but kept deliberately compact/minimal (small circles, thin
   connector line doubles as the progress indicator, short labels)
   rather than the heavier boxed style in the reference — a "combine
   both" of the v2 minimal aesthetic and full always-on visibility.
   See docs/journey-01-idbi-personal-loan-plan.md.

   The footer renders the shared `Button` component instead of a
   hardcoded `.jl-btn` markup, so there is exactly one button color
   system platform-wide.

   Drop this file at: src/core/components/JourneyLayout.tsx
   Its CSS companion goes at: src/core/components/JourneyLayout.css
   ============================================================ */

import { Check, LogOut } from 'lucide-react';
import Button from './Button';
import './JourneyLayout.css';

export interface JourneyStep {
  id: string;
  label: string;
  /** Short 1-2 word version shown under the stepper's circle, where the
   *  full `label` would wrap awkwardly across 7 always-visible nodes.
   *  Falls back to `label` when omitted. The full `label` is still what
   *  shows in the ribbon page title above the long-form card. */
  shortLabel?: string;
}

interface JourneyLayoutProps {
  journeyName: string;
  logoSrc: string;
  steps: JourneyStep[];
  currentStepIndex: number; // 0-based
  pageTitle: string;
  pageSubtitle?: string;
  onExit?: () => void;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  hideBack?: boolean;
  children: React.ReactNode;
  /** Optional persistent right-rail content (e.g. a running "Application
   *  Summary" card). Purely a layout slot — JourneyLayout renders whatever
   *  a journey passes in, with no knowledge of what it contains, so this
   *  stays journey-agnostic per CLAUDE.md rule 2. Omit entirely for screens
   *  that don't need one; the main column simply uses the freed-up space. */
  sidePanel?: React.ReactNode;
}

export function JourneyLayout({
  journeyName,
  logoSrc,
  steps,
  currentStepIndex,
  pageTitle,
  pageSubtitle,
  onExit,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  hideBack = false,
  children,
  sidePanel,
}: JourneyLayoutProps) {
  const total = steps.length;

  return (
    <div className="jl-shell">
      {/* Header */}
      <header className="jl-header">
        <div className="jl-header-left">
          <img src={logoSrc} alt="ScoreMe" className="jl-logo" />
          <span className="jl-divider" />
          <span className="jl-journey-name">{journeyName}</span>
        </div>
        <div className="jl-header-right">
          {onExit && (
            <button className="jl-exit-btn" onClick={onExit} type="button">
              <LogOut size={16} />
              Exit
            </button>
          )}
        </div>
      </header>

      {/* Always-visible compact stepper — every step's circle + connector
          shows at once (no hover needed to see the roadmap), but stays
          minimal: small circles, a thin connector line that fills in as
          the "progress" indicator, short labels. */}
      <nav className="jl-stepper" aria-label="Application progress">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const state = isDone ? 'done' : isCurrent ? 'current' : 'upcoming';
          return (
            <div
              key={step.id}
              className={`jl-stepper-node jl-stepper-node--${state}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="jl-stepper-circle" aria-hidden="true">
                {isDone ? <Check size={11} /> : idx + 1}
              </span>
              <span className="jl-stepper-label">{step.shortLabel ?? step.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="jl-body">
        {/* Scrollable main content */}
        <main className="jl-main">
          <div className={sidePanel ? 'jl-content-row' : 'jl-content-row jl-content-row--full'}>
            <div className="jl-main-inner">
              <div className="jl-ribbon-title">
                <p className="jl-ribbon-eyebrow">
                  Step {currentStepIndex + 1} of {total}
                </p>
                <h1>{pageTitle}</h1>
                {pageSubtitle && <p className="jl-ribbon-subtitle">{pageSubtitle}</p>}
              </div>
              <div className="jl-long-form-card">{children}</div>
            </div>
            {sidePanel && <aside className="jl-summary-rail">{sidePanel}</aside>}
          </div>
        </main>
      </div>

      {/* Sticky action footer */}
      <footer className="jl-footer">
        <div
          className={
            sidePanel ? 'jl-footer-inner' : 'jl-footer-inner jl-footer-inner--narrow'
          }
        >
          {!hideBack && onBack ? (
            <Button type="button" variant="secondary" className="jl-footer-btn" onClick={onBack}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {onContinue && (
            <Button
              type="button"
              variant="primary"
              className="jl-footer-btn"
              onClick={onContinue}
              disabled={continueDisabled}
            >
              {continueLabel}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
