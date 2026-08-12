import Link from "next/link";

const auditUrl = "https://github.com/amanda-tan/institutional-ai-decision-tool/blob/main/docs/EVIDENCE_AUDIT_v0.3.2.md";

export default function MethodologyPage() {
  return (
    <main className="methodology-page">
      <header>
        <p className="eyebrow">Ontology v0.3.2 methodology</p>
        <h1>Evidence-traceable, with support and corroboration kept separate.</h1>
        <p className="lede">A decision can be directly supported by a source without being independently corroborated. The navigator represents those as distinct evidence dimensions and does not combine them into a score.</p>
      </header>

      <section className="audit-findings" aria-label="Headline evidence audit findings">
        <div><strong>79</strong><span>Directly source-supported decisions</span></div>
        <div><strong>26</strong><span>With multiple independent sources</span></div>
        <div><strong>35</strong><span>With no independent corroboration</span></div>
        <div><strong>202/202</strong><span>Researcher-inferred relationships</span></div>
      </section>

      <section className="methodology-grid">
        <div>
          <h2>Source support</h2>
          <p>Source support records how directly the cited material addresses a decision: direct, synthesized, or contextual. Direct support is not the same as independent corroboration.</p>
        </div>
        <div>
          <h2>Independent corroboration</h2>
          <p>Corroboration records whether independent publishers outside the two dominant synthesis sources also support the decision: multiple independent sources, partial corroboration, or none.</p>
        </div>
        <div>
          <h2>Evidence specificity</h2>
          <p>Specificity indicates whether evidence is specific, mixed, or general. Evidence links also state the particular claim represented. Passage-level verification is still required wherever source location is null.</p>
        </div>
        <div>
          <h2>Validation status</h2>
          <p>The ontology is evidence-traceable, but it is not yet practitioner validated. Validation status remains separate from source support and corroboration.</p>
        </div>
        <div>
          <h2>Relationship provenance</h2>
          <p>All 202 relationships remain researcher inferred. Confidence reflects structural review, not source validation: 99 are high confidence, 101 moderate, and 2 low.</p>
        </div>
        <div>
          <h2>Shared source context</h2>
          <p>Sources shared by connected decisions provide context for the endpoint topics. They do not independently validate the relationship itself.</p>
        </div>
      </section>

      <section className="methodology-audit">
        <p className="eyebrow">Authoritative release audit</p>
        <h2>Review the complete v0.3.2 evidence audit</h2>
        <p>The supplied audit documents scope review, dominant-source concentration, decisions without independent corroboration, relationship confidence, and required passage-level and practitioner validation work.</p>
        <Link href={auditUrl}>View the v0.3.2 evidence audit on GitHub ↗</Link>
      </section>
    </main>
  );
}
