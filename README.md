# Institutional AI Decision Navigator

An evidence-based planning tool that helps higher-education leaders resolve the few AI decisions that matter for the goal in front of them. A user chooses an intent, answers three to five targeted questions, and receives no more than five primary decisions with actions, evidence, and dependencies. A short general assessment remains available for users who do not know where to start.

## Ontology

`data/ontology.json` is the unchanged source of truth. Version 0.2 contains 99 decisions across 13 domains and 202 prerequisite or related-to relationships. Decisions provide their question, trigger, context, options, recommendation logic, risks, stakeholders, source IDs, maturity stage, and expected output.

`lib/ontology.ts` validates every required decision and relationship field at load time, rejects duplicate IDs, and ensures relationships refer to existing decisions. Application-specific profile and result types live separately in `lib/types.ts`.

## Intent pathways and recommendations

`lib/intents.ts` contains application metadata for ten user goals. Each typed intent maps to existing ontology domains and seed decision IDs and defines three to five plain-language context questions. It does not modify or duplicate the ontology.

`lib/intent-engine.ts` starts with the selected intent's seed decisions, activates branches from the user's answers, and traverses canonical prerequisite relationships. It returns at most five `PRIMARY` decisions plus a small set of `NEXT` or `CONDITIONAL` items. Explanations use deterministic templates tied to answers and ontology fields. The general pathway returns exactly three priorities and a deterministic 0–90 day sequence.

The original deterministic profile engine in `lib/engine.ts` is preserved as the general pathway's ranking fallback and remains fully tested. No LLM or external service is involved.

See [docs/architecture.md](docs/architecture.md) for the complete data flow and thresholds.

## Run locally

Requires a current Node.js LTS release.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Publish with GitHub Pages

The application is configured as a static Next.js export. Pushes to `main` run `.github/workflows/deploy-pages.yml`, which tests the application, builds it with the repository-specific Pages base path, and deploys the `out` directory.

The expected project-site URL is:

`https://amanda-tan.github.io/institutional-ai-decision-tool/`

If the first deployment reports that Pages is not enabled, open the repository's **Settings → Pages**, set **Source** to **GitHub Actions**, and rerun the workflow from the **Actions** tab.

## Known MVP limitations

- The profile is stored only in the current browser; there are no accounts or shared roadmaps.
- Targeted pathways use three to five context questions; the general assessment uses eight inputs and typed defaults for non-visible profile fields.
- Prerequisite completion is estimated from profile maturity rather than collected decision-by-decision.
- Scores and thresholds are transparent heuristics, not validated institutional benchmarks.
- Evidence source IDs are displayed exactly as supplied; the ontology does not include full source records or links.
