# Lame-Duck Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new Lame-Duck page as a clean Astro 6.2 + Preact Islands reference page for the rebuilt Vote-Scope site.

**Architecture:** Keep legacy pages untouched as references. Build a new Lame-Duck shell with `EditorialLayout`, build-time data loading, static Astro sections, shared CSS, and focused Islands for every interactive tool. Preserve the common site chrome and template language used by the rebuilt Canada/projection pages; Lame-Duck gets expressive instrument internals, not a separate header/footer/design system. Replace the canonical rebuilt route only after the new page is visually and technically verified.

**Tech Stack:** Astro 6.2, Preact Islands, local JSON in `web_data/us-lame-duck/latest.json`, existing Vote-Scope layouts/styles, Browser visual QA.

---

## File Structure

- Create `src/data/lameDuck.ts`: central typed loader/adapter for `web_data/us-lame-duck/latest.json`.
- Create `src/styles/lame-duck.css`: shared visual language for the rebuilt Lame-Duck page.
- Create `src/components/lame-duck/LameDuckPage.astro`: static page shell and section composition.
- Create `src/components/lame-duck/LameDuckSeo.ts`: JSON-LD helpers if the current inline JSON-LD becomes noisy.
- Create or replace `src/islands/DuckMeter.tsx`: meter Island.
- Create `src/islands/HeroStats.tsx`: score, delta, approval, automatic countdown.
- Create `src/islands/LiveTicker.tsx`: ticker Island.
- Create `src/islands/ComponentBreakdown.tsx`: component cards and scoped tooltip behavior.
- Create `src/islands/LameDuckHistory.tsx`: chart, scrubber, comparison grid, modal.
- Create `src/islands/MidtermsEngagement.tsx`: midterms cards and rabbit-hole links.
- Create `src/pages/en/us/indexes/lame-duck-new.astro`: temporary preview route for the new page.
- Later modify `src/pages/en/us/indexes/lame-duck.astro`: swap to the new shell only after preview validation.
- Later create/update `src/pages/fr/us/indexes/lame-duck-new.astro` and `src/pages/es/us/indexes/lame-duck-new.astro` after EN is stable.

## Task 1: Freeze Legacy And Prepare Preview Route

**Files:**
- Create: `src/pages/en/us/indexes/lame-duck-new.astro`
- Create: `src/components/lame-duck/LameDuckPage.astro`
- Create: `src/data/lameDuck.ts`

- [ ] **Step 1: Inspect rebuilt site templates before coding**

Run:

```bash
sed -n '1,220p' src/layouts/EditorialLayout.astro
sed -n '1,220p' src/pages/en/canada/federal.astro
sed -n '1,220p' src/components/ProjectionEngine.astro
```

Expected: identify shared header/footer/layout conventions to reuse for Lame-Duck.

- [ ] **Step 2: Confirm no new code depends on the legacy script**

Run:

```bash
rg -n "scripts/lame-duck|public/js/lame-duck|lame-duck\\.js" src/pages src/components src/islands
```

Expected: only legacy pages contain those imports until the preview route is created.

- [ ] **Step 3: Add typed data loader**

Implement `src/data/lameDuck.ts` with exported types and a `getLameDuckData()` function that imports or reads `web_data/us-lame-duck/latest.json`, normalizes missing optional groups to empty arrays/objects, and computes `daysToMidterms` from `meta.midterm_date`.

- [ ] **Step 4: Add static shell component**

Implement `src/components/lame-duck/LameDuckPage.astro` using `EditorialLayout`, the current EN editorial copy, and static section structure. Do not import any legacy script.

- [ ] **Step 5: Add preview route**

Implement `src/pages/en/us/indexes/lame-duck-new.astro` that calls `getLameDuckData()` and renders `LameDuckPage`.

- [ ] **Step 6: Verify route compiles enough for Astro**

Run:

```bash
npm run validate:editorial
```

Expected: validation passes or reports only rules that need updating for the new preview route.

## Task 2: Shared CSS Without Inline Page Styles

**Files:**
- Create: `src/styles/lame-duck.css`
- Modify: `src/components/lame-duck/LameDuckPage.astro`

- [ ] **Step 1: Move canon styles into a shared stylesheet**

Extract the Lame-Duck visual rules from the legacy page into `src/styles/lame-duck.css`. Keep the canon look, but remove unused selectors tied only to legacy DOM injection.

- [ ] **Step 2: Import CSS once from the shell**

Import `../../styles/lame-duck.css` from `LameDuckPage.astro`.

- [ ] **Step 3: Check for inline global style regressions**

Run:

```bash
rg -n "<style is:global>|import .*lame-duck\\.js|onclick=" src/components/lame-duck src/pages/en/us/indexes/lame-duck-new.astro
```

Expected: no legacy script import and no inline event handlers. A local Astro `<style>` should not be needed for the rebuilt page.

## Task 3: Build Islands One At A Time

**Files:**
- Modify: `src/islands/DuckMeter.tsx`
- Create: `src/islands/HeroStats.tsx`
- Create: `src/islands/LiveTicker.tsx`
- Create: `src/islands/ComponentBreakdown.tsx`
- Create: `src/islands/LameDuckHistory.tsx`
- Create: `src/islands/MidtermsEngagement.tsx`
- Modify: `src/components/lame-duck/LameDuckPage.astro`

- [ ] **Step 1: Keep `DuckMeter` but harden it**

Ensure `DuckMeter` supports score clamping, empty-zone fallback, EN/FR/ES-ready labels, unique SVG IDs when multiple meters appear, keyboard-accessible tabs, and `prefers-reduced-motion`.

- [ ] **Step 2: Add `HeroStats`**

Move current score, delta, approval, and countdown into `HeroStats`. Countdown must be computed from `meta.midterm_date`, not from stale `meta.days_to_midterms`.

- [ ] **Step 3: Add `LiveTicker`**

Render ticker items from data if available. If the current JSON lacks ticker items, use a centralized adapter fallback and record that the pipeline should eventually emit ticker content.

- [ ] **Step 4: Add `ComponentBreakdown`**

Render component cards from `components`, including bars, quality badges, and scoped tooltip/focus descriptions. Avoid document-level mousemove unless strictly necessary.

- [ ] **Step 5: Add `LameDuckHistory`**

Render the historical time series, scrubber, president comparison grid, and president modal inside one Island because these interactions share state.

- [ ] **Step 6: Add `MidtermsEngagement`**

Render House/Senate projection cards and contextual links to `/en/us/house/`, `/en/us/senate/`, `/en/us/`, and future district/special pages.

- [ ] **Step 7: Verify no legacy script remains in preview**

Run:

```bash
rg -n "lame-duck\\.js|document\\.getElementById|querySelector|innerHTML|onclick=" src/components/lame-duck src/pages/en/us/indexes/lame-duck-new.astro src/islands
```

Expected: no legacy script import. Any DOM API use in Islands must be justified and scoped.

## Task 4: Browser QA And Performance Pass

**Files:**
- No source changes unless QA finds issues.

- [ ] **Step 1: Start Astro dev server**

Run:

```bash
npm run dev
```

Expected: local dev server starts. If sandbox blocks it, rerun with approval.

- [ ] **Step 2: Open preview route**

Use Browser on:

```text
http://localhost:4321/en/us/indexes/lame-duck-new/
```

Expected: first viewport renders meaningful Lame-Duck content with no framework overlay.

- [ ] **Step 3: Capture desktop and mobile screenshots**

Check desktop and mobile for text overlap, meter framing, ticker behavior, card layout, and footer/section rhythm.

- [ ] **Step 4: Exercise each Island**

Interactions:

- Switch DuckMeter views.
- Verify countdown date.
- Hover/focus component cards.
- Scrub history chart.
- Open and close president modal.
- Inspect midterms/rabbit-hole links.

- [ ] **Step 5: Check console health**

Expected: no relevant errors or warnings caused by the rebuilt page.

## Task 5: Promote Preview To Canon EN

**Files:**
- Modify: `src/pages/en/us/indexes/lame-duck.astro`

- [ ] **Step 1: Replace canon EN route**

Change `src/pages/en/us/indexes/lame-duck.astro` to render the same `LameDuckPage` shell as the preview route.

- [ ] **Step 2: Keep legacy routes untouched**

Do not modify `src/pages/usa/lame-duck.astro` or `src/pages/fr/usa/canard-boiteux.astro` in this task.

- [ ] **Step 3: Verify canon route has no legacy script**

Run:

```bash
rg -n "lame-duck\\.js|<script|onclick=" src/pages/en/us/indexes/lame-duck.astro src/components/lame-duck
```

Expected: no script import and no inline handlers.

## Task 6: Localize After EN Is Stable

**Files:**
- Create or modify: `src/pages/fr/us/indexes/lame-duck.astro`
- Create or modify: `src/pages/es/us/indexes/lame-duck.astro`
- Modify: `src/components/lame-duck/LameDuckPage.astro`
- Modify: `src/data/lameDuck.ts`

- [ ] **Step 1: Add locale props**

Make `LameDuckPage` accept locale-specific copy and alternates.

- [ ] **Step 2: Port FR and ES without duplicating logic**

Use the same shell and Islands. Only copy strings differ.

- [ ] **Step 3: Verify locale routes**

Run:

```bash
rg -n "lame-duck\\.js|<script|onclick=" src/pages/fr/us/indexes/lame-duck.astro src/pages/es/us/indexes/lame-duck.astro src/components/lame-duck
```

Expected: no script import and no inline handlers.

## Task 7: Final Verification

**Files:**
- No source changes unless verification finds issues.

- [ ] **Step 1: Run editorial validation**

Run:

```bash
npm run validate:editorial
```

Expected: pass.

- [ ] **Step 2: Run Astro build**

Run:

```bash
npm run build
```

Expected: pass. If the known Astro/Vite hang reproduces, document process state and exact blocker instead of claiming success.

- [ ] **Step 3: Browser smoke test canon routes**

Check:

- `/en/us/indexes/lame-duck/`
- `/fr/us/indexes/lame-duck/`
- `/es/us/indexes/lame-duck/`

Expected: content renders, no overlay, no console errors, core Island interactions work.

- [ ] **Step 4: Report remaining pipeline asks**

List data fields that should eventually move into JSON generation, such as ticker items or engagement modules, if fallback content was needed.

## Self-Review

- Spec coverage: the plan covers parallel rebuild, static Astro shell, Islands, data contract, CSS extraction, browser QA, and final promotion.
- Placeholder scan: no TBD/TODO placeholders remain.
- Type consistency: `LameDuckPage`, `getLameDuckData`, and Island names are consistent across tasks.
