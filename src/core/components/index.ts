/**
 * Shared UI primitives (core, generic).
 *
 * Journeys and other core screens (gate, auth, hub) import from here
 * instead of hand-rolling their own input/label/button markup and CSS.
 * Only genuinely shared, journey-agnostic UI belongs in this folder —
 * see CLAUDE.md rule 2.
 */
export { default as TextField } from './TextField';
export type { TextFieldProps } from './TextField';

export { default as Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { default as Button } from './Button';
export type { ButtonProps } from './Button';

export { default as Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

export { default as Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { JourneyLayout } from './JourneyLayout';
export type { JourneyStep } from './JourneyLayout';

export { default as SectionCard } from './SectionCard';
export type { SectionCardProps } from './SectionCard';

export { default as SectionQuickNav } from './SectionQuickNav';
export type { SectionQuickNavProps, SectionQuickNavItem } from './SectionQuickNav';

export { default as OtpInput } from './OtpInput';
export type { OtpInputProps } from './OtpInput';

export { default as OtpModal } from './OtpModal';
export type { OtpModalProps } from './OtpModal';
