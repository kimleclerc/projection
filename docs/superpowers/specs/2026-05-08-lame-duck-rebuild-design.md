# Lame-Duck Rebuild Design

## Purpose

Build the new Lame-Duck page as the first canonical model for the rebuilt Vote-Scope site. This is not a progressive production migration. The legacy pages stay available as active-site reference material while the new Astro 6.2 site is rebuilt cleanly beside them.

## Core Rule

Astro pages render static HTML, compose layout, prepare data, and pass props. They do not contain application JavaScript, inline event handlers, or DOM-manipulation scripts. Anything interactive or stateful is an Island with partial hydration.

## Architecture

The new Lame-Duck experience uses `EditorialLayout` and a reusable page shell that reads centralized data from `web_data/us-lame-duck/latest.json` at build time. The page renders static editorial sections in Astro and delegates interactive tools to Preact Islands.

The page must remain part of the same rebuilt Vote-Scope site as the new Canada, Quebec, Ontario, U.S., U.K., sports, and projection pages. Header, footer, navigation, page chrome, spacing primitives, typography tokens, and shared layout behavior come from the common templates. Lame-Duck can define its own instrument visuals inside the content area, but it must not become a separate microsite or forked design system.

Legacy files such as `src/pages/usa/lame-duck.astro`, `src/pages/fr/usa/canard-boiteux.astro`, and `src/scripts/lame-duck.js` are references only. They should not be patched into the new architecture or kept running inside the rebuilt page.

## Data Contract

The site consumes centralized data. Simulation and pipeline modules produce that data and remain conceptually outside the public site layer. If the current JSON shape is insufficient, add a small centralized adapter or record a pipeline change; do not hard-code values in the page.

The Lame-Duck page needs these data groups:

- `meta`: dates, version, freshness, term and election dates.
- `ldi`: score, label, zone, delta, quality.
- `zones`: score zones, colors, labels, tooltip text.
- `components`: net approval, generic ballot, congressional control, economic sentiment.
- `history`: current term time series.
- `historical_presidents`: comparable historical trajectories.
- `midterms`: House and Senate forecast summary.
- `ticker` or equivalent editorial feed: future target if not currently present.
- `engagement`: future target for contextual rabbit-hole links if not currently present.

## Page Structure

Static Astro sections:

- SEO, canonical, alternates, JSON-LD.
- Hero copy and editorial framing.
- Methodology explanation.
- FAQ.
- Static newsletter/cross-link bands.
- Section wrappers and semantic headings.

Hydrated Islands:

- `DuckMeter`: gauge, bathtub, waterline, Trump-hair duck, view switcher.
- `HeroStats`: current score, delta, net approval, automatic countdown from election date.
- `LiveTicker`: moving ticker, pause on hover/focus, reduced-motion support.
- `ComponentBreakdown`: component cards, bars, quality badges, tooltip behavior.
- `LameDuckHistory`: time-series chart, scrubber, historical president comparison, president detail modal.
- `MidtermsEngagement`: House/Senate cards and contextual links to US projections and related pages.

## Visual Requirements

The Lame-Duck page is the visual and editorial canon. It must stay alive, playful, and instrument-like. The duck, ticker, visual meter, historical cards, and engagement links are core to the experience, not decorations to remove.

The rebuild should preserve the legacy page's energy while improving structure, responsiveness, accessibility, loading behavior, and reuse across future pages. It should harmonize with the existing rebuilt pages rather than force a later header/footer/CSS re-harmonization pass.

## Performance Requirements

- Serve meaningful HTML without client JavaScript.
- Hydrate only the Islands that need interaction.
- Prefer build-time JSON reads and prop passing over client fetches unless runtime refresh is intentional.
- Avoid global event listeners where scoped component events suffice.
- Keep Island props minimal and avoid passing the full JSON blob to every component.
- Support `prefers-reduced-motion`.

## Validation Requirements

The rebuild is not accepted until these checks pass:

- Astro validation script.
- Astro build, or a documented environment blocker.
- Browser comparison against the legacy reference.
- Desktop and mobile visual QA.
- No relevant console errors.
- Each Island interaction is exercised.
- Countdown updates from dates rather than a stale hard-coded number.
- No legacy Lame-Duck script is imported by the new page.
