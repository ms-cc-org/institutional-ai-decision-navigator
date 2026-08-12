# Architecture

The application is a static-friendly Next.js App Router project. `data/ontology.json` remains the single source of truth and is never changed at runtime.

## Data flow

1. `lib/ontology.ts` parses and validates decision IDs, maturity stages, and relationship endpoints.
2. `lib/intents.ts` defines the typed, application-level intent paths, seed decision IDs, relevant domains, and context questions separately from the ontology.
3. `components/IntentNavigator.tsx` progressively collects only the answers needed for the selected goal. The secondary general path uses `components/ProfileForm.tsx`.
4. The current intent, answers, and optional profile are stored only in browser local storage.
5. `lib/intent-engine.ts` activates deterministic answer branches, traverses ontology prerequisites, and emits no more than five primary recommendations plus a few next or conditional decisions.
6. `components/FocusedRoadmap.tsx` renders plain-language explanations and actions first. Evidence IDs and dependency links sit in expandable secondary sections.
7. Detail routes render user-facing ontology content first and place technical ontology metadata in a secondary disclosure.

## Intent-aware selection

Every intent starts from existing ontology seed IDs. Answer rules narrow or extend those seeds for the user's context. A cycle-safe traversal collects prerequisite relationships; those dependencies feed the small "Then consider" section and the expandable connection view. Primary results are hard-capped at five.

Recommendation titles and explanation templates are application metadata. They do not create new decisions or replace the ontology's questions, recommendation logic, outputs, sources, or relationships. Every result retains its decision ID and source IDs for traceability.

The general pathway deterministically selects exactly three strategic priorities from governance, data/risk, and the user's stated objective. Those decisions become a 0–30, 30–60, and 60–90 day sequence.

## Preserved profile ranking model

Foundation, Developing, and Advanced stages start at 32, 18, and 8 points. Named rules then adjust the score for adoption, governance, regulated data, research intensity, stated objectives, internal capacity, security, accessibility, budget constraints, and prerequisites. Thresholds are: 48+ `DO_NOW`, 28+ `DO_NEXT`, 8+ `LATER`, and below 8 `NOT_CURRENTLY_RELEVANT`. The exported `RANKING_RULES` object in `lib/engine.ts` is the exact scoring contract.

Every adjustment appends a human-readable reason. Trigger language is shown as matched only when the profile activates a documented trigger-matching rule. Scoring exists only to create a stable ordering; it is not presented as an institutional maturity score.

Prerequisite IDs come exclusively from ontology relationships. Because the MVP does not ask users to mark individual decisions complete, formal AI governance plus strong data and security maturity is the conservative proxy for foundational readiness. Without that combination, a Developing decision with prerequisites cannot rank above `DO_NEXT`, and an Advanced decision with prerequisites cannot rank above `LATER`. Within each category, Foundation decisions sort before Developing and Advanced decisions.

## Boundaries

There is no server database, authentication, external AI service, or generated recommendation prose. Path and profile state are device-local. The ontology does not include full evidence source records, so the interface can show source IDs but cannot provide human-readable source names or links.
