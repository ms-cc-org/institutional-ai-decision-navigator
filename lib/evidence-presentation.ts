import type { Decision, EvidenceLink, Relationship, Source, ValidationStatus } from "./types";

export const sourceSupportLabel = (support: Decision["evidence_profile"]["source_support"]) => ({
  direct: "Direct",
  synthesized: "Synthesized",
  contextual: "Contextual",
})[support];

export const sourceSupportExplanation = (support: Decision["evidence_profile"]["source_support"]) => ({
  direct: "The associated material directly addresses this decision within its reviewed scope.",
  synthesized: "This decision synthesizes guidance across associated source material.",
  contextual: "The associated material provides context but does not directly establish this decision.",
})[support];

export const corroborationLabel = (corroboration: Decision["evidence_profile"]["corroboration"]) => ({
  multiple_independent_sources: "Multiple independent sources",
  partial: "Partial corroboration",
  none: "No independent corroboration",
})[corroboration];

export const corroborationExplanation = (corroboration: Decision["evidence_profile"]["corroboration"]) => ({
  multiple_independent_sources: "Multiple independent publishers outside the dominant synthesis sources corroborate this decision.",
  partial: "At least one independent source provides corroboration, but independent support is limited.",
  none: "No independent source corroboration is recorded for this decision.",
})[corroboration];

export const supportTypeLabel = (type: EvidenceLink["support_type"]) => ({
  direct: "Direct support",
  corroborating: "Corroborating support",
  contextual: "Contextual support",
  researcher_synthesis: "Researcher synthesis",
})[type];

export const specificityLabel = (specificity: EvidenceLink["specificity"] | Decision["evidence_profile"]["specificity"]) => ({
  specific: "Specific",
  general: "General",
  mixed: "Mixed",
})[specificity];

export const validationStatusLabel = (status: ValidationStatus) => ({
  not_validated: "Not yet practitioner validated",
  practitioner_supported: "Practitioner supported",
  mixed: "Mixed practitioner feedback",
  challenged: "Challenged during practitioner review",
})[status];

export const sourceTitle = (source: Source | undefined, index: number) =>
  source?.title ?? `Source record ${index + 1} — title unavailable`;

export const sourcePublisher = (source: Source | undefined) =>
  source?.publisher ?? "Publisher unavailable";

export const relationshipTypeLabel = (type: Relationship["relationship"]) => ({
  prerequisite_for: "Prerequisite for",
  related_to: "Related to",
})[type];

export const relationshipBasisLabel = (basis: Relationship["provenance"]["basis"]) => ({
  source_explicit: "Source explicit",
  source_synthesized: "Source synthesized",
  researcher_inferred: "Researcher inferred",
})[basis];

export const confidenceLabel = (confidence: Relationship["provenance"]["confidence"]) => ({
  high: "High confidence",
  moderate: "Moderate confidence",
  low: "Low confidence",
})[confidence];

export const relationshipProvenanceText = (relationship: Relationship) => {
  if (relationship.provenance.basis === "researcher_inferred") {
    return "Dependency inferred during ontology synthesis; not yet practitioner validated.";
  }
  if (relationship.provenance.basis === "source_synthesized") {
    return "Dependency synthesized across source material; not yet practitioner validated.";
  }
  return "Dependency is explicit in associated source material; not yet practitioner validated.";
};
