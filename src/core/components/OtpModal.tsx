import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import Button from './Button';
import OtpInput from './OtpInput';
import './OtpModal.css';

export interface OtpModalProps {
  /** Modal heading, e.g. "Verify Mobile Number". */
  title: string;
  /** One line under the heading, e.g. "OTP sent to +91 98XXXXXX10". */
  subtitle: string;
  /** Number of digit boxes. Defaults to 6 (this platform's OTP length). */
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** Error message to show under the boxes; also drives the boxes' error styling. */
  error?: string;
  /** Optional confirmation note (e.g. "A new OTP has been sent."), hidden while `error` is set. */
  successNote?: string;
  onVerify: () => void;
  /** Defaults to "Verify OTP" — override for screen-specific copy (e.g. "Confirm & Accept Offer"). */
  verifyLabel?: string;
  onResend: () => void;
  /** Seconds remaining before resend is allowed again; 0 = resend is enabled. */
  resendCooldown: number;
  /** Closes the popup without verifying (X button and Escape key). */
  onClose: () => void;
}

/**
 * Core, generic OTP entry pop-up — same backdrop/centered-card/close-button
 * chrome as `AuthModal`, so every OTP moment on the platform (mobile,
 * identity, email, final confirmation) looks and behaves identically
 * regardless of which journey or step opens it. Journeys own all OTP
 * logic (sending, verifying, cooldowns) and simply render this component
 * conditionally, the same way they already render `AuthModal`.
 */
function OtpModal({
  title,
  subtitle,
  length = 6,
  value,
  onChange,
  error,
  successNote,
  onVerify,
  verifyLabel = 'Verify OTP',
  onResend,
  resendCooldown,
  onClose,
}: OtpModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Focus the first OTP box as soon as the modal mounts, so keyboard users
  // land directly in the code entry without needing to tab in.
  useEffect(() => {
    const firstBox = dialogRef.current?.querySelector<HTMLInputElement>('input');
    firstBox?.focus();
  }, []);

  // Escape-to-close, scoped to the dialog only (not a global listener), so
  // it never interferes with anything outside this modal.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
  };

  return (
    <div className="otp-modal-backdrop" role="presentation">
      <div
        className="otp-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className="otp-modal-close"
          aria-label="Close"
          onClick={onClose}
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

        <h2 id={titleId} className="otp-modal-title">
          {title}
        </h2>
        <p className="otp-modal-subtitle">{subtitle}</p>

        <OtpInput
          length={length}
          value={value}
          onChange={onChange}
          error={Boolean(error)}
          ariaLabel={title}
        />

        {error && (
          <p className="otp-modal-error" role="alert">
            {error}
          </p>
        )}
        {successNote && !error && <p className="otp-modal-success">{successNote}</p>}

        <div className="otp-modal-actions">
          <Button type="button" onClick={onVerify} className="otp-modal-verify">
            {verifyLabel}
          </Button>
          <button
            type="button"
            className="otp-modal-resend"
            onClick={onResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OtpModal;
