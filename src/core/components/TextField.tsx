import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './components.css';

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Used for the input's `id` and to wire up the `<label htmlFor>`. */
  id: string;
  /** Visible field label, rendered as a real `<label>`. */
  label: string;
  /** Inline, field-scoped error message. Rendered below the input with
   *  `role="alert"` and wired via `aria-describedby`/`aria-invalid`. */
  error?: string;
  /** Optional trailing action rendered inline beside the input (e.g. a
   *  "Verify" button or a "Verified" badge). Purely a layout slot — callers
   *  own whatever logic/state drives what renders here. When omitted, the
   *  input renders exactly as before (no wrapping row, no layout change). */
  action?: ReactNode;
}

/**
 * Shared labeled text input (core, generic).
 *
 * Mirrors the visual style already established by Gate/AuthModal: 44px-tall
 * input, 6px radius, `--border` outline, `--focus-ring` focus-visible ring.
 * Journeys and other core screens should use this instead of hand-rolling
 * their own label/input/error markup.
 */
function TextField({
  id,
  label,
  error,
  required,
  className,
  action,
  ...rest
}: TextFieldProps) {
  const generatedErrorId = useId();
  const errorId = error ? generatedErrorId : undefined;

  const input = (
    <input
      id={id}
      className="core-input"
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={errorId}
      {...rest}
    />
  );

  return (
    <div className={['core-field', className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className="core-label">
        {label}
        {required && (
          <span className="core-label-required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {action ? (
        <div className="core-input-row">
          {input}
          <div className="core-input-action">{action}</div>
        </div>
      ) : (
        input
      )}
      {error && (
        <p id={errorId} className="core-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default TextField;
