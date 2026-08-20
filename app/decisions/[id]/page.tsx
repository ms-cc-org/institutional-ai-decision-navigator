import Link from "next/link";
import { notFound } from "next/navigation";
import { EvidenceDetail } from "@/components/EvidenceDisclosure";
import { RelationshipProvenanceNote } from "@/components/RelationshipProvenanceNote";
import { WorkingGroupReview } from "@/components/WorkingGroupReview";
import { validationStatusLabel } from "@/lib/evidence-presentation";
import { decisionsById, ontology } from "@/lib/ontology";

export function generateStaticParams() {
  return ontology.decisions.map((decision) => ({ id: decision.id }));
}

export default async function DecisionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decision = decisionsById.get(id);
  if (!decision) notFound();

  const prerequisites = ontology.relationships
    .filter((relationship) => relationship.relationship === "prerequisite_for" && relationship.to === id)
    .map((relationship) => ({ relationship, decision: decisionsById.get(relationship.from)! }))
    .filter((connection) => Boolean(connection.decision));
  const related = ontology.relationships
    .filter((relationship) => relationship.relationship === "related_to" && (relationship.from === id || relationship.to === id))
    .map((relationship) => ({
      relationship,
      decision: decisionsById.get(relationship.from === id ? relationship.to : relationship.from)!,
    }))
    .filter((connection) => Boolean(connection.decision));
  const downstream = ontology.relationships
    .filter((relationship) => relationship.relationship === "prerequisite_for" && relationship.from === id)
    .map((relationship) => ({ relationship, decision: decisionsById.get(relationship.to)! }))
    .filter((connection) => Boolean(connection.decision));
  const prerequisiteIds = new Set(prerequisites.map((connection) => connection.decision.id));
  const otherConnections = [...related, ...downstream].filter(
    (connection, index, connections) =>
      !prerequisiteIds.has(connection.decision.id)
      && connections.findIndex((candidate) => candidate.decision.id === connection.decision.id) === index,
  );
  const userRows = [
    ["Options", decision.options],
    ["Risks to manage", decision.primary_risks],
    ["People to involve", decision.stakeholders],
    ["Expected output", decision.decision_output],
  ];

  return (
    <main className="detail-page">
      <nav className="detail-backlinks" aria-label="Decision navigation"><Link href="/explore" className="text-link">← Explore decisions</Link><Link href="/roadmap" className="text-link">View current priorities</Link></nav>
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

      <EvidenceDetail decision={decision} />

      <section className="relations">
        <div>
          <h2>Decisions to resolve first</h2>
          {prerequisites.length ? prerequisites.map(({ decision: item, relationship }) => (
            <div className="relation-item" key={item.id}>
              <Link href={`/decisions/${item.id}`}><span>{item.question}</span><b>→</b></Link>
              <RelationshipProvenanceNote relationship={relationship} />
            </div>
          )) : <p>No prerequisite relationship is defined.</p>}
        </div>
        <div>
          <h2>Related and downstream decisions</h2>
          {otherConnections.map(({ decision: item, relationship }) => (
            <div className="relation-item" key={item.id}>
              <Link href={`/decisions/${item.id}`}><span>{item.question}</span><b>→</b></Link>
              <RelationshipProvenanceNote relationship={relationship} />
            </div>
          ))}
          {otherConnections.length === 0 && <p>No related or downstream decisions are defined.</p>}
        </div>
      </section>

      <WorkingGroupReview decision={decision} prerequisiteRelationships={prerequisites.map(({ relationship }) => relationship)} />

      <details className="technical-metadata">
        <summary>Technical metadata</summary>
        <dl>
          <div><dt>Ontology ID</dt><dd>{decision.id}</dd></div>
          <div><dt>Maturity stage</dt><dd>{decision.maturity_stage}</dd></div>
          <div><dt>Decision type</dt><dd>{decision.decision_type}</dd></div>
          <div><dt>Decision category</dt><dd>{decision.decision_category}</dd></div>
          <div><dt>Raw trigger</dt><dd>{decision.trigger}</dd></div>
          <div><dt>Context variables</dt><dd>{decision.context_variables}</dd></div>
          <div><dt>Source support</dt><dd>{decision.evidence_profile.source_support}</dd></div>
          <div><dt>Corroboration</dt><dd>{decision.evidence_profile.corroboration}</dd></div>
          <div><dt>Evidence breadth</dt><dd>{decision.evidence_profile.evidence_breadth}</dd></div>
          <div><dt>Specificity</dt><dd>{decision.evidence_profile.specificity}</dd></div>
          <div><dt>Validation status</dt><dd>{validationStatusLabel(decision.evidence_profile.validation_status)}</dd></div>
          <div><dt>Source IDs</dt><dd>{decision.source_ids}</dd></div>
        </dl>
      </details>
    </main>
  );
}
