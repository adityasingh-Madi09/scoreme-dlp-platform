/**
 * Mock data for Screen 8 (Income Details) — a fictional bank name returned
 * by the "Verify Bank Details" lookup, and a canned ITR summary returned by
 * the "Fetch ITR" action. Entirely illustrative prototype content.
 */
export const MOCK_BANK_NAME = 'National Trust Bank';

export const MOCK_ITR_SUMMARY: Array<{ label: string; value: string }> = [
  { label: 'Assessment Year', value: '2025-26' },
  { label: 'Gross Total Income', value: '₹9,40,000' },
  { label: 'Tax Paid', value: '₹68,500' },
  { label: 'Filing Status', value: 'Filed & Verified' },
];
