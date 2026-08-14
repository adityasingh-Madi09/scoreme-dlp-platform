# CLAUDE.md — ScoreMe DLP Platform

## Project Overview
This is the ScoreMe Solutions Digital Lending Process (DLP) Platform — a single web application that hosts multiple independent lending journeys (KYC, Loan, etc.), each designed in Figma. The platform must remain fully modular: adding, editing, or removing any one journey must never break, alter, or require touching any other journey or the core application shell.

**Stack:** React + TypeScript, built with Vite. Local dev server runs at `http://localhost:5173`.

## Non-Negotiable Architecture Rules

1. **Journey isolation is absolute.** Every journey lives in its own folder under `src/journeys/journey-NN-name/` and must not import from, modify, or depend on another journey's folder.
2. **Core is shared, journeys are not.** Only `src/core/` contains shared UI (buttons, modals, inputs) that journeys may import from. Journeys never modify `src/core/` files to solve a journey-specific problem — if a journey needs something core doesn't provide, build it inside the journey's own `components/` folder instead.
3. **One-line registration.** A new journey is added to the platform by creating its folder and adding exactly one export line to `src/journeys/index.ts`. No other file should need to change.
4. **Never break the pipeline.** The 4-screen flow (Access Gate → Journey Hub → Auth Modal → Journey Workspace) is core infrastructure. Do not modify `src/core/gate/`, `src/core/hub/`, or `src/core/auth/` when the task is about a specific journey.
5. **Before editing anything in `src/core/`, stop and confirm the change is genuinely shared infrastructure, not a one-journey fix.**

## Folder Structure Reference

```
src/
├── core/
│   ├── components/   # Shared UI only
│   ├── gate/         # Screen 1: passcode gate
│   ├── hub/          # Screen 2: journey cards hub
│   ├── auth/         # Login popup modal
│   └── registry/     # Central registry engine that reads src/journeys/index.ts
├── journeys/
│   ├── journey-01-kyc/
│   │   ├── index.ts       # Metadata (title, icon, description) + entry point export
│   │   ├── KYCView.tsx    # Main screen for this journey
│   │   └── components/    # Sub-components used only within this journey
│   └── index.ts           # One export line per journey — the registry
├── App.tsx
└── main.tsx
```

## Design Assets
Figma exports (screenshots or HTML) are dropped into `./design_assets/`. When building a journey, reference the relevant file(s) in that folder for layout, spacing, and visual accuracy before writing UI code.

## Screen Planning (Before Any Screen Is Built)
`pm-planner` writes a screen-by-screen plan to `docs/journey-NN-plan.md` before any `frontend-builder` task starts on that journey — purpose, fields, validation approach, and layout pattern (which screens need `SectionCard`, which need `sidePanel`) per screen. This is a durable, reviewable artifact, not a verbal task list. See `.claude/agents/pm-planner.md` for the exact format. `frontend-builder` builds against this plan; `qa-reviewer` checks the built screens still match it.

## Working Conventions
- Use TypeScript strictly — no `any` unless there is no reasonable alternative, and comment why.
- Use functional components with hooks, not class components.
- Keep each journey's `index.ts` exporting: a metadata object (id, title, description, icon) and the journey's root component.
- After completing a task, run the dev server check (`npm run dev` should already be running) and confirm no TypeScript or console errors before considering the task done.
- When committing to git, write clear, specific commit messages describing what changed and which journey (or core) was affected.

## What NOT to do
- Do not create shared state or context that crosses journey boundaries.
- Do not add new dependencies to `package.json` without flagging it first — check if an existing dependency already solves the problem.
- Do not restructure `src/core/` or the registry pattern without being explicitly asked to.
- Do not touch `.env` files or commit secrets/tokens to git.

## Multi-Agent Workflow (Autonomous by Default)

This project uses four subagents: `pm-planner`, `frontend-builder`, `ui-ux-reviewer`, `qa-reviewer`. **You (the main/lead session) are the orchestrator.** Run the full loop yourself, end to end, without waiting for the user to manually invoke each subagent:

1. Call `pm-planner` to break the request into a task list.
2. For each task in order:
   a. Call `frontend-builder` to implement it.
   b. Call `ui-ux-reviewer` and `qa-reviewer` to check it.
   c. If either reports issues, call `frontend-builder` again with their findings, then re-review.
   d. Repeat until both pass, then move to the next task.
3. When all tasks in the plan are complete, give the user one consolidated summary of everything built, reviewed, and fixed — including any open issues that need a human decision.

**Only interrupt the user mid-loop for a genuine decision, not for routine progress.** Interrupt when:
- A requirement is ambiguous or contradicts an earlier decision (e.g. two different specs for the same screen).
- A task would require modifying `src/core/` or another journey's folder in a way not already pre-approved.
- A new npm dependency is needed.
- Something in the plan conflicts with `CLAUDE.md` itself.

Do NOT interrupt to ask permission for each individual subagent call, for routine "should I proceed to the next task" confirmations, or for things already covered by this file's rules. Work through the full plan autonomously and report back when done or when truly blocked.

## Visual Design System (Mandatory for Every Screen, Every Journey)

Reference screenshots in `design_assets/` document field content and functional flow ONLY. They are NOT the visual design bar — never copy their bare, unstyled layout style. This is customer-facing fintech software for a bank; every screen must look like professionally designed banking software, not a functional prototype or a generic admin form.

### Design tokens (all screens must use these, not hardcoded values)
- **Primary (brand navy):** `#0B1E3D` — headers, primary text on light backgrounds, primary buttons
- **Accent (brand orange/red, from the ScoreMe logo):** `#E85D3D` — CTAs, active states, key highlights, checkmarks/success indicators
- **Neutral backgrounds:** `#F5F6F8` (page background), `#FFFFFF` (cards)
- **Neutral text:** `#0B1E3D` (headings), `#5B6472` (secondary/muted text)
- **Border/divider:** `#E2E5EA`
- **Success:** `#1E9E5A` — **Error:** `#D64545` — use consistently for validation states
- **Type:** Inter (already set as global default). Establish a real scale — e.g. page titles 28-32px/bold, section headers 18-20px/semibold, body 14-16px/regular, captions/labels 12-13px/medium — and use it consistently rather than ad hoc sizes.
- **Spacing:** use a consistent scale (e.g. 4/8/12/16/24/32/48px multiples) — no arbitrary one-off padding values.
- **Radius/shadow:** consistent corner radius (e.g. 8-12px) and a subtle card shadow, used the same way everywhere.

### Required structural patterns
- **Journey Hub is a real dashboard**, not a bare list: proper header/nav bar, page title, breathing room, cards with hover states — it should look alive even with one journey card in it.
- **Every multi-step journey screen must show a progress/stage indicator** (stepper, progress bar, or step counter like "Step 3 of 9") so the user always knows where they are and what's ahead. Build this once as a shared component in `src/core/components/` (e.g. `JourneyStepper`) and reuse it across every journey — never rebuild it per-journey.
- **Group related fields into visually distinct sections** with section headings and card containers — never a flat, ungrouped list of inputs.
- **Buttons have deliberate primary/secondary/disabled states** using the design tokens above — never default gray/unstyled buttons.
- **Forms show clear validation states** (inline errors, success confirmation) styled with the success/error tokens above.

### Layout System — Mandatory Structural Shell

Every journey screen uses the SAME structural shell: the shared `JourneyLayout` component (`src/core/components/JourneyLayout.tsx` + `.css`), composed per-screen. Ambiguity here is what causes generic/amateur output — use this component exactly, do not improvise a different structure per screen.

```
┌─────────────────────────────────────────────────────────────┐
│  Header: logo | journey name | step X of N | Exit             │  ← fixed, not scrollable
├───────────────┬─────────────────────────────────────────┬───┤
│               │                                           │   │
│  Step sidebar │   Main content (scrollable)               │Side│
│  (left rail)  │   - Page title + short helper subtext     │panel│
│  - all steps  │     (owned by JourneyLayout — see below)  │(opt)│
│    listed,    │   - Content grouped into SectionCard      │   │
│    current    │     blocks, one per logical field group    │   │
│    highlighted│     (never a bare fieldset/flat list)      │   │
│  - completed  │   - Generous whitespace, 8px spacing grid  │   │
│    steps      │                                            │   │
│    checked    │                                            │   │
│               │                                           │   │
├───────────────┴─────────────────────────────────────────┴───┤
│  Footer: sticky, right-aligned Back / Continue buttons        │  ← fixed, not scrollable
└─────────────────────────────────────────────────────────────┘
```

`JourneyLayout` owns, in one place, for every screen:
- **Header** — logo, current journey name, step counter, exit action.
- **Step sidebar** — left rail listing all steps in the current journey, current step highlighted (accent color), completed steps show a checkmark, upcoming steps muted.
- **Page title** — the current step's label, rendered once, above the screen's own content. **This is the screen's only page-level heading — see "Page Title Ownership" below.**
- **Main content** — the scrollable area a screen's own JSX is rendered into.
- **Optional `sidePanel`** — a persistent right-rail slot (e.g. a running "Application Summary" card) that widens the composed layout on desktop screens instead of leaving a single ~760px column stranded in empty space. Use this by default for any Customer Flow; a screen with nothing meaningful to show in a rail can omit it and stay single-column.
- **Footer** — sticky footer bar, Back (secondary/outline button) and Continue/Save (primary accent button), right-aligned.

Inside a screen's own content, group any 2+ related fields into a `SectionCard` (`src/core/components/SectionCard.tsx`) — icon + eyebrow-style label header, divider, then the fields. **Never** a bare `<fieldset><legend>`, nor a hand-rolled bordered `<div>` reimplementing the same idea — those read as a flat gray box, not a designed section, even if they technically have a heading.

#### Page Title Ownership (hard rule)

`JourneyLayout`'s page title is the *only* page-level heading a screen gets. A screen's own component must never render a competing `<h1>` (or any heading-styled element) that repeats or paraphrases it — this was a real, systemic bug in Journey 1's first build (every screen printed its step name twice). If a screen needs a lead-in sentence, style it as a `<p>`, not a heading. Review this by checking the screen composed inside its actual `JourneyLayout` shell, not the screen file in isolation — the duplication is invisible if you only look at one file at a time.

Every one of the customer journey screens composes inside this exact shell. The Access Gate and Auth Modal are exceptions (centered card, no sidebar needed — those are entry points, not multi-step content).

**Design authority:** when researching and making visual judgment calls, act as a senior product designer with 10+ years in enterprise fintech UI — favor restrained, confident choices (generous whitespace, a disciplined type scale, subtle elevation/shadow, one accent color used sparingly for emphasis) over decorative or trendy flourishes. Consistency across all screens in a journey matters more than any single screen being clever.


`ui-ux-reviewer` must treat this section as the actual design bar, not the raw reference screenshots. A screen that is functionally correct but visually looks like an unstyled prototype is a real failure to report, not a nice-to-have.

## Prototype Scope (Read This Before Every Task)

This platform is currently a **prototype for presentation/pitching purposes**, not a production banking system. This changes where effort (and tokens) should go.

**Prioritize:**
- Visual design quality (per the Visual Design System above) — this is what gets judged in a pitch.
- Complete, click-through-able flow from screen to screen with realistic mock data.
- Smooth, believable interactions (loading states, transitions, confirmations) that make it feel real.

**De-prioritize — do the simple version, don't over-engineer:**
- Field validation: skip almost entirely. Required-field-empty checks only where a screen would visibly break without them (e.g. can't proceed with a blank OTP field). No format/regex validation (email format, PAN format, IFSC format, etc.) — assume happy-path input. This is a deliberate token-saving choice for prototype speed.
- Exhaustive edge-case/error handling. Skip elaborate validation logic and rare-case handling entirely.
- Real backend integration, real security, or real data persistence — mock/hardcode data and simulate network calls where needed.
- Automated test suites — not needed at this stage.
- Performance optimization beyond "it runs smoothly in a demo."

### Review cadence (for speed)
Do not run ui-ux-reviewer and qa-reviewer after every single screen — batch reviews after every 3-4 screens (or a natural sub-flow boundary, e.g. after the whole "Basic Information" section, or after the whole "Income & Nominee" section). Exception: always review after the FIRST screen of a new journey, to confirm the shell/pattern is right before repeating it 13 more times. This cuts review overhead significantly while still catching systemic issues early.

When in doubt on a task, ask: "does this make the prototype look and feel more real and polished, or does it just make the code more robust for production?" Favor the former. If a task seems to be growing into production-grade engineering effort, stop and flag it rather than continuing.

## Design Research & Assets

For this prototype, actively research the web for modern, professional visual references and reusable assets — don't design in a vacuum. This includes:
- **Layout/interaction inspiration:** look at how well-designed modern fintech, SaaS, and banking products handle onboarding flows, dashboards, forms, and progress indication. Synthesize patterns, don't clone a specific brand's identity.
- **Icons:** use a proper icon set rather than hand-drawn SVGs — `lucide-react` is already an approved dependency (see package availability) and covers most needs (document, shield, check-circle, upload, etc.). Prefer it by default.
- **Illustrations (empty states, success screens, onboarding moments):** use open-licensed sources only, e.g. undraw.co (free, MIT-style license, customizable to brand colors) or similar libraries explicitly marked free for commercial use.
- **Stock photography (if genuinely needed):** Unsplash or Pexels only — both are free for commercial use without attribution required.
- **Fonts:** Google Fonts only (already using Inter).

**Hard rule: never use an image, icon, or vector pulled from a generic image search, a specific bank's real marketing materials, or any source without a clear open/commercial-use license.** This explicitly includes **screenshots of a real, named institution's live/production product** (its actual logo, exact brand colors, real UI chrome, or real customer/document data visible in the screenshot) — these are useful for structure and field-content reference ONLY, exactly like a `design_assets/` Figma export, and must never influence this platform's own color choices, logo, or visual identity. This is presentation material that may be shown externally — copyright and brand-lookalike issues are a real risk, not a formality. When unsure whether an asset is safe to use, don't use it — recreate the idea instead (e.g. build a simple icon/illustration with code rather than sourcing an ambiguous image).

## Current Journeys Registered
(Update this list as journeys are added — this must be kept accurate; a
stale entry here is a real bug, not a formality, since it's the only place
anyone can see platform status at a glance)
- `journey-01-idbi-personal-loan` — IDBI Bank Personal Loan. **Rebuild in
  progress** — the first build (14 Customer Flow screens, Entry → Success)
  was scrapped after client-pitch feedback (see `LESSONS.md` in the project
  root) and is being rebuilt from a written plan
  (`docs/journey-01-idbi-personal-loan-plan.md`) using `SectionCard`,
  `sidePanel`, and the "Page Title Ownership" rule from the start. Update
  this entry to reflect actual rebuild progress as screens land.

## Effort Balance — Read This If You Are `frontend-builder`

This project has a documented history of over-investing in defensive/
functional engineering (conditional state-clearing logic, exhaustive
JSDoc, edge-case-aware effects) while under-investing in the visual polish
that "Prototype Scope" above explicitly asks you to prioritize instead. If
you notice yourself adding a `useEffect` to keep two fields in sync, or
writing a paragraph of comments justifying an edge case, stop and ask
whether that same time would better spent on shadow/elevation consistency,
spacing, or a data-provenance badge instead. Functional correctness matters,
but visual polish is what a client-facing prototype pitch is actually judged
on — when in doubt, spend the next unit of effort on the screen looking
better, not on the code being more defensively correct.

## Dead Code — Zero Tolerance

If a component, prop, or file stops being used (superseded by a later
pattern, an experiment that didn't pan out, etc.), remove it — including its
export from `src/core/components/index.ts` — in the same task that makes it
obsolete. Do not leave orphaned components exported "just in case"; the next
person (human or agent) has no way to tell a live pattern from a dead one
without reading every call site.
