import Link from "next/link";
import { notFound } from "next/navigation";
import { decisionsById, ontology, splitField } from "@/lib/ontology";

export function generateStaticParams() {
  return ontology.decisions.map((decision) => ({ id: decision.id }));
}

export default async function DecisionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decision = decisionsById.get(id);
  if (!decision) notFound();

  const prerequisites = ontology.relationships
    .filter((relationship) => relationship.relationship === "prerequisite_for" && relationship.to === id)
    .map((relationship) => decisionsById.get(relationship.from)!)
    .filter(Boolean);
  const relatedIds = new Set(
    ontology.relationships
      .filter((relationship) => relationship.relationship === "related_to" && (relationship.from === id || relationship.to === id))
      .map((relationship) => relationship.from === id ? relationship.to : relationship.from),
  );
  const downstream = ontology.relationships
    .filter((relationship) => relationship.relationship === "prerequisite_for" && relationship.from === id)
    .map((relationship) => decisionsById.get(relationship.to)!)
    .filter(Boolean);
  const related = [...relatedIds].map((relatedId) => decisionsById.get(relatedId)!).filter(Boolean);
  const userRows = [
    ["Options", decision.options],
    ["Risks to manage", decision.primary_risks],
    ["People to involve", decision.stakeholders],
    ["Expected output", decision.decision_output],
  ];

  return (
    <main className="detail-page">
      <Link href="/roadmap" className="text-link">← Back to priorities</Link>
      <header className="detail-head user-first">
        <p className="domain">{decision.domain} / {decision.subdomain}</p>
        <h1>{decision.question}</h1>
      </header>

      <section className="why-matters">
        <p className="step">Why it matters</p>
        <p>{decision.recommendation_logic}</p>
        <p className="risk">Expected result: {decision.decision_output}</p>
      </section>

      <section className="detail-grid user-detail-grid">
        {userRows.map(([label, value]) => <div key={label}><h2>{label}</h2><p>{value}</p></div>)}
      </section>

      <section className="evidence-section">
        <h2>Evidence behind this decision</h2>
        <p>The ontology identifies {splitField(decision.source_ids).length} supporting source references.</p>
        <p className="technical-line">Source references: {splitField(decision.source_ids).join(" · ")}</p>
      </section>

      <section className="relations">
        <div>
          <h2>Decisions to resolve first</h2>
          {prerequisites.length ? prerequisites.map((item) => <Link key={item.id} href={`/decisions/${item.id}`}><span>{item.question}</span><b>→</b></Link>) : <p>No prerequisite relationship is defined.</p>}
        </div>
        <div>
          <h2>Related and downstream decisions</h2>
          {[...related, ...downstream].filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index).map((item) => <Link key={item.id} href={`/decisions/${item.id}`}><span>{item.question}</span><b>→</b></Link>)}
          {related.length === 0 && downstream.length === 0 && <p>No related or downstream decisions are defined.</p>}
        </div>
      </section>

      <details className="technical-metadata">
        <summary>Technical metadata</summary>
        <dl>
          <div><dt>Ontology ID</dt><dd>{decision.id}</dd></div>
          <div><dt>Maturity stage</dt><dd>{decision.maturity_stage}</dd></div>
          <div><dt>Decision type</dt><dd>{decision.decision_type}</dd></div>
          <div><dt>Raw trigger</dt><dd>{decision.trigger}</dd></div>
          <div><dt>Context variables</dt><dd>{decision.context_variables}</dd></div>
          <div><dt>Evidence strength</dt><dd>{decision.evidence_strength}</dd></div>
          <div><dt>Source IDs</dt><dd>{decision.source_ids}</dd></div>
        </dl>
      </details>
    </main>
  );
}
