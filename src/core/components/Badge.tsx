import type { HTMLAttributes } from 'react';
import './components.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 'neutral' = muted gray chip. 'info' = navy-tinted (data-provenance tags
   *  like "Auto-fetched"). 'success' = green pill (reuses the same visual
   *  language as the existing "Verified" chip pattern). */
  variant?: 'neutral' | 'info' | 'success';
}

/**
 * Small pill-style tag (core, generic).
 *
 * Used to label where a piece of data came from (e.g. "Auto-fetched",
 * "From PAN") or to show a short status ("Verified") inline next to a
 * heading or field — never as a replacement for the full-size Button.
 */
function Badge({ variant = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={['core-badge', `core-badge--${variant}`, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
}

export default Badge;
