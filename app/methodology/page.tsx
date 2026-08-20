import Link from "next/link";
import { CANONICAL_REPOSITORY_URL } from "@/lib/site";

const auditUrl = `${CANONICAL_REPOSITORY_URL}/blob/main/docs/EVIDENCE_AUDIT_v0.3.2.md`;

export default function MethodologyPage() {
  return (
    <main className="methodology-page">
      <header>
        <p className="eyebrow">About the MS-CC pilot · Ontology v0.3.2</p>
        <h1>An evidence-traceable institutional AI decision-support tool.</h1>
        <p className="lede">The navigator helps institutions identify decisions, sequence action, and inspect the evidence and synthesis behind the model. It does not assign an overall readiness or maturity score.</p>
      </header>

      <section className="methodology-positioning">
        <div><h2>What this is</h2><p>A structured decision navigator built from normalized guidance, modeled relationships, observable institutional context, and deterministic recommendation rules.</p></div>
        <div><h2>What this is not</h2><ul><li>Not an AI maturity score</li><li>Not legal advice</li><li>Not a replacement for institutional governance</li><li>Not an LLM-generated recommendation system</li><li>Not yet a practitioner-validated ontology</li></ul></div>
      </section>

      <section className="method-flow" aria-labelledby="method-flow-heading"><p className="eyebrow">Conceptual method</p><h2 id="method-flow-heading">From guidance to institutional action</h2><p>Existing guidance and evidence → normalized institutional decisions → modeled decision relationships → institutional context → deterministic recommendations → evidence provenance → practitioner validation.</p><p>Some normalized decisions and all current relationships involve researcher synthesis. Structural confidence is not the same as practitioner or source validation.</p></section>

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
        <div>
          <h2>Researcher synthesis</h2>
          <p>Normalization turns varied literature and practitioner guidance into consistent institutional decision statements. Not every formulation is directly stated in a source, and synthesis is represented rather than hidden.</p>
        </div>
        <div>
          <h2>Derived from vs. supported by</h2>
          <p>Ontology v0.3.2 does not contain a <code>derivation_sources</code> field. The pilot therefore does not claim which sources originally formed each normalized decision beyond the evidence links actually present.</p>
        </div>
      </section>

      <section className="methodology-audit"><p className="eyebrow">Practitioner validation</p><h2>MS-CC is inviting working-group review.</h2><p>Decision detail pages include an optional, collapsed review form. Feedback is saved only on the reviewer’s device and can be exported as JSON for manual sharing. It is not centrally submitted.</p></section>

      <section className="methodology-audit">
        <p className="eyebrow">Authoritative release audit</p>
        <h2>Review the complete v0.3.2 evidence audit</h2>
        <p>The supplied audit documents scope review, dominant-source concentration, decisions without independent corroboration, relationship confidence, and required passage-level and practitioner validation work.</p>
        <Link href={auditUrl}>View the v0.3.2 evidence audit on GitHub ↗</Link>
      </section>
    </main>
  );
}
