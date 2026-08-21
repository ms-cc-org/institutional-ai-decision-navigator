# Ontology v0.3.3 Evidence and Provenance Audit

## Release scope

Ontology v0.3.3 is a **health-data, privacy, and compliance evidence enrichment**, not a practitioner-validation release. It retains 99 decisions and 202 relationships, expands the source registry from 27 to 33 records, and adds 26 assertion-level evidence links across 15 existing decisions. No decision or relationship was added or removed.

New verified source records are C039–C044: two U.S. HHS Office for Civil Rights guidance documents, three peer-reviewed health-data/LLM publications, and one healthcare RAG preprint review. The preprint is used only as corroborating or contextual support.

## Evidence coverage

| Measure | Count | Percent of decisions |
|---|---:|---:|
| Direct source support | 79 | 79.8% |
| Synthesized source support | 17 | 17.2% |
| Contextual source support | 3 | 3.0% |
| Multiple independent sources | 34 | 34.3% |
| Partial corroboration | 37 | 37.4% |
| No independent corroboration | 28 | 28.3% |
| Not practitioner validated | 99 | 100% |

The 15 enriched decisions are STR-002, POL-005, POL-009, DAT-001, DAT-002, DAT-005, DAT-006, DAT-007, DAT-008, SEC-001, SEC-007, TEC-001, TEC-003, PRO-002, and EVA-002. Eight decisions moved into `multiple_independent_sources`, four moved from no corroboration to partial corroboration, and three gained evidence without changing corroboration. Source-support classifications did not change.

DAT-002 now has seven sources and four new decision-level links: authoritative HHS support for de-identification and cloud business-associate requirements, plus two independent reviews corroborating the need to verify protections and choose context-sensitive architectures.

## Passage-level traceability

There are 270 evidence links. Twenty-six (9.6%) have an explicit `source_location`; 244 (90.4%) still have no passage-level location. The newly added links improve claim-level traceability, but the older corpus remains predominantly document-level.

## Dominant-source concentration

C035 and/or C036 appear in 93 of 99 decisions (93.9%). Twenty-seven decisions (27.3%) still rely exclusively on C035 and/or C036. This is an improvement from 34 such decisions in v0.3.2, but concentration remains high. The ontology is evidence-traceable; the source distribution is not broad enough, and practitioner validation is absent, to treat it as comprehensively validated.

## Relationship provenance

All 202 relationships remain `researcher_inferred`: 99 high-confidence, 101 moderate-confidence, and 2 low-confidence. New citations support decision nodes, not the arrows between them. No relationship was upgraded to source-explicit or practitioner validated.

## Conservative mapping decisions

The review rejected associations where the source did not support a sufficiently specific decision claim:

- C039 → DAT-003 or SEC-007: de-identification guidance does not directly establish institutional ownership/permission or isolated-environment requirements.
- C040 → SEC-007: cloud business-associate obligations do not by themselves establish isolation.
- C041/C042 → RES-004: privacy architecture context is not direct support for model-selection strategy.
- C043 → DAT-006, DAT-007, SEC-004, or SEC-007: the preprint did not adequately establish platform approval, retention, logging, or isolation claims.
- C044 → EVA-001 or PEO-002: the hospital survey does not directly establish success metrics or training priorities. It was not attached to governance decisions.

## RAG lifecycle review note

Existing decisions already address data storage, transfer, retrieval/access, logging, retention, architecture, and security controls. A future human review should assess whether those decisions adequately represent the retrieval-augmented generation lifecycle. Mention of RAG in C043 is not sufficient reason to create a new ontology node.

## Methodological interpretation

Evidence enrichment does not equal validation. v0.3.3 improves independent corroboration for a focused health-data subset and gives every new link an explicit source location. It does not resolve the dominant-source concentration, locate passages for 244 legacy links, validate any decision with practitioners, or validate any relationship. Priority human work is therefore: passage-level review of legacy evidence links; independent-source review of the 28 decisions with no corroboration, especially the 27 relying only on C035/C036; and expert review of the 103 moderate- or low-confidence relationships.
