/**
 * Shared mock OTP value for every OTP step in this journey (Screens 3, 4,
 * 5's email verify, and 13). No real OTP is ever sent — entering this exact
 * value is the only way any OTP check in this journey succeeds. See
 * CREDENTIALS.md in the project root.
 */
export const MOCK_OTP = '123456';
