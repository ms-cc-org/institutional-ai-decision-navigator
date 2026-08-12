# Ontology v0.3.2 Evidence Enrichment Audit

## Scope

This release separates **source support** from **independent corroboration**. It does not treat citation count as evidence quality. Evidence-link classifications are conservative and scope-based; passage-level verification is still required where `source_location` is null.

## Headline findings

- Decisions: **99**
- Relationships: **202**
- Registered sources: **27**
- Source support: **{'synthesized': 17, 'direct': 79, 'contextual': 3}**
- Corroboration: **{'multiple_independent_sources': 26, 'partial': 38, 'none': 35}**
- Decisions relying only on C035/C036: **34**
- Relationships remain researcher-inferred: **202/202**
- Relationship confidence after structural review: **{'high': 99, 'moderate': 101, 'low': 2}**

## Interpretation

The v0.2/v0.3 audit overstated weakness by conflating two questions: whether a source actually addresses a decision, and whether that decision is independently corroborated. C035 and C036 contain substantial direct guidance within their scopes. A decision can therefore be directly supported while still lacking independent corroboration.

The ontology is defensible as **evidence-traceable**, but not yet as a validated evidence-based framework. Direct support classifications for C035/C036 reflect the completed scope review. Other sources are conservatively treated as corroborating when their verified scope matches the decision domain; exact passage-level review remains a required next stage.

## Dominant source usage

- **C035 — The CaRCC AI Facilitation Handbook**: 51 decisions (51.5%)
- **C036 — Guidance for AI Policy Development**: 75 decisions (75.8%)

## Decisions with no independent corroboration

- **POL-008** — Can AI features, models, accounts, or integrations be disabled quickly during an incident? | support=direct | sources=C036
- **DAT-003** — Who owns or controls data used for AI, and are permissions sufficient for the intended use? | support=direct | sources=C035, C036
- **DAT-005** — Where may institutional AI data be stored and processed? | support=direct | sources=C035, C036
- **DAT-006** — Which storage platforms are approved for AI data and model artifacts? | support=direct | sources=C035, C036
- **DAT-007** — How long should AI datasets, prompts, logs, checkpoints, models, and outputs be retained? | support=direct | sources=C035, C036
- **DAT-008** — How should AI data move between campus, cloud, collaborators, and compute systems? | support=direct | sources=C035, C036
- **DAT-009** — What minimum data quality checks are required before model development or deployment? | support=direct | sources=C035, C036
- **DAT-010** — How will transformations and versions of training/evaluation data be tracked? | support=direct | sources=C035
- **SEC-001** — Who should have access to AI tools, models, data, and compute resources? | support=direct | sources=C036, C035
- **SEC-002** — How should scarce AI compute be allocated fairly? | support=direct | sources=C036, C037
- **SEC-003** — What authentication requirements should apply to AI services and models? | support=direct | sources=C036, C035
- **SEC-005** — How will models be authenticated, tested, and monitored for anomalies or misuse? | support=direct | sources=C036, C035
- **SEC-007** — Does a project require an isolated or controlled computing environment? | support=direct | sources=C035, C036
- **TEC-001** — What type of AI workload is being supported? | support=direct | sources=C035, C036
- **TEC-002** — What CPU, GPU, memory, storage, and network resources are actually required? | support=direct | sources=C035, C036
- **TEC-005** — Should the institution operate a shared AI platform rather than project-by-project environments? | support=direct | sources=C035
- **TEC-006** — How should AI software, libraries, plugins, and model-serving tools be approved and maintained? | support=direct | sources=C035, C036
- **TEC-007** — When should AI workloads be containerized? | support=direct | sources=C035
- **TEC-008** — Which execution mode does the use case require? | support=direct | sources=C035
- **TEC-009** — When should a prototype move from laptop/Colab to shared or institutional resources? | support=direct | sources=C035
- **PRO-001** — Which existing vendors have added AI features to products already in use? | support=direct | sources=C036
- **PRO-003** — Should the institution build a solution, configure an existing platform, or buy a specialized product? | support=direct | sources=C035, C036
- **PRO-006** — What is the full lifecycle cost of the AI service or infrastructure? | support=direct | sources=C035, C036
- **PEO-004** — Where do users go for AI help? | support=direct | sources=C035, C036
- **RES-001** — When should a researcher engage research computing/data facilitators? | support=direct | sources=C035
- **RES-002** — Has the scientific question been translated into a feasible AI problem with success criteria? | support=direct | sources=C035
- **RES-004** — Should the project use an existing model, fine-tune one, or develop a model from scratch? | support=direct | sources=C035, C036
- **RES-005** — Do model and dataset licenses permit the intended research and deployment? | support=direct | sources=C035
- **RES-006** — What benchmarks, baselines, metrics and acceptance criteria will determine whether the model is good enough? | support=direct | sources=C035, C036
- **RES-009** — What structured documentation should accompany an AI model or service? | support=direct | sources=C035, C036
- **RES-010** — Which datasets, code, models, and environments should be preserved after the project? | support=direct | sources=C035, C036
- **ACC-004** — Do community or Indigenous data governance principles apply to the AI project? | support=direct | sources=C035, C036
- **EVA-003** — At what points should a project stop, redesign, or proceed? | support=contextual | sources=C035
- **EVA-006** — How will usage, compute, storage, API, egress, and staffing costs be monitored over time? | support=contextual | sources=C035, C036
- **EVA-007** — When should an AI service, model, or pilot be retired? | support=contextual | sources=C035, C036

## Relationship provenance review

No relationship is upgraded to `source_explicit` in v0.3.2. Shared citations between endpoint decisions are recorded only as supporting context. They do **not** establish the edge. This avoids turning two well-supported nodes into a magically evidence-supported arrow, a surprisingly common human hobby.

### Low confidence (2)
- EVA-001 → TL-002 (prerequisite_for); shared context: none
- STR-002 → RES-001 (prerequisite_for); shared context: none

### Moderate confidence (101)
- POL-003 → STR-003 (prerequisite_for); shared context: C001, C036
- STR-001 → STR-005 (prerequisite_for); shared context: none
- STR-002 → STR-005 (prerequisite_for); shared context: none
- TEC-002 → STR-005 (prerequisite_for); shared context: C035
- PRO-006 → STR-006 (prerequisite_for); shared context: C035
- EVA-001 → STR-006 (prerequisite_for); shared context: C001, C003, C035
- STR-001 → GOV-001 (prerequisite_for); shared context: C003, C013, C022, C036
- STR-002 → GOV-001 (prerequisite_for); shared context: C003, C013, C036
- POL-003 → GOV-002 (prerequisite_for); shared context: C001, C036
- POL-003 → GOV-007 (prerequisite_for); shared context: C001, C036
- STR-002 → POL-001 (prerequisite_for); shared context: C036
- STR-004 → POL-001 (prerequisite_for); shared context: C036
- GOV-001 → POL-001 (prerequisite_for); shared context: C036
- ACC-001 → POL-002 (prerequisite_for); shared context: C018, C036
- GOV-001 → POL-003 (prerequisite_for); shared context: C036
- DAT-001 → POL-005 (prerequisite_for); shared context: C025, C035, C036
- RES-008 → POL-006 (prerequisite_for); shared context: C032
- SEC-004 → POL-007 (prerequisite_for); shared context: C001, C036
- SEC-001 → POL-008 (prerequisite_for); shared context: C036
- PRO-002 → POL-009 (prerequisite_for); shared context: C025, C036
- DAT-004 → POL-009 (prerequisite_for); shared context: C025, C036
- STR-002 → DAT-001 (prerequisite_for); shared context: C036
- PRO-002 → DAT-002 (prerequisite_for); shared context: C025, C036
- PRO-002 → DAT-004 (prerequisite_for); shared context: C025, C036
- POL-005 → DAT-005 (prerequisite_for); shared context: C035, C036
- SEC-001 → DAT-006 (prerequisite_for); shared context: C035, C036
- SEC-001 → DAT-008 (prerequisite_for); shared context: C035, C036
- DAT-001 → SEC-001 (prerequisite_for); shared context: C035, C036
- TEC-002 → SEC-002 (prerequisite_for); shared context: C036
- ACC-005 → SEC-002 (prerequisite_for); shared context: C036, C037
- RES-006 → SEC-005 (prerequisite_for); shared context: C035, C036
- POL-003 → SEC-006 (prerequisite_for); shared context: C002, C036
- POL-005 → SEC-007 (prerequisite_for); shared context: C035, C036
- DAT-001 → SEC-007 (prerequisite_for); shared context: C035, C036
- STR-002 → TEC-001 (prerequisite_for); shared context: C036
- RES-002 → TEC-002 (prerequisite_for); shared context: C035
- DAT-001 → TEC-003 (prerequisite_for); shared context: C035, C036
- PRO-006 → TEC-003 (prerequisite_for); shared context: C035, C036
- PRO-006 → TEC-004 (prerequisite_for); shared context: C035
- STR-005 → TEC-005 (prerequisite_for); shared context: C035
- GOV-002 → TEC-006 (prerequisite_for); shared context: C036
- POL-003 → TEC-006 (prerequisite_for); shared context: C036
- EVA-001 → TEC-009 (prerequisite_for); shared context: C035
- GOV-004 → TEC-010 (prerequisite_for); shared context: C035
- PRO-006 → TEC-010 (prerequisite_for); shared context: C035
- STR-002 → PRO-001 (prerequisite_for); shared context: C036
- POL-003 → PRO-002 (prerequisite_for); shared context: C001, C036
- DAT-001 → PRO-002 (prerequisite_for); shared context: C025, C036
- ACC-001 → PRO-002 (prerequisite_for); shared context: C036
- STR-003 → PRO-003 (prerequisite_for); shared context: C036
- … 51 additional relationships omitted from this human-readable section; all are retained in the JSON.

### High confidence (99)
- STR-001 → STR-002 (prerequisite_for); shared context: C003, C013, C036, C038
- STR-001 → STR-003 (prerequisite_for); shared context: C003, C013, C036
- STR-002 → STR-003 (prerequisite_for); shared context: C003, C013, C036
- STR-002 → STR-004 (prerequisite_for); shared context: C003, C036
- STR-003 → STR-006 (prerequisite_for); shared context: C001, C003
- GOV-001 → GOV-002 (prerequisite_for); shared context: C003, C036
- GOV-001 → GOV-003 (prerequisite_for); shared context: C036, C037
- GOV-002 → GOV-004 (prerequisite_for); shared context: C001, C036
- GOV-001 → GOV-005 (prerequisite_for); shared context: C036, C037
- GOV-001 → GOV-006 (prerequisite_for); shared context: C003, C036
- GOV-004 → GOV-007 (prerequisite_for); shared context: C001, C036
- POL-001 → POL-002 (prerequisite_for); shared context: C036
- POL-003 → POL-004 (prerequisite_for); shared context: C001, C036
- POL-003 → POL-005 (prerequisite_for); shared context: C036
- POL-005 → POL-006 (prerequisite_for); shared context: C026, C027, C028
- POL-003 → POL-007 (prerequisite_for); shared context: C001, C002, C036
- POL-007 → POL-008 (prerequisite_for); shared context: C036
- DAT-001 → DAT-002 (prerequisite_for); shared context: C025, C035, C036
- DAT-001 → DAT-003 (prerequisite_for); shared context: C035, C036
- DAT-003 → DAT-004 (prerequisite_for); shared context: C036
- DAT-001 → DAT-005 (prerequisite_for); shared context: C035, C036
- DAT-001 → DAT-006 (prerequisite_for); shared context: C035, C036
- DAT-001 → DAT-007 (prerequisite_for); shared context: C035, C036
- DAT-001 → DAT-008 (prerequisite_for); shared context: C035, C036
- DAT-003 → DAT-009 (prerequisite_for); shared context: C035, C036
- DAT-009 → DAT-010 (prerequisite_for); shared context: C035
- SEC-001 → SEC-003 (prerequisite_for); shared context: C035, C036
- SEC-001 → SEC-004 (prerequisite_for); shared context: C035, C036
- SEC-004 → SEC-005 (prerequisite_for); shared context: C035, C036
- SEC-005 → SEC-006 (prerequisite_for); shared context: C036
- SEC-001 → SEC-007 (prerequisite_for); shared context: C035, C036
- TEC-001 → TEC-002 (prerequisite_for); shared context: C035, C036
- TEC-002 → TEC-003 (prerequisite_for); shared context: C035, C036
- TEC-002 → TEC-004 (prerequisite_for); shared context: C035
- TEC-003 → TEC-004 (prerequisite_for); shared context: C035, C037
- TEC-001 → TEC-005 (prerequisite_for); shared context: C035
- TEC-006 → TEC-007 (prerequisite_for); shared context: C035
- TEC-001 → TEC-008 (prerequisite_for); shared context: C035
- TEC-001 → TEC-009 (prerequisite_for); shared context: C035
- PRO-006 → PRO-003 (prerequisite_for); shared context: C035, C036
- PRO-002 → PRO-004 (prerequisite_for); shared context: C001, C036
- PRO-002 → PRO-005 (prerequisite_for); shared context: C036
- PEO-001 → PEO-002 (prerequisite_for); shared context: C005, C036, C038
- PEO-002 → PEO-003 (prerequisite_for); shared context: C036, C038
- PEO-001 → PEO-004 (prerequisite_for); shared context: C036
- PEO-005 → PEO-006 (prerequisite_for); shared context: C037
- PEO-001 → PEO-007 (prerequisite_for); shared context: C036, C038
- TL-001 → TL-002 (prerequisite_for); shared context: C006, C037
- TL-001 → TL-003 (prerequisite_for); shared context: C024, C036
- TL-001 → TL-004 (prerequisite_for); shared context: C037
- … 49 additional relationships omitted from this human-readable section; all are retained in the JSON.

## Required next validation work

1. Attach passage/section locations to every direct or corroborating evidence link.
2. Review decisions with `corroboration: none` first.
3. Seek independent sources for C035/C036-only decisions where the decision will drive institutional action.
4. Conduct practitioner validation of prerequisite edges before describing sequencing as validated.
5. Keep the public claim at **evidence-traceable** until those steps are complete.