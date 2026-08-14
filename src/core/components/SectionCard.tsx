/* ============================================================
   SectionCard — shared "grouped fields" divider for journey forms.

   v2: visually restyled to a colored-ribbon divider (light grey-blue
   strip, navy left border, mono outline icon + uppercase label) that
   composes with sibling SectionCards inside one continuous
   `JourneyLayout`-provided `.jl-long-form-card`, instead of each being
   its own separately bordered/boxed card in a grid — per the approved
   ribbon redesign (see docs/journey-01-idbi-personal-loan-plan.md).

   Props API is UNCHANGED from v1 — every existing call site (icon,
   title, description, action, children) keeps working exactly as
   before; only the internal visual treatment changed. `icon` should be
   a small (16px) `lucide-react` icon left at its default stroke-only
   rendering — no filled/colorful icon treatments, per the platform's
   mono-icon rule.

   Purely a layout/visual primitive — takes no opinion on what's inside
   it, per CLAUDE.md rule 2 (core stays journey-agnostic).

   Drop this file at: src/core/components/SectionCard.tsx
   ============================================================ */

import type { ReactNode } from 'react';
import './components.css';

export interface SectionCardProps {
  /** Anchor target for `SectionQuickNav` pills on multi-section screens.
   *  Omit on single/two-section screens that don't use a quick-nav. */
  id?: string;
  /** Small (16px) lucide-react icon element, rendered stroke-only next to
   *  the ribbon title — no filled/colorful icon treatments. */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Right-aligned slot in the ribbon — e.g. a Badge ("Verified", "Optional"). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

function SectionCard({ id, icon, title, description, action, children, className }: SectionCardProps) {
  return (
    <div id={id} className={['core-section-card', className].filter(Boolean).join(' ')}>
      <div className="core-section-ribbon">
        <div className="core-section-ribbon-heading">
          {icon && (
            <span className="core-section-ribbon-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="core-section-ribbon-title">{title}</span>
          {description && <span className="core-section-ribbon-desc">{description}</span>}
        </div>
        {action && <div className="core-section-ribbon-action">{action}</div>}
      </div>
      <div className="core-section-card-body">{children}</div>
    </div>
  );
}

export default SectionCard;
