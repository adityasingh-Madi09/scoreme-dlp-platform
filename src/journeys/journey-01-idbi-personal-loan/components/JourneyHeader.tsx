import { Button } from '../../../core/components';
import './JourneyHeader.css';

interface JourneyHeaderProps {
  /** Called when the user chooses to leave the journey entirely, back to
   *  the platform Hub. Kept visible on every screen (Role Select and every
   *  Customer Flow step) so nobody gets stuck mid-flow. */
  onExit: () => void;
  /** Short label shown at the start of the bar. Defaults to the journey's
   *  name; screens may pass something more specific if useful later. */
  label?: string;
}

/**
 * Persistent, subtle top bar for the Role Select screen. Journey-local
 * (not core) — built here because it is specific to this journey's own
 * pre-flow navigation needs, not a platform-wide primitive.
 *
 * Used to also drive the Customer Flow's step-by-step header (via optional
 * `currentStep`/`totalSteps` props rendering the shared `JourneyStepper`),
 * but `CustomerFlowContainer` now uses core's `JourneyLayout` for that
 * instead (see Task 4 of the shell-rebuild pass) — Role Select is this
 * component's only remaining caller, and it never needed a stepper, so
 * that dead prop-plumbing has been trimmed.
 */
function JourneyHeader({ onExit, label = 'IDBI Bank Personal Loan' }: JourneyHeaderProps) {
  return (
    <header className="journey-header">
      <div className="journey-header-main">
        <span className="journey-header-label">{label}</span>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="journey-header-exit"
        onClick={onExit}
      >
        Exit
      </Button>
    </header>
  );
}

export default JourneyHeader;
