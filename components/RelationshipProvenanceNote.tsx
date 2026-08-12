import {
  confidenceLabel,
  relationshipBasisLabel,
  relationshipProvenanceText,
  relationshipTypeLabel,
  validationStatusLabel,
} from "../lib/evidence-presentation";
import type { Relationship } from "../lib/types";

export function RelationshipProvenanceNote({ relationship }: { relationship: Relationship }) {
  return (
    <div className="relationship-provenance">
      <p>{relationshipProvenanceText(relationship)}</p>
      <dl>
        <div><dt>Relationship</dt><dd>{relationshipTypeLabel(relationship.relationship)}</dd></div>
        <div><dt>Basis</dt><dd>{relationshipBasisLabel(relationship.provenance.basis)}</dd></div>
        <div><dt>Confidence</dt><dd>{confidenceLabel(relationship.provenance.confidence)}</dd></div>
        <div><dt>Validation</dt><dd>{validationStatusLabel(relationship.provenance.validation_status)}</dd></div>
      </dl>
      {relationship.provenance.supporting_source_ids.length > 0 && (
        <p>These sources provide context for the connected decisions; they do not independently validate the relationship itself.</p>
      )}
    </div>
  );
}
