/**
 * Mock credential check for the core Auth Pop-Up Modal (Screen 3 of the
 * platform pipeline). Local-only prototype credentials — never real
 * authentication, never committed anywhere sensitive. See CREDENTIALS.md
 * in the project root for the full list of test credentials across every
 * journey.
 */
const IDBI_USER_ID = 'idbi_customer';
const IDBI_PASSWORD = 'Idbi@123';

/** Journey-supplied credential check, passed to the shared AuthModal via
 *  this journey's `JourneyModule.auth`. The modal itself holds no
 *  credentials and knows nothing about this journey specifically. */
export function validate(userId: string, password: string): boolean {
  return userId === IDBI_USER_ID && password === IDBI_PASSWORD;
}
