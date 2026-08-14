/**
 * Journey registration.
 *
 * This is the single point of contact between the platform and its
 * journeys. Adding a new journey to the platform means:
 *   1. Create its folder: src/journeys/journey-NN-name/
 *   2. Export a `JourneyModule` (meta + root component) from its index.ts
 *   3. Add exactly ONE line here — the import + array entry below.
 *
 * No other file should need to change. Only src/core/registry/registry.ts
 * is allowed to import this file; nothing else should import from
 * src/journeys/ directly.
 *
 * Example (once a journey exists):
 *   import kyc from './journey-01-kyc';
 *   export const journeys: JourneyModule[] = [kyc];
 */
import type { JourneyModule } from '../core/registry/registry.types';
import idbiPersonalLoan from './journey-01-idbi-personal-loan';

export const journeys: JourneyModule[] = [idbiPersonalLoan];
