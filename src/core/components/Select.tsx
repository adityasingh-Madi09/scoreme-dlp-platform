import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import './components.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  /** Used for the select's `id` and to wire up the `<label htmlFor>`. */
  id: string;
  /** Visible field label, rendered as a real `<label>`. */
  label: string;
  /** Selectable options, rendered as `<option>` elements in order. */
  options: SelectOption[];
  /** Optional leading disabled/placeholder option, e.g. "Select an option". */
  placeholder?: string;
  /** Inline, field-scoped error message. Rendered below the select with
   *  `role="alert"` and wired via `aria-describedby`/`aria-invalid`. */
  error?: string;
}

/**
 * Shared labeled select (core, generic).
 *
 * Mirrors `TextField`'s visual language and markup shape (label + control +
 * inline error) so dropdown fields stay consistent with text inputs across
 * the app. A native `<select>` is intentionally used instead of a custom
 * listbox — sufficient for this platform's needs, no extra dependency.
 */
function Select({
  id,
  label,
  options,
  placeholder,
  error,
  required,
  className,
  ...rest
}: SelectProps) {
  const generatedErrorId = useId();
  const errorId = error ? generatedErrorId : undefined;

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
      <select
        id={id}
        className="core-select"
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="core-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default Select;
