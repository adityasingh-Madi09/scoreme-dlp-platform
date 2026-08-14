# Lessons Learned — ScoreMe DLP Platform (Journey 1: IDBI Personal Loan, Build 1)

Purpose: a record of what went wrong in the first build of the IDBI Personal
Loan Customer Journey, why it happened, and the specific rule change made to
each subagent so the same mistake doesn't repeat on Journey 2 onward. Every
item below has a matching edit in `CLAUDE.md` and/or the relevant
`.claude/agents/*.md` file — this document is the "why," those files are the
"enforced rule."

---

## 1. No written screen plan existed before building

**What happened:** 14 screens were built without a saved, reviewable
plan — no document ever stated what each screen's purpose, fields, or layout
pattern should be before code was written. Quality and structure drifted
screen to screen because there was nothing to hold every screen to the same
bar.

**Root cause:** `pm-planner`'s job was defined as "break the request into a
task list" and hand it off — it never produced a durable artifact `frontend-
builder` (or a human) could check work against later. A verbal/ephemeral
plan can't be reviewed or reused.

**Fix:** `pm-planner` must now write its screen-by-screen plan to a
markdown file under `docs/journey-NN-plan.md` (fields, validation, layout
pattern, provenance badges — one entry per screen) **before** any
`frontend-builder` task starts, and that file must be updated if the plan
changes mid-build. See `.claude/agents/pm-planner.md`.

## 2. Effort went into functional depth, not visual polish

**What happened:** Screens shipped with real engineering care (OTP resend
cooldown timers, bank/URN verification simulations, an address-sync
`useEffect`, ITR-fetch loading states) but comparatively little visual
craft — flat gray boxes, no icons, inconsistent shadows. For a client pitch,
this is backwards: nobody scrutinizes the mock OTP cooldown logic, everyone
looks at whether the screen looks expensive.

**Root cause:** "Prototype Scope" in `CLAUDE.md` already said to prioritize
visual polish over defensive engineering, but nothing forced a check on
*actual time spent* per screen — the instruction was there, nothing
verified it was followed.

**Fix:** `CLAUDE.md`'s existing "Effort Balance" section is being kept, and
`ui-ux-reviewer` now explicitly checks the *ratio* — if a screen has
non-trivial interactive/validation logic but plain, unshadowed, ungrouped
UI, that imbalance itself is now a reportable finding, not just individual
missing-shadow nitpicks.

## 3. Every screen duplicated the page title

**What happened:** All 14 screens rendered their own `<h1>` inside their
card, directly beneath `JourneyLayout`'s own page-title heading — often
printing the literal same words twice ("Nominee Details" as the page title,
then "Nominee Details" again as the card's own heading, in a smaller font).

**Root cause:** Screens were reviewed individually, in isolation, against
"does this screen look reasonable on its own?" Nobody looked at a screen
*inside* its actual `JourneyLayout` shell to see the two headings stacked —
the duplication is only visible when you look at the full composed page.

**Fix:** New explicit rule: `JourneyLayout` owns the one page-level
heading. No screen may render a competing `<h1>`/page-title-styled element.
`ui-ux-reviewer` now checks each screen file *and* its containing layout
together, specifically for this. See "Page Title Ownership" in `CLAUDE.md`.

## 4. Multi-field sections were a bare `<fieldset><legend>` on a gray box

**What happened:** Screens with more than one logical group of fields
(Address, Income, Nominee) used a plain `<fieldset>` with a bold-text
`<legend>` on a flat `var(--bg)` box — no icon, no visual weight, no framing
beyond a border. This is exactly the "form structure isn't good enough for
a client pitch" feedback.

**Root cause:** `CLAUDE.md` said "group related fields into visually
distinct sections with section headings and card containers" — technically
true of a bordered box with bold text, so it passed review on a literal
reading, even though it didn't meet the bar in spirit.

**Fix:** Built a shared `SectionCard` core component (icon badge + eyebrow-
style label in a tinted header, divider, optional status badge, then the
field grid) and made it the *only* approved way to group fields on a
screen — bare `<fieldset>`/hand-rolled section boxes are now explicitly
banned in `CLAUDE.md` and checked for by name in `ui-ux-reviewer`.

## 5. Ad hoc "Verified" badges instead of the shared `Badge` component

**What happened:** Multiple screens hand-rolled their own
`.screen-x-verified-badge` CSS class with near-identical styling to the
shared `Badge` component that already existed — the same visual idea,
reimplemented per screen instead of reused.

**Root cause:** Nothing checked for *duplication* of an existing shared
component's visual language — only for outright unstyled/default elements.

**Fix:** `qa-reviewer` now explicitly checks for hand-rolled status-pill/
badge markup that duplicates `Badge` and flags it for consolidation.

## 6. Wasted horizontal space on wide screens

**What happened:** Every screen used one centered ~760px column regardless
of viewport width, leaving most of a real desktop window empty — reads as
under-designed on the large screens a client demo is usually shown on.

**Root cause:** No layout guidance existed for what to do with space beyond
the reading-width column; the shell was designed around a single content
width with no secondary content plan.

**Fix:** `JourneyLayout` now supports an optional `sidePanel` slot (used for
a persistent "Application Summary" rail) that widens the composed layout on
desktop screens without stretching the form itself past a comfortable
reading width. This is now the default expectation for the Customer Flow
shell — see `CLAUDE.md`'s Layout System section.

## 7. Real-bank screenshots used as more than structural reference

**What happened:** Reference screenshots of a live, named bank's actual
production product (real logo, brand colors, and in one case a real
sanction letter for a real company) were supplied as design inspiration.
The instruction to use them "for structure only" was clear, but nothing in
the review process explicitly re-checked *finished* screens against that
constraint.

**Root cause:** `CLAUDE.md`'s asset-licensing rule talked about "marketing
materials" and "generic image search" but didn't call out *live product
screenshots of a real, named bank* specifically — an easy category to miss
under time pressure.

**Fix:** Sharpened the hard rule in `CLAUDE.md`'s "Design Research &
Assets" section to explicitly name live/production screenshots of a named
real institution as off-limits for anything beyond structural/flow
reference, and added it as an explicit `ui-ux-reviewer` checklist item.

## 8. `CLAUDE.md`'s own status list went stale

**What happened:** "Current Journeys Registered" said "None yet" long after
all 14 screens were built — the one place anyone could check platform
status at a glance was wrong.

**Root cause:** No task's definition of "done" included updating that
section.

**Fix:** Already fixed in the previous pass — `qa-reviewer` check 5 now
fails a task outright if this section isn't current. Restating here because
it's a good example of a process gap, not a code gap: the rule already
existed in spirit, it just wasn't a checked item anywhere.

## 9. Dead components left exported "just in case"

**What happened:** `JourneyStepper` and `FormSection` were built, superseded
by a different pattern, and never removed — still exported from `src/core/
components/index.ts` with zero call sites.

**Root cause:** No check ever ran "is this still used anywhere?" after a
pattern changed.

**Fix:** Already fixed in the previous pass (`CLAUDE.md`'s "Dead Code — Zero
Tolerance", `qa-reviewer` check 6). Note for the Journey 1 rebuild: the
physical files still exist on disk and need manual deletion (the device
bridge used for this project can't delete files) — see the deletion list
provided separately.

---

## Summary table

| # | Mistake | Agent(s) responsible | Now enforced by |
|---|---|---|---|
| 1 | No written screen plan | pm-planner | pm-planner must save `docs/journey-NN-plan.md` before build starts |
| 2 | Functional depth over visual polish | frontend-builder | ui-ux-reviewer checks the effort *ratio*, not just individual misses |
| 3 | Duplicate page headings | frontend-builder, ui-ux-reviewer | "Page Title Ownership" rule + composed-page review check |
| 4 | Flat fieldset sections | frontend-builder, ui-ux-reviewer | `SectionCard` is now the only approved grouping pattern |
| 5 | Ad hoc badge reimplementation | frontend-builder, qa-reviewer | qa-reviewer checks for Badge-duplicating markup |
| 6 | Wasted desktop width | frontend-builder | `sidePanel` slot is now the default expectation |
| 7 | Real-bank reference overuse | frontend-builder, ui-ux-reviewer | Sharpened asset rule names live bank screenshots explicitly |
| 8 | Stale journey registry doc | pm-planner, qa-reviewer | Already fixed — restated for completeness |
| 9 | Dead exported components | frontend-builder, qa-reviewer | Already fixed — restated for completeness |
