/**
 * Shared types for the journey registry.
 *
 * A "journey" is a self-contained lending flow (KYC, Loan, etc.) that lives
 * under src/journeys/journey-NN-name/. Each journey exposes its own
 * `JourneyModule` — metadata plus a root component — from its `index.ts`.
 * These types are the contract between a journey's `index.ts` and the
 * registry that collects them; they intentionally know nothing about any
 * single journey's internals.
 */
import type { ComponentType } from 'react';

/** Descriptive metadata for a journey, used to render its card in the Hub. */
export interface JourneyMeta {
  /** Stable unique identifier, e.g. "kyc". Used as the React list key. */
  id: string;
  /** Display title shown on the journey's card. */
  title: string;
  /** Short one/two-line description shown on the journey's card. */
  description: string;
  /** Inline SVG icon element rendered on the journey's card. */
  icon: ComponentType;
}

/**
 * A journey's credential check for the core Auth Pop-Up Modal (Screen 3).
 * The modal itself is generic/shared; each journey supplies its own
 * `validate` so the modal never needs to know a journey's actual
 * credentials.
 */
export interface JourneyAuth {
  validate: (userId: string, password: string) => boolean;
}

/** A journey's full contribution to the platform: metadata + root screen. */
export interface JourneyModule {
  meta: JourneyMeta;
  /** The journey's credential check for the Auth Pop-Up Modal. */
  auth: JourneyAuth;
  /**
   * The journey's root component, rendered when the journey is opened.
   * Receives `onExit` so the journey can hand control back to the Hub
   * without needing to know how the Hub itself works.
   */
  component: ComponentType<{ onExit: () => void }>;
}
