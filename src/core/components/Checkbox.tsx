import type { InputHTMLAttributes } from 'react';
import './components.css';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  /** Used for the input's `id` and to wire up the `<label htmlFor>`. */
  id: string;
  /** Visible label text next to the checkbox (e.g. "I Agree"). */
  label: string;
}

/**
 * Shared checkbox (core, generic).
 *
 * Minimal "I Agree" / Yes-No style toggle primitive, kept intentionally
 * small (native `<input type="checkbox">` + label) rather than a custom
 * switch component, since upcoming journey screens only need this much.
 */
function Checkbox({ id, label, className, ...rest }: CheckboxProps) {
  return (
    <div className={['core-checkbox-row', className].filter(Boolean).join(' ')}>
      <input id={id} type="checkbox" className="core-checkbox-input" {...rest} />
      <label htmlFor={id} className="core-checkbox-label">
        {label}
      </label>
    </div>
  );
}

export default Checkbox;
