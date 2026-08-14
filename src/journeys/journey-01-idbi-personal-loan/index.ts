/**
 * IDBI Bank Personal Loan Journey — registration entry point.
 *
 * Exports the `JourneyModule` (metadata + auth check + root component) that
 * src/journeys/index.ts registers with the platform. See CLAUDE.md for the
 * journey-isolation rules this folder must follow.
 *
 * This file stays `.ts` (not `.tsx`) per the journey's file layout, so the
 * icon is built with `React.createElement` rather than JSX syntax.
 */
import { createElement } from 'react';
import type { JourneyModule } from '../../core/registry/registry.types';
import { validate } from './idbiAuth.constants';
import IdbiPersonalLoanView from './IdbiPersonalLoanView';

/** Simple inline SVG icon for this journey's Hub card — no image assets. */
function IdbiPersonalLoanIcon() {
  return createElement(
    'svg',
    {
      width: 32,
      height: 32,
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      'aria-hidden': true,
    },
    createElement('rect', {
      x: 3,
      y: 7,
      width: 18,
      height: 13,
      rx: 2,
      stroke: 'currentColor',
      strokeWidth: 1.5,
    }),
    createElement('path', { d: 'M3 10h18', stroke: 'currentColor', strokeWidth: 1.5 }),
    createElement('path', {
      d: 'M7 4h10l2 3H5l2-3Z',
      stroke: 'currentColor',
      strokeWidth: 1.5,
      strokeLinejoin: 'round',
    }),
    createElement('path', {
      d: 'M8 14h4',
      stroke: 'currentColor',
      strokeWidth: 1.5,
      strokeLinecap: 'round',
    }),
  );
}

const idbiPersonalLoan: JourneyModule = {
  meta: {
    id: 'idbi-personal-loan',
    title: 'IDBI Bank Personal Loan',
    description: 'Digital personal loan application journey for IDBI Bank customers.',
    icon: IdbiPersonalLoanIcon,
  },
  auth: { validate },
  component: IdbiPersonalLoanView,
};

export default idbiPersonalLoan;
