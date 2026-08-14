/* ============================================================
   SectionQuickNav — sticky in-page jump bar for multi-section
   long-form screens (e.g. Step 3 Address & Employment, Step 4
   Income & Nominee).

   Renders as the first child inside `.jl-long-form-card`, so it
   reads as part of the form rather than a separate widget. It sticks
   to the top of the scrollable main content once the ribbon title
   scrolls past it — a lightweight substitute for the discoverability
   a bank portal normally gets from having each section be its own
   separately-titled card, without giving up the single continuous
   long-form card the design settled on.

   Purely a layout/navigation primitive — takes an id/label list and
   knows nothing about what the sections actually contain, per
   CLAUDE.md rule 2 (core stays journey-agnostic). Pair each pill's
   `id` with a matching `id` prop on that section's `SectionCard`.

   Drop this file at: src/core/components/SectionQuickNav.tsx
   ============================================================ */

import type { MouseEvent } from 'react';
import './components.css';

export interface SectionQuickNavItem {
  id: string;
  label: string;
}

export interface SectionQuickNavProps {
  items: SectionQuickNavItem[];
}

function SectionQuickNav({ items }: SectionQuickNavProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="core-section-quicknav" aria-label="Jump to section">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="core-section-quicknav-pill"
          onClick={(event) => handleClick(event, item.id)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export default SectionQuickNav;
