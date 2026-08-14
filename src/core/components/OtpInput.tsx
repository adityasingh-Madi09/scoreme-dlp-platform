import { useRef } from 'react';
import type { ChangeEvent, ClipboardEvent, FocusEvent, KeyboardEvent } from 'react';
import './components.css';

export interface OtpInputProps {
  /** Number of digit boxes. Defaults to 6 (this platform's OTP length). */
  length?: number;
  /** Current full OTP string (may be shorter than `length` while typing). */
  value: string;
  /** Called with the full, updated OTP string on every change. */
  onChange: (value: string) => void;
  /** Renders every box in the error visual state (e.g. after a wrong-OTP
   *  submit). Purely visual — callers own the actual error message. */
  error?: boolean;
  disabled?: boolean;
  /** Accessible label applied to the whole group of boxes. */
  ariaLabel?: string;
}

/**
 * Reusable digit-box OTP entry (core, generic — promoted from
 * journey-01's local component so it can be shared by `OtpModal` and any
 * future journey). Individual digit boxes with auto-advance on type,
 * backspace-to-previous, arrow-key navigation, and paste support for a
 * full code pasted into any box.
 */
function OtpInput({
  length = 6,
  value,
  onChange,
  error = false,
  disabled = false,
  ariaLabel = 'One-time password',
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const rawDigits = event.target.value.replace(/\D/g, '');

    if (!rawDigits) {
      const cleared = [...digits];
      cleared[index] = '';
      onChange(cleared.join(''));
      return;
    }

    // Place typed characters sequentially starting at this box (covers
    // both the normal single-digit case and fast/IME input that lands
    // more than one character at once), then focus the box after the
    // last one filled.
    const nextDigits = [...digits];
    let cursor = index;
    for (const char of rawDigits) {
      if (cursor >= length) break;
      nextDigits[cursor] = char;
      cursor += 1;
    }
    onChange(nextDigits.join('').slice(0, length));
    inputsRef.current[Math.min(cursor, length - 1)]?.focus();
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Select the box's existing digit on focus so typing a new one always
  // overwrites it, instead of being blocked by maxLength=1.
  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div
      className={['otp-input-group', error ? 'otp-input-group--error' : '']
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={ariaLabel}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          className="otp-input-box"
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={error || undefined}
          onChange={handleChange(index)}
          onKeyDown={handleKeyDown(index)}
          onFocus={handleFocus}
          onPaste={index === 0 ? handlePaste : undefined}
        />
      ))}
    </div>
  );
}

export default OtpInput;
