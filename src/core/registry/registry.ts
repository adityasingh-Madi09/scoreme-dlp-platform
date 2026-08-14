/**
 * Central registry engine.
 *
 * This is the ONLY file in src/core/ (or anywhere outside src/journeys/
 * itself) permitted to import from src/journeys/. Everything else that
 * needs the list of journeys (e.g. the Hub) must go through `getJourneys()`
 * here, never reach into src/journeys/ directly. That indirection is what
 * keeps "register a journey by adding one export line to
 * src/journeys/index.ts" true without ever touching consuming code.
 */
import { journeys } from '../../journeys';
import type { JourneyModule } from './registry.types';

/** Returns every registered journey, in registration order. */
export function getJourneys(): JourneyModule[] {
  return journeys;
}
