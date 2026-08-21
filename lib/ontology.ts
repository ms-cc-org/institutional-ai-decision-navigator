import raw from "../data/ontology.json";
import type { Decision, Ontology, Relationship, Source } from "./types";

const stages = new Set(["Foundation", "Developing", "Advanced"]);
const relationshipTypes = new Set(["prerequisite_for", "related_to"]);
const decisionCategories = new Set([
  "STRATEGY",
  "GOVERNANCE",
  "POLICY_RISK_COMPLIANCE",
  "DATA_PRIVACY",
  "SECURITY_IDENTITY",
  "PROCUREMENT_VENDOR",
  "TECHNOLOGY_INFRASTRUCTURE",
  "WORKFORCE_SUPPORT",
  "TEACHING_LEARNING",
  "RESEARCH",
  "ADMINISTRATIVE_OPERATIONS",
  "ACCESSIBILITY_EQUITY",
  "EVALUATION_LIFECYCLE",
]);
const sourceSupportTypes = new Set(["direct", "synthesized", "contextual"]);
const corroborationTypes = new Set(["multiple_independent_sources", "partial", "none"]);
const profileSpecificities = new Set(["specific", "general", "mixed"]);
const validationStatuses = new Set([
  "not_validated",
  "practitioner_supported",
  "mixed",
  "challenged",
]);
const linkSupportTypes = new Set(["direct", "corroborating", "contextual", "researcher_synthesis"]);
const linkSpecificities = new Set(["specific", "general"]);
const provenanceBases = new Set(["source_explicit", "source_synthesized", "researcher_inferred"]);
const provenanceConfidences = new Set(["high", "moderate", "low"]);
const sourceVerificationStatuses = new Set([
  "verified",
  "verified_from_user_source",
  "verified_title_date",
  "verified_with_scope_correction",
  "verified_with_year_correction",
]);
const decisionStringFields = [
  "id",
  "domain",
  "subdomain",
  "question",
  "decision_type",
  "decision_type_original",
  "trigger",
  "context_variables",
  "options",
  "recommendation_logic",
  "primary_risks",
  "stakeholders",
  "source_ids",
  "decision_output",
] as const;
const sourceNullableStringFields = [
  "url",
  "notes",
] as const;
const sourceStringFields = ["id", "title", "publisher", "source_type", "geography", "verification"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireNonEmptyStrings(
  value: Record<string, unknown>,
  fields: readonly string[],
  label: string,
) {
  for (const field of fields) {
    if (typeof value[field] !== "string" || value[field].trim() === "") {
      throw new Error(`${label} has an invalid ${field}`);
    }
  }
}

function requireEnum(
  value: unknown,
  allowed: ReadonlySet<string>,
  label: string,
): asserts value is string {
  if (typeof value !== "string" || !allowed.has(value)) {
    throw new Error(`${label} has invalid value: ${String(value)}`);
  }
}

const splitSourceIds = (value: string) => value.split(/\s*[;|]\s*/).filter(Boolean);

function parseSources(candidates: unknown[]): { sources: Source[]; ids: Set<string> } {
  const ids = new Set<string>();
  for (const candidate of candidates) {
    if (!isRecord(candidate)) throw new Error("Source must be an object");
    requireNonEmptyStrings(candidate, sourceStringFields, "Source");
    requireEnum(candidate.verification, sourceVerificationStatuses, `Source ${candidate.id} verification`);
    for (const field of sourceNullableStringFields) {
      if (candidate[field] !== undefined && candidate[field] !== null && typeof candidate[field] !== "string") {
        throw new Error(`Source ${candidate.id} has an invalid ${field}`);
      }
    }
    if (candidate.year !== null && (!Number.isInteger(candidate.year) || Number(candidate.year) < 0)) {
      throw new Error(`Source ${candidate.id} has an invalid year`);
    }
    const id = candidate.id as string;
    if (ids.has(id)) throw new Error(`Duplicate source ID: ${id}`);
    ids.add(id);
  }
  return { sources: candidates as Source[], ids };
}

function validateEvidence(
  candidate: Record<string, unknown>,
  sourceRegistryIds: Set<string>,
) {
  if (!isRecord(candidate.evidence_profile)) {
    throw new Error(`Decision ${candidate.id} has an invalid evidence_profile`);
  }
  const profile = candidate.evidence_profile;
  requireEnum(profile.source_support, sourceSupportTypes, `Decision ${candidate.id} source_support`);
  requireEnum(profile.corroboration, corroborationTypes, `Decision ${candidate.id} corroboration`);
  requireEnum(profile.specificity, profileSpecificities, `Decision ${candidate.id} specificity`);
  requireEnum(
    profile.validation_status,
    validationStatuses,
    `Decision ${candidate.id} validation_status`,
  );
  requireNonEmptyStrings(profile, ["notes"], `Decision ${candidate.id} evidence_profile`);

  const sourceIds = [...new Set(splitSourceIds(candidate.source_ids as string))];
  if (!Number.isInteger(profile.evidence_breadth) || profile.evidence_breadth !== sourceIds.length) {
    throw new Error(`Decision ${candidate.id} has inconsistent evidence_breadth`);
  }
  for (const sourceId of sourceIds) {
    if (!sourceRegistryIds.has(sourceId)) {
      throw new Error(`Decision ${candidate.id} references unknown source ${sourceId}`);
    }
  }

  if (!Array.isArray(candidate.evidence_links) || candidate.evidence_links.length !== sourceIds.length) {
    throw new Error(`Decision ${candidate.id} has inconsistent evidence_links`);
  }
  const linkIds = new Set<string>();
  for (const link of candidate.evidence_links) {
    if (!isRecord(link)) throw new Error(`Decision ${candidate.id} has an invalid evidence link`);
    requireNonEmptyStrings(
      link,
      ["source_id", "claim_supported", "notes"],
      `Decision ${candidate.id} evidence link`,
    );
    requireEnum(link.support_type, linkSupportTypes, `Decision ${candidate.id} evidence support_type`);
    requireEnum(link.specificity, linkSpecificities, `Decision ${candidate.id} evidence specificity`);
    if (link.source_location !== null && typeof link.source_location !== "string") {
      throw new Error(`Decision ${candidate.id} has an invalid source_location`);
    }
    const sourceId = link.source_id as string;
    if (!sourceRegistryIds.has(sourceId)) {
      throw new Error(`Decision ${candidate.id} evidence link references unknown source ${sourceId}`);
    }
    if (linkIds.has(sourceId)) {
      throw new Error(`Decision ${candidate.id} has duplicate evidence link ${sourceId}`);
    }
    linkIds.add(sourceId);
  }
  if (sourceIds.some((sourceId) => !linkIds.has(sourceId))) {
    throw new Error(`Decision ${candidate.id} evidence links do not match source_ids`);
  }
}

function validateRelationship(
  candidate: Record<string, unknown>,
  decisionIds: Set<string>,
  sourceIds: Set<string>,
) {
  requireNonEmptyStrings(candidate, ["from", "to", "rationale"], "Relationship");
  requireEnum(candidate.relationship, relationshipTypes, "Relationship type");
  if (!decisionIds.has(candidate.from as string) || !decisionIds.has(candidate.to as string)) {
    throw new Error(`Invalid relationship endpoint: ${candidate.from} → ${candidate.to}`);
  }
  if (!isRecord(candidate.provenance)) throw new Error("Relationship has invalid provenance");
  const provenance = candidate.provenance;
  requireEnum(provenance.basis, provenanceBases, "Relationship provenance basis");
  requireEnum(provenance.confidence, provenanceConfidences, "Relationship provenance confidence");
  requireNonEmptyStrings(provenance, ["notes"], "Relationship provenance");
  if (provenance.validation_status !== "not_validated") {
    throw new Error("Relationship provenance has invalid validation_status");
  }
  if (!Array.isArray(provenance.supporting_source_ids)) {
    throw new Error("Relationship provenance has invalid supporting_source_ids");
  }
  for (const sourceId of provenance.supporting_source_ids) {
    if (typeof sourceId !== "string" || !sourceIds.has(sourceId)) {
      throw new Error(`Relationship provenance references unknown source ${String(sourceId)}`);
    }
  }
}

export function parseOntology(input: unknown): Ontology {
  if (!isRecord(input)) throw new Error("Ontology must be an object");
  const value = input;
  if (
    value.version !== "0.3.3" ||
    typeof value.description !== "string" ||
    !Array.isArray(value.sources) ||
    !Array.isArray(value.decisions) ||
    !Array.isArray(value.relationships)
  ) {
    throw new Error("Ontology is missing required v0.3.3 fields");
  }

  const sourceRegistry = parseSources(value.sources);
  const decisionIds = new Set<string>();
  for (const candidate of value.decisions) {
    if (!isRecord(candidate)) throw new Error("Decision must be an object");
    requireNonEmptyStrings(candidate, decisionStringFields, "Decision");
    requireEnum(candidate.decision_category, decisionCategories, `Decision ${candidate.id} category`);
    requireEnum(candidate.maturity_stage, stages, `Decision ${candidate.id} maturity_stage`);
    validateEvidence(candidate, sourceRegistry.ids);
    const id = candidate.id as string;
    if (decisionIds.has(id)) throw new Error(`Duplicate decision ID: ${id}`);
    decisionIds.add(id);
  }

  for (const candidate of value.relationships) {
    if (!isRecord(candidate)) throw new Error("Relationship must be an object");
    validateRelationship(candidate, decisionIds, sourceRegistry.ids);
  }

  return {
    version: "0.3.3",
    description: value.description,
    sources: sourceRegistry.sources,
    decisions: value.decisions as Decision[],
    relationships: value.relationships as Relationship[],
  };
}

export const ontology = parseOntology(raw);
export const decisionsById = new Map(ontology.decisions.map((decision) => [decision.id, decision]));
export const sourcesById = new Map(ontology.sources.map((source) => [source.id, source]));
export const splitField = splitSourceIds;
export const isC035C036OnlyDecision = (decision: Decision) => {
  const sourceIds = new Set(splitSourceIds(decision.source_ids));
  return sourceIds.size > 0 && [...sourceIds].every((sourceId) => sourceId === "C035" || sourceId === "C036");
};
