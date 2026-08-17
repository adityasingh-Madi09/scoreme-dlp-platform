# IDBI Personal Loan — Redesign Plan (v3: ribbon system + real-portal stepper)

Supersedes the original 14-screen plan in this file. The v2 redesign below
was validated with the user through six rounds of clickable HTML mockups
(`layout-options-mockup.html` through `v6.html`) before any code was
written. **v3** (this revision) is the actual React/TypeScript rebuild —
see "v3 update" at the bottom for what changed once the user reviewed the
real, live IDBI Digital Personal Loan portal as a reference and asked for
adjustments before implementation.

## Why this redesign happened

The original 14-screen build (see `LESSONS.md`) was functionally complete
but the user rejected it on sight: "not worth", "not modern", left-rail
step list felt heavy, forms read as flat grey boxes. Rather than iterate
screen-by-screen again, we agreed a full visual + structural reset was
warranted, driven by mockups the user could react to before any React
code was touched.

## Design system decisions (apply to ALL screens + core components)

1. **Navigation moves from a left step-rail to a top minimal-progress bar.**
   Thin progress track + "Step X of 7 — Label" text + a hover "View all
   steps" popover (non-interactive, visual only — matches the old
   sidebar's behavior). The left `.jl-sidebar` in `JourneyLayout` is
   removed entirely; its freed width goes to the form content.
2. **Page title becomes a navy ribbon banner**, not a bare `<h1>` floating
   on grey. Small white/70%-opacity eyebrow ("STEP X OF 7") + white 18px/600
   title + white/80%-opacity subtext, in a `linear-gradient(120deg, navy-900,
   navy-700)` band at the top of the content card.
3. **Multi-field screens are ONE continuous long-form card**, not separate
   boxed sections in a grid. Each logical group inside it gets a
   **colored ribbon divider** (light grey-blue strip, 3px navy left
   border, uppercase label, mono outline icon) — not the old icon-badge/
   eyebrow `SectionCard` header. `SectionCard`'s props API is unchanged;
   only its internal visual treatment changes, so every existing call site
   keeps working.
4. **Icons are single-color (mono) outline icons only** — no colorful
   emoji, no filled/colorful icon treatments anywhere in ribbons, section
   headers, or the sidebar. Use `lucide-react` (already a dependency),
   stroke-only, sized 16px, colored `currentColor` against the navy ribbon
   text color.
5. **Primary buttons are solid navy** (`--color-navy-900`, hover
   `--color-navy-700`) — orange (`--color-accent`) is fully removed from
   every button, everywhere, including `JourneyLayout`'s footer Back/
   Continue buttons (previously hardcoded to orange via a separate
   `.jl-btn--primary` class — this was the actual bug: two parallel button
   style systems existed, `core-btn` (already navy) and `jl-btn`
   (orange). Fixed by making `JourneyLayout`'s footer render the shared
   `Button` component instead of its own `.jl-btn` markup, so there is
   only one button style system platform-wide going forward.
6. **Checkboxes and radios are tinted navy**, not browser-default blue.
   The shared `Checkbox` component already had `accent-color: var(--brand-navy)`
   — the bug was screens using a raw `<input type="checkbox">`/`type="radio"`
   directly instead of the shared component. Fixed by (a) using the shared
   `Checkbox` component everywhere a checkbox is needed, and (b) adding a
   platform-wide fallback rule in `components.css` (`input[type="checkbox"],
   input[type="radio"] { accent-color: var(--brand-navy); }`) so this can't
   silently regress again on some future raw input.
7. **Grey background area is minimized**: base `--color-bg` lightened
   slightly, outer content padding tightened, and the long-form card width
   increased to use more of the space freed by removing the left rail — not
   by inflating font sizes or adding decorative overlays (an earlier
   revision tried a decorative gradient glow behind the header; the user
   correctly rejected it as not actually reducing grey, just recoloring it).
8. **`ApplicationSummaryPanel` (journey-local) is redesigned**: applicant
   avatar (initials), a completion-percentage progress ring, an icon per
   data row, and a "completed so far" mini-checklist — replacing the old
   plain label/value list.

## Step consolidation: 14 screens → 7

| # | New step | Merges (old screens) |
|---|----------|----------------------|
| 1 | Get Started | Entry (intro/features) + Mobile Number + Mobile OTP — OTP now reveals inline in the same screen instead of a screen change, same pattern already used for email OTP verification. |
| 2 | Identity & Basic Info | Aadhaar/PAN + OTP, then the auto-fetched KYC panel + remaining basic-info fields reveal inline once identity is verified. |
| 3 | Address & Employment | Current Address, Permanent Address & Proof, Employment Details, Office Address & Contact — four ribbon sections in one long form. |
| 4 | Income & Nominee | Primary Bank Details (required), Income/ITR (optional), Udyam Registration (optional), Nominee Details (toggle), Relationship Disclosure (toggle). |
| 5 | Loan Offer | Now an **interactive calculator** — the customer drags Loan Amount and Tenure sliders (min/max shown); EMI and Total Interest recompute live via a standard reducing-balance formula. Interest rate stays fixed (11% p.a.) — not customer-editable per this round's scope. Key Fact Statement and Accept/Reject retained, including the "Rejected" terminal sub-state. |
| 6 | Verify & Consent | Liveliness Check → Terms & Conditions → Final OTP, revealed as a progressive single-page sequence (each section unlocks once the previous is complete) rather than three separate screens. |
| 7 | Success | Unchanged content (application summary + download), restyled to the new navy/ribbon palette. |

All existing validation rules, regex patterns, mock async delays (bank
verify 800ms, URN verify 800ms, ITR fetch 2500ms, liveliness 2200ms), and
field-clearing behaviors (spouse name, nominee fields, director fields,
"same as current address" sync) are preserved exactly as documented in
the extraction spec — this is a visual/structural consolidation, not a
logic rewrite.

## Loan calculator specifics (Step 5)

New constants in `mockLoanOffer.constants.ts`:
- `LOAN_MIN_AMOUNT = 50000`, `LOAN_ELIGIBLE_MAX_AMOUNT = 600000`, `LOAN_AMOUNT_STEP = 10000`
- `LOAN_MIN_TENURE_MONTHS = 6`, `LOAN_MAX_TENURE_MONTHS = 60`, `LOAN_TENURE_STEP_MONTHS = 6`
- `LOAN_OFFER_INTEREST_RATE_PERCENT = 11` (fixed, unchanged)
- `LOAN_OFFER_PROCESSING_FEE = 4000` (fixed, unchanged)
- `calculateEmi(principal, tenureMonths, annualRatePercent)` — standard
  reducing-balance EMI formula, returns `{ emi, totalInterest }`.
- `loanOfferAmount`/`loanOfferTenureMonths` in `CustomerFlowData` now start
  at sensible defaults (400000 / 36) and update on every slider drag;
  `loanOfferEmi` recomputes on every change so Screens 6/7 (Terms, Success)
  display the customer's actually-chosen numbers, not a fixed mock value.

## Confirmed with user (no longer open questions)

- Nav style: minimal progress bar + popover (not the phase-stepper or
  full-numbered-row alternatives).
- Consolidation depth: 6–8 steps → landed on 7.
- Polish scope: apply broadly (chips, hover-lift, toasts, skeleton
  loaders, animated count-ups) wherever they fit naturally — not
  restricted to a "key screens only" subset.
- Button color: navy, not orange, confirmed twice after an initial miss.
- Checkbox tint: navy via `accent-color`, confirmed.
- "Maintain consistency in all screens and popup windows" — applies this
  design system to `AuthModal`, `Checkbox`, and any other shared/core
  surface a user might see, not just the Customer Flow screens.

## Testing approach (prototype-appropriate)

Same as the original plan: cross-check every `data.xxx` field referenced
in the 7 new screens against the `CustomerFlowData` interface (exact
name match), confirm no build/console errors via `npm run dev` (this
sandbox cannot run the real Vite build), and manually click through the
full 7-step flow with the documented test credentials/OTP before calling
this done.

## v3 update — reviewed against the real IDBI portal, then built

Before writing any of the 7 screens, the user shared 13 screenshots of the
actual, live IDBI Digital Personal Loan portal (hero page → "Required
Details" modal → Get Started/identify modal → mobile+OTP modal → choose
primary account → a 7-step application with Applicant Details, Nominee
Details, Financial Details, Loan Offer, Liveliness, Sanction Letter,
Documentation) and asked whether the v2 mockup design actually held up
against it. It mostly didn't — the real portal keeps every step visible at
all times via a numbered stepper, whereas v2's hover-only progress bar
hides the roadmap by default. Four direction questions were asked and
answered before building:

1. **Step tracker — "combine both."** Not a straight choice between the
   v2 hover popover and the reference's full numbered stepper. Built as an
   **always-visible, compact horizontal stepper**: every step's circle +
   connecting line is visible at once (no hover needed), but kept minimal —
   small 22px circles, a thin connector line that IS the progress fill (no
   separate track), short 1-2 word labels instead of the reference's full
   sentence labels. Replaces `JourneyLayout`'s old `.jl-progress-bar` +
   `.jl-steps-popover` entirely with `.jl-stepper`. `JourneyStep` gained an
   optional `shortLabel` field for this (falls back to `label` if omitted).
2. **Section layout — keep the ribbon long-form card, improve it.** Not
   switched to the reference's separate-card-per-section pattern. Instead
   added `SectionQuickNav` — a sticky pill row (first child inside
   `.jl-long-form-card`) that jumps to any section via `scrollIntoView`,
   used on the two longest screens (Step 3: 4 sections, Step 4: 5
   sections). `SectionCard` gained an optional `id` prop plus a
   `scroll-margin-top` so anchor-jumps don't land under the sticky nav.
3. **Branding — stay on the neutral navy theme, but use the real ScoreMe
   logo.** Not switched to IDBI's green/orange brand identity. `JourneyLayout`
   already imports `scoreme-logo.png` from `src/assets/` and labels it
   `alt="ScoreMe"` — this was already correct going in; no code change was
   needed here, just confirmation.
4. **Step 1 scope — keep the "Why Apply With Us" panel.** Confirmed no
   change needed to `Step1GetStarted`.

All 7 consolidated screens were then built (Step1GetStarted through
Step7Success), `CustomerFlowContainer` was rewritten for the 7-step array
(with `shortLabel`s), and the old 14 `Screen0X`/`Screen1X` `.tsx`/`.css`
files were deleted from the codebase — see the delivery message for the
exact file list, since the device bridge cannot delete files on the user's
machine directly.

Verification: `npm install` + `npx tsc --noEmit` against the full `src/`
tree (via a temporary local tsconfig, since this sandbox never received
the project's actual `vite.config.ts`/`tsconfig.json`/`index.html` —
those exist on the real device) came back with **zero type errors**
after the old dead screens were removed, which also confirms every
`data.xxx` reference in the 7 new screens matches `CustomerFlowData`
exactly (a typo or missing field would have been a compile error, not
just a runtime bug). Manual click-through in a real browser still
requires `npm run dev` on the actual device.

## Banker Workspace — plan (new role, built independently of Customer Flow)

Reference: 6 Figma screenshots of IDBI's own internal Banker portal
(dashboard, all-applications list, a single application's detail view,
its documents tab), supplied directly by the user, plus two direction
questions asked and answered before building:

1. **IDBI Bank branding — recreate it, don't source it.** The Banker
   workspace uses IDBI's own brand colors (green `#12805A` / orange
   `#F0672A`) and a hand-built inline-SVG lockup approximating the
   reference logo, instead of the Customer Flow's neutral ScoreMe navy.
   This is a deliberate, scoped exception to this file's general
   "never reproduce a real institution's exact brand from a screenshot"
   caution (see CLAUDE.md's Design Research & Assets section) — justified
   here because this journey is bespoke software built specifically for
   IDBI Bank, so showing their own identity back to them in their own
   staff tool is the point, not a third party's brand borrowed for an
   unrelated product. Flagged explicitly to the user rather than assumed.
2. **"Application by Location" — a ranked regional list, not a real
   India map.** The reference dashboard has a full India choropleth with
   per-state shading; built instead as a simple ranked bar-list by region
   (same "where are applications coming from" story), avoiding both the
   effort and the geographic-accuracy risk of a hand-built state-boundary
   SVG in a client-facing prototype.

### Folder isolation from the Customer Flow

Everything lives under a new `components/banker/` folder, sibling to
`components/customer/` — its own root container, screens, mock data file,
and local IDBI theme tokens (scoped to a `.banker-shell` class via
`BankerTheme.css`, never touching `src/index.css` or `src/core/theme.css`).
No file under `components/banker/` imports from `components/customer/` or
vice versa; the only files touched outside `components/banker/` were
`RoleSelectScreen.tsx` (Banker card wired from inert to active) and
`IdbiPersonalLoanView.tsx` (added the `'banker-flow'` screen case). The
shared `Button` primitive is reused as-is — retthemed to IDBI green purely
via the `--btn-primary-bg`/`--btn-primary-bg-hover` CSS variable override
`components.css` already exposes for exactly this purpose, no fork needed.

### Screens

1. **Dashboard** (`BankerDashboard`) — 4 stat tiles (Total Application,
   Sanctioned Application, Disbursed, Total Disbursed Loan Amount), each
   with a signed delta vs previous year (green = favorable, red =
   unfavorable — "Disbursed" trending down is unfavorable even though its
   arrow points down, matching the reference's own color logic). Below:
   an "Application Status" bar chart (Approved / Pending / In Progress /
   Rejected) and the ranked regional breakdown described above. The bar
   chart's 4-color palette (`#1baf7a` teal / `#eda100` amber / `#2a78d6`
   blue / `#e34948` red, in that exact order) was run through the
   `dataviz` skill's `validate_palette.js` script — passes every adjacent
   CVD/normal-vision check; the one contrast-vs-surface WARN is mitigated
   with direct value labels on every bar plus a legend, per that skill's
   relief rule.
2. **All Application** (`BankerApplicationsList`) — search-by-ID and the
   status filter both actually filter the mock list client-side; "Filter"
   (a fuller panel, out of scope) shows the same inline "coming soon"
   notice convention already used elsewhere in this journey. Table adds a
   Status column (pill-styled) the reference's list view doesn't show, for
   legibility.
3. **Application Detail** (`BankerApplicationDetail`) — breadcrumb, a
   summary card (ID, name, date/amount/tenure), left nav switching between
   "Application Overview" (4 accordion sections: Personal, Address,
   Employment, Loan Details) and "Documents" (a small table with a
   "Download"/"Download All" action, both mocked via the same inline-notice
   convention). Only ID, name and requested amount come from the row that
   was clicked; the rest of the detail fields are a fixed mock template
   (see `mockBankerData.constants.ts`) — a deliberate prototype shortcut
   rather than authoring a unique detail record per mock application.

### Visual-polish pass (added after a mid-build "plan first, check for
missing visuals" prompt from the user)

- Stat tiles gained a small `lucide-react` icon each (documents / check-
  circle / banknote / wallet) so the dashboard doesn't read as bare
  numbers-in-boxes.
- The Application Detail summary card now also shows the application's
  status pill next to the applicant's name (same pill styling as the
  list table), which the reference screenshot omits but which is useful
  context a banker would want without switching screens.
- The Application Detail sidebar's two nav items ("Application Overview" /
  "Documents") gained matching `lucide-react` icons.

### Verification

Same approach as the Customer Flow rebuild: `npx tsc --noEmit` against the
full `src/` tree via a temporary local tsconfig (deleted immediately
after each check, never delivered) — zero type errors, which also confirms
every mock-data field referenced across the new Banker screens matches its
constants file exactly. Manual click-through in a real browser still
requires `npm run dev` on the actual device.
