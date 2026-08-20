# Institutional AI Decision Navigator

An MS-CC evidence-traceable planning tool that helps higher-education leaders resolve the few AI decisions that matter for the work in front of them. The pilot supports three entry modes: an observable guided diagnostic, a deterministic natural-language context interpreter, and a searchable decision-model explorer.

Canonical repository: [github.com/ms-cc-org/institutional-ai-decision-navigator](https://github.com/ms-cc-org/institutional-ai-decision-navigator)

## Ontology

`data/ontology.json` is the source of truth. Version 0.3.2 contains 99 decisions, 202 prerequisite or related-to relationships, and 27 registered sources. It keeps source support separate from independent corroboration and includes assertion-level evidence links, controlled decision categories, and relationship provenance.

`lib/ontology.ts` validates every required decision and relationship field at load time, rejects duplicate IDs, and ensures relationships refer to existing decisions. Application-specific profile and result types live separately in `lib/types.ts`.

## Intent pathways and recommendations

`lib/intents.ts` contains application metadata for ten user goals. Each typed intent maps to existing ontology domains and seed decision IDs and defines three to five plain-language context questions. It does not modify or duplicate the ontology.

`lib/intent-engine.ts` starts with the selected intent's seed decisions, activates branches from the user's answers, and traverses canonical prerequisite relationships. It returns at most five `PRIMARY` decisions plus a small set of `NEXT` or `CONDITIONAL` items. Explanations use deterministic templates tied to answers and ontology fields. The general pathway returns exactly three priorities and a deterministic 0–90 day sequence.

The original deterministic profile engine in `lib/engine.ts` is preserved as the general pathway's ranking fallback and remains fully tested. The experimental situation interpreter uses local phrase matching to create reviewable structured context; it does not call an LLM or external service. Recommendations in every mode still come from the same deterministic engine.

Working-group review is optional and stored only on the current device. Reviewers can export structured JSON for manual sharing with MS-CC; the pilot does not centrally submit feedback.

See [docs/architecture.md](docs/architecture.md) for the complete data flow and thresholds, and [docs/EVIDENCE_AUDIT_v0.3.2.md](docs/EVIDENCE_AUDIT_v0.3.2.md) for the authoritative evidence and provenance audit.

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

[https://ms-cc-org.github.io/institutional-ai-decision-navigator/](https://ms-cc-org.github.io/institutional-ai-decision-navigator/)

If the first deployment reports that Pages is not enabled, open the repository's **Settings → Pages**, set **Source** to **GitHub Actions**, and rerun the workflow from the **Actions** tab.

## Project development

The Institutional AI Decision Navigator was initially conceived and developed by Amanda Tan and is now being developed and refined as an MS-CC resource, with institutional practitioner validation planned through the MS-CC community.

## Known MVP limitations

- The profile is stored only in the current browser; there are no accounts or shared roadmaps.
- Targeted pathways use three to five context questions; the general assessment uses fourteen observable indicators and deterministic internal defaults where the current engine still requires additional fields.
- Prerequisite completion is estimated from profile maturity rather than collected decision-by-decision.
- Scores and thresholds are transparent heuristics, not validated institutional benchmarks.
- Some source records lack a year or URL, and all evidence links still lack passage-level source locations. The interface leaves those gaps visible rather than filling them by inference.
- The ontology is not yet practitioner validated. Relationship provenance distinguishes structural confidence from source or practitioner validation.
