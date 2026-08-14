/**
 * Access Gate credentials — CHANGE CREDENTIALS HERE.
 *
 * IMPORTANT — read before "fixing" this file:
 * This Access Gate is an intentional client-side-only "soft" gate built for a
 * UI/UX prototype. There is no backend, no server-side validation, and no
 * real security boundary here. Because this code ships to the browser as
 * plain JavaScript, anyone using browser DevTools (or simply viewing the
 * bundled source) can read these values. That is a known, accepted
 * limitation of this prototype — not a bug to patch with obfuscation,
 * DevTools-blocking, or other client-side "security" tricks. Do not add any
 * of those; keep this check simple and clean.
 *
 * These constants are named GATE_* to distinguish them from the credentials
 * used by the separate, future per-journey Auth Pop-Up Modal (Screen 3),
 * which will have its own, unrelated set of credentials. Never merge or
 * confuse the two.
 */
export const GATE_USER_ID = 'admin';
export const GATE_PASSWORD = 'scoreme@123';
