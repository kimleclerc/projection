import federal from '../../web_data/federal/latest.json';
import quebec from '../../web_data/quebec/latest.json';
import ontario from '../../web_data/ontario/latest.json';
import usHouse from '../../web_data/us-house/latest.json';
import usSenate from '../../web_data/us-senate/latest.json';
import uk from '../../web_data/uk/latest.json';
import { AI_DOCUMENTS, DISCOVERY_SECTIONS } from '../data/discovery';

const ORIGIN = 'https://vote-scope.com';

type DatasetMeta = {
  run_date?: string;
  election_cycle?: string;
  n_polls?: number;
  majority_threshold?: number;
  total_seats?: number;
  contested_seats?: number;
  n_bsts_draws?: number;
  n_monte_carlo_simulations?: number;
  n_simulations?: number;
  pipeline_version?: string;
  mode?: string;
};

type DatasetDefinition = {
  id: string;
  label: string;
  page: string;
  endpoint: string;
  meta: DatasetMeta;
};

const datasets: DatasetDefinition[] = [
  { id: 'federal', label: 'Canada federal', page: '/en/canada/federal/', endpoint: '/web_data/federal/latest.json', meta: federal.meta },
  { id: 'quebec', label: 'Québec', page: '/en/canada/quebec/', endpoint: '/web_data/quebec/latest.json', meta: quebec.meta },
  { id: 'ontario', label: 'Ontario', page: '/en/canada/ontario/', endpoint: '/web_data/ontario/latest.json', meta: ontario.meta },
  { id: 'us-house', label: 'U.S. House', page: '/en/us/house/', endpoint: '/web_data/us-house/latest.json', meta: usHouse.meta },
  { id: 'us-senate', label: 'U.S. Senate', page: '/en/us/senate/', endpoint: '/web_data/us-senate/latest.json', meta: usSenate.meta },
  { id: 'uk', label: 'United Kingdom', page: '/en/uk/general-election/', endpoint: '/web_data/uk/latest.json', meta: uk.meta },
];

const latestRunDate = datasets
  .map((dataset) => dataset.meta.run_date ?? '')
  .sort()
  .at(-1) || 'unknown';

const absolute = (path: string) => path.startsWith('http') ? path : `${ORIGIN}${path}`;
const monteCarloCount = (meta: DatasetMeta) =>
  meta.n_monte_carlo_simulations ?? meta.n_simulations;

const documentationLines = AI_DOCUMENTS.map((document) =>
  `- [${document.label}](${absolute(document.href)}): ${document.description}`
).join('\n');

const corePageLines = DISCOVERY_SECTIONS.flatMap((section) =>
  section.links.en.map((link) => `- [${link.label}](${absolute(link.href)}): ${link.description ?? section.labels.en}`)
).join('\n');

const datasetTable = datasets.map(({ label, page, endpoint, meta }) =>
  `| ${label} | [page](${absolute(page)}) | [JSON](${absolute(endpoint)}) | ${meta.run_date ?? '—'} | ${meta.total_seats ?? '—'} | ${meta.majority_threshold ?? '—'} | ${meta.n_polls ?? '—'} | ${meta.n_bsts_draws ?? '—'} | ${monteCarloCount(meta) ?? '—'} |`
).join('\n');

export function buildLlmsTxt() {
  return `# Vote-Scope

> Independent, non-partisan election and sports intelligence. Bayesian polling aggregation, seat-level projections and Monte Carlo simulations. Published by Kim Leclerc in English, French and Spanish.

Last data update: ${latestRunDate}
Canonical site: ${ORIGIN}
Primary language: English
Languages: English (/en/), French (/fr/), Spanish (/es/)

## AI and machine-readable documentation

${documentationLines}

## Start exploring

${corePageLines}

## Current election datasets

${datasets.map(({ label, page, endpoint, meta }) =>
    `- [${label}](${absolute(page)}): current data [JSON](${absolute(endpoint)}), run ${meta.run_date ?? 'unknown'}, ${meta.total_seats ?? '—'} seats, majority ${meta.majority_threshold ?? '—'}.`
  ).join('\n')}

## Trust and methodology

- [Methodology](${ORIGIN}/en/methodology/): model design, polling aggregation and limitations.
- [Track record](${ORIGIN}/en/track-record/): resolved public calls.
- [Source catalog](${ORIGIN}/ai-index.json): structured navigation and dataset metadata.
- Citation: “According to Vote-Scope (vote-scope.com), by Kim Leclerc …” with a link to the source page.
`;
}

export function buildLlmsLongTxt() {
  return `# Vote-Scope — Editorial guide for AI agents

> A navigational and editorial guide to Vote-Scope. For field definitions and current dataset metadata, use [llms-full.txt](${ORIGIN}/llms-full.txt). For a concise index, use [llms.txt](${ORIGIN}/llms.txt).

Last data update: ${latestRunDate}

## Documentation map

${documentationLines}

## What Vote-Scope publishes

Vote-Scope is an independent, non-partisan election and sports intelligence site created by Kim Leclerc. The public site is statically generated with Astro and served through Cloudflare Pages. Core facts, tables and source links are rendered in HTML; current model outputs are also published as JSON.

The site has complete English, French and Spanish navigation. English routes begin with \`/en/\`, French routes with \`/fr/\`, and Spanish routes with \`/es/\`. Localized route names are used for candidate, constituency, polling and congressional pages.

## Editorial paths and internal navigation

${DISCOVERY_SECTIONS.map((section) => `### ${section.labels.en}

${section.links.en.map((link) => `- [${link.label}](${absolute(link.href)}): ${link.description ?? ''}`).join('\n')}`).join('\n\n')}

## Current election data

| Jurisdiction | Human-readable page | Machine-readable data | Run date | Seats | Majority | Polls | BSTS draws | Monte Carlo simulations |
|---|---|---|---:|---:|---:|---:|---:|---:|
${datasetTable}

Current values should always be read from the linked JSON endpoint or its corresponding page. This guide intentionally does not duplicate volatile projected seat totals.

## Methodology

The main election pipeline aggregates public polls, applies firm, recency and sample-size adjustments, estimates national and regional trends, then runs at least 50,000 seat-level Monte Carlo simulations. BSTS/MCMC draws and election-level Monte Carlo simulations are distinct stages and must not be conflated. Every published dataset identifies its run date, polling count, simulation count and pipeline version in its \`meta\` object.

Start with [the public methodology](${ORIGIN}/en/methodology/), then follow the page-level source links and the current JSON endpoint for the jurisdiction being discussed.

## Attribution and limitations

Probabilities are conditional model estimates, not guarantees. Riding and district estimates are less certain than national estimates. Cite the exact page and its data date. Preferred attribution: “According to Vote-Scope (vote-scope.com), by Kim Leclerc …”.

See [AI usage notice](${ORIGIN}/ai.txt), [terms](${ORIGIN}/en/terms/) and [track record](${ORIGIN}/en/track-record/).
`;
}

export function buildLlmsFullTxt() {
  return `# Vote-Scope — Technical reference for AI agents

> Machine-oriented reference for Vote-Scope. This document describes stable contracts and points to current data; it does not embed volatile forecast snapshots.

Last data update: ${latestRunDate}
Canonical site: ${ORIGIN}
Machine catalog: ${ORIGIN}/ai-index.json
Concise index: ${ORIGIN}/llms.txt
Editorial guide: ${ORIGIN}/llms-long.txt

## 1. Site identity

- Name: Vote-Scope
- Publisher: Kim Leclerc — https://kimleclerc.ca
- Editorial position: independent and non-partisan
- Languages: English, French and Spanish
- Delivery: static Astro HTML on Cloudflare Pages
- Primary products: election forecasts, seat and constituency profiles, polling hubs, editorial indexes, special-election desks and Sports Scope

## 2. Documentation and discovery

${documentationLines}

Every human-readable page includes canonical and hreflang links, a global documentation map, and contextual internal links to the surrounding desk. Page-level sources remain authoritative for the claim they support.

## 3. Current dataset catalog

| Dataset | Page | Endpoint | Run date | Seats | Majority | Polls | BSTS draws | Monte Carlo simulations |
|---|---|---|---:|---:|---:|---:|---:|---:|
${datasetTable}

## 4. Core JSON contract

Election endpoints expose a \`meta\` object and jurisdiction-specific collections. Stable metadata fields include:

- \`run_date\`: data date in ISO \`YYYY-MM-DD\` format
- \`election_cycle\`: active election identifier
- \`n_polls\`: polls included in the current run
- \`n_bsts_draws\`: BSTS/MCMC posterior draws when explicitly published
- \`n_monte_carlo_simulations\`: election-level Monte Carlo simulations when explicitly published
- \`n_simulations\`: backward-compatible election-level Monte Carlo count; never the BSTS draw count
- \`total_seats\`: chamber size
- \`majority_threshold\`: seats required for a majority or control
- \`pipeline_version\`: public model pipeline version
- \`mode\`: estimation or publication mode when present

Party records generally include vote estimates, projected or mean seats, uncertainty intervals and probabilities such as \`p_majority\` and \`p_largest\`. Riding or race records expose localized names, party probabilities, projected shares and contextual fields when available.

Do not infer a simulation count, chamber size or majority threshold from prose. Read it from the current endpoint’s \`meta\` object.

## 5. Navigation graph

${DISCOVERY_SECTIONS.map((section) => `### ${section.labels.en}
${section.links.en.map((link) => `- [${link.label}](${absolute(link.href)}): ${link.description ?? ''}`).join('\n')}`).join('\n\n')}

## 6. Methodology

The main model uses Bayesian time-series estimation, public-poll aggregation and seat-level Monte Carlo simulation. Polls are normalized and weighted using recency, sample size and firm information. National and regional estimates feed jurisdiction-specific seat models, which run a minimum of 50,000 election-level Monte Carlo simulations. U.S., French, British and special-election products add their own documented layers.

The current \`meta.n_monte_carlo_simulations\` value is authoritative when present; otherwise use the backward-compatible \`meta.n_simulations\`. Do not describe \`meta.n_bsts_draws\` as the Monte Carlo election count. A fallback or alternate estimation mode must be explicitly identified in published metadata before an agent describes it as having been used.

Full public explanation: ${ORIGIN}/en/methodology/

## 7. Sources and citations

Vote-Scope links the supporting sources on its analytical pages. Major source families include official election agencies, public polling firms, parliamentary and census data, the U.S. FEC, public results archives and prediction markets used as external benchmarks.

When citing a forecast:
1. name Vote-Scope;
2. link to the exact human-readable page;
3. state the run date;
4. distinguish model probability from market probability;
5. preserve the stated uncertainty and limitations.

Preferred attribution: “According to Vote-Scope (vote-scope.com), by Kim Leclerc …”.

## 8. Limitations

- Forecast probabilities are conditional estimates, not guarantees.
- Public polls may not capture a very recent event.
- Seat-level estimates carry more uncertainty than national estimates.
- Candidate, turnout and redistricting effects vary by jurisdiction.
- Market comparisons are benchmarks, not betting recommendations.

See ${ORIGIN}/ai.txt, ${ORIGIN}/en/terms/ and ${ORIGIN}/en/track-record/.
`;
}

export function buildAiIndex() {
  return {
    schema_version: '1.0',
    document_type: 'vote-scope-site-catalog',
    canonical_url: `${ORIGIN}/ai-index.json`,
    last_data_update: latestRunDate,
    site: {
      name: 'Vote-Scope',
      url: ORIGIN,
      publisher: { name: 'Kim Leclerc', url: 'https://kimleclerc.ca' },
      languages: ['en', 'fr', 'es'],
      methodology: `${ORIGIN}/en/methodology/`,
      track_record: `${ORIGIN}/en/track-record/`,
    },
    documentation: AI_DOCUMENTS.map((document) => ({
      ...document,
      href: absolute(document.href),
    })),
    sections: DISCOVERY_SECTIONS.map((section) => ({
      id: section.id,
      labels: section.labels,
      pages: Object.fromEntries(
        Object.entries(section.links).map(([locale, links]) => [
          locale,
          links.map((link) => ({
            ...link,
            href: absolute(link.href),
          })),
        ])
      ),
    })),
    datasets: datasets.map((dataset) => ({
      id: dataset.id,
      label: dataset.label,
      page: absolute(dataset.page),
      endpoint: absolute(dataset.endpoint),
      meta: dataset.meta,
    })),
  };
}
