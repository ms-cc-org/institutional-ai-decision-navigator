# AGENTS.md

## Project
Institutional AI Decision Navigator

## Purpose
Build a decision-support tool for higher-education institutions that uses the ontology in `data/ontology.json` to determine which institutional AI decisions matter, in what order, and why.

## Source of truth
`data/ontology.json` is the canonical decision ontology.

Do not invent:
- decision IDs
- decision questions
- evidence source IDs
- recommendation logic
- relationships
- prerequisites

If application-specific metadata is needed, store it separately from the ontology.

## MVP constraints
- Deterministic decision engine
- No LLM-generated recommendations
- No vector database
- No Neo4j
- No authentication
- No external database
- Recommendations must be explainable and traceable to ontology data

## Intended stack
Use Next.js, TypeScript, App Router, and Tailwind CSS unless repository inspection reveals a strong reason not to.

## Required behavior
The application should:
1. Collect a short institutional profile.
2. Determine relevant ontology decisions.
3. Rank decisions into:
   - DO_NOW
   - DO_NEXT
   - LATER
   - NOT_CURRENTLY_RELEVANT
4. Explain why each decision was surfaced.
5. Show evidence source IDs and prerequisites.
6. Provide a decision-detail view.

## Quality requirements
Before completion:
- run lint
- run type checking
- run tests
- run production build
- fix failures

Do not modify the ontology merely to make implementation easier.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
