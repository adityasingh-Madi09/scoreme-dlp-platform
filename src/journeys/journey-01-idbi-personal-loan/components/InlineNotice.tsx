import './InlineNotice.css';

interface InlineNoticeProps {
  /** The notice text, e.g. "Banker access is coming soon." */
  message: string;
}

/**
 * Small, restrained inline status notice (journey-local). Used for the
 * "coming soon" feedback shown when a user activates a not-yet-built
 * affordance (Banker/Admin roles, Resume/Track buttons) — never navigates
 * anywhere, just confirms the click was received. `role="status"` +
 * `aria-live="polite"` so assistive tech announces it without stealing
 * focus.
 */
function InlineNotice({ message }: InlineNoticeProps) {
  return (
    <p className="inline-notice" role="status" aria-live="polite">
      {message}
    </p>
  );
}

export default InlineNotice;
