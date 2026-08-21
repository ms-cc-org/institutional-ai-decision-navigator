# Architecture

The application is a static-friendly Next.js App Router project. `data/ontology.json` remains the single source of truth and is never changed at runtime.

## Data flow

1. `lib/ontology.ts` parses and validates decision IDs, maturity stages, and relationship endpoints.
2. `lib/intents.ts` defines the typed, application-level intent paths, seed decision IDs, relevant domains, and context questions separately from the ontology.
3. `lib/applicability-contexts.ts` defines separate, controlled routing metadata for data and requirement contexts. It maps only to existing decision IDs and never changes ontology evidence profiles.
4. `components/IntentNavigator.tsx` presents three primary entry modes. The guided mode uses `components/ProfileForm.tsx`; the experimental situation mode uses `lib/situation-interpreter.ts`; the explorer filters the same canonical decisions.
5. The current intent, answers, diagnostic state, situation interpretation, and optional profile are stored only in browser local storage using versioned structures where schemas have evolved.
6. `lib/intent-engine.ts` activates deterministic answer branches, traverses ontology prerequisites, and emits no more than five primary recommendations plus a few next or conditional decisions.
7. `components/FocusedRoadmap.tsx` renders plain-language explanations and actions first. Evidence IDs and dependency links sit in expandable secondary sections.
8. Detail routes render user-facing ontology content first and place technical ontology metadata and optional working-group validation in secondary disclosures.

## Intent-aware selection

Every intent starts from existing ontology seed IDs. Answer rules narrow or extend those seeds for the user's context. A cycle-safe traversal collects prerequisite relationships; those dependencies feed the small "Then consider" section and the expandable connection view. Primary results are hard-capped at five.

Recommendation titles and explanation templates are application metadata. They do not create new decisions or replace the ontology's questions, recommendation logic, outputs, sources, or relationships. Every result retains its decision ID and source IDs for traceability.

The general pathway deterministically selects exactly three strategic priorities from governance, data/risk, and the user's stated objective. Those decisions become a 0–30, 30–60, and 60–90 day sequence. The situation interpreter maps explicit phrases to structured fields, leaves unmentioned context unknown, requires review, and only then maps to an existing intent and deterministic engine inputs.

## Preserved profile ranking model

Foundation, Developing, and Advanced stages start at 32, 18, and 8 points. Named rules then adjust the score for adoption, governance, regulated data, research intensity, stated objectives, internal capacity, security, accessibility, budget constraints, and prerequisites. Thresholds are: 48+ `DO_NOW`, 28+ `DO_NEXT`, 8+ `LATER`, and below 8 `NOT_CURRENTLY_RELEVANT`. The exported `RANKING_RULES` object in `lib/engine.ts` is the exact scoring contract.

Every adjustment appends a human-readable reason. Trigger language is shown as matched only when the profile activates a documented trigger-matching rule. Scoring exists only to create a stable ordering; it is not presented as an institutional maturity score.

Prerequisite IDs come exclusively from ontology relationships. Because the MVP does not ask users to mark individual decisions complete, formal AI governance plus strong data and security maturity is the conservative proxy for foundational readiness. Without that combination, a Developing decision with prerequisites cannot rank above `DO_NEXT`, and an Advanced decision with prerequisites cannot rank above `LATER`. Within each category, Foundation decisions sort before Developing and Advanced decisions.

## Boundaries

There is no server database, authentication, external AI service, or generated recommendation prose. Path, profile, and practitioner feedback are device-local. The v0.3.3 ontology includes a 33-record source registry and assertion-level evidence links, so the interface resolves human-readable source metadata while leaving missing URLs, years, and source locations explicit. Applicability contexts answer “when might this matter?” while evidence answers “why consider it?” and validation records practitioner confirmation. The application does not turn applicability into a legal determination or invent `derivation_sources` provenance.
