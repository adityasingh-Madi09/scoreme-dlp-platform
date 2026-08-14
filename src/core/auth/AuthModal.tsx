import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { TextField, Button } from '../components';
import './AuthModal.css';

interface AuthModalProps {
  /** Title of the journey being unlocked — displayed in the modal header. */
  journeyTitle: string;
  /** Journey-supplied credential check. The modal itself holds no credentials. */
  validate: (userId: string, password: string) => boolean;
  /** Called once `validate` returns true for the current field values. */
  onSuccess: () => void;
  /** Called when the user cancels/closes without authenticating. */
  onCancel: () => void;
}

/**
 * Screen 3 — Auth Pop-Up Modal (core, generic, shared).
 *
 * Renders as a dimmed overlay on top of whatever screen opened it (the Hub,
 * per the current pipeline) with a centered credential form. Completely
 * journey-agnostic: it knows nothing about any specific journey's
 * credentials or copy beyond the `journeyTitle` and `validate` function it
 * is given as props. Journeys must never be referenced by name in here.
 */
function AuthModal({ journeyTitle, validate, onSuccess, onCancel }: AuthModalProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const userIdInputId = useId();
  const passwordInputId = useId();
  const errorId = useId();

  // Focus the first field as soon as the modal mounts, so keyboard users
  // land directly in the form without needing to tab in from elsewhere.
  useEffect(() => {
    const firstField = dialogRef.current?.querySelector<HTMLInputElement>('input');
    firstField?.focus();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUserId = userId.trim();
    if (validate(trimmedUserId, password)) {
      setError('');
      onSuccess();
    } else {
      setError('User ID or password is incorrect. Please try again.');
    }
  };

  // Escape-to-cancel, scoped to the dialog only (not a global listener),
  // so it never interferes with anything outside this modal.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <div className="auth-modal-backdrop" role="presentation">
      <div
        className="auth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        ref={dialogRef}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className="auth-modal-close"
          aria-label="Cancel and close"
          onClick={onCancel}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            focusable="false"
            aria-hidden="true"
          >
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>

        <h2 id="auth-modal-title" className="auth-modal-title">
          {journeyTitle}
        </h2>
        <p className="auth-modal-subtitle">Sign in to continue to this journey.</p>

        <form className="auth-modal-form" onSubmit={handleSubmit} noValidate>
          <TextField
            id={userIdInputId}
            name="userId"
            type="text"
            label="User ID"
            autoComplete="username"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />

          <TextField
            id={passwordInputId}
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby={error ? errorId : undefined}
          />

          {error && (
            <p id={errorId} className="core-form-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="auth-modal-submit">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
