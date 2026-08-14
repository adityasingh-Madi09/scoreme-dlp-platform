import type { ButtonHTMLAttributes } from 'react';
import './components.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 'primary' = solid brand-navy fill. 'secondary' = outline/ghost. */
  variant?: 'primary' | 'secondary';
}

/**
 * Shared button (core, generic).
 *
 * Single component used for every "Continue/Submit/Save/Accept/Cancel"
 * style action across the app, so button sizing, radius and focus-visible
 * styling stay consistent as more journey screens are added.
 */
function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  const variantClass =
    variant === 'secondary' ? 'core-btn--secondary' : 'core-btn--primary';

  return (
    <button
      className={['core-btn', variantClass, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}

export default Button;
