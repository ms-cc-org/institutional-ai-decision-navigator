import raw from "../data/ontology.json";
import type { Decision, Ontology, Relationship } from "./types";

const stages = new Set(["Foundation", "Developing", "Advanced"]);
const relationshipTypes = new Set(["prerequisite_for", "related_to"]);
const decisionStringFields = [
  "id",
  "domain",
  "subdomain",
  "question",
  "decision_type",
  "trigger",
  "context_variables",
  "options",
  "recommendation_logic",
  "primary_risks",
  "stakeholders",
  "source_ids",
  "evidence_strength",
  "decision_output",
] as const;
const relationshipStringFields = ["from", "to", "rationale", "derivation"] as const;

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

export function parseOntology(input: unknown): Ontology {
  if (!isRecord(input)) throw new Error("Ontology must be an object");
  const value = input;
  if (
    typeof value.version !== "string" ||
    typeof value.description !== "string" ||
    !Array.isArray(value.decisions) ||
    !Array.isArray(value.relationships)
  ) {
    throw new Error("Ontology is missing required fields");
  }

  const ids = new Set<string>();
  for (const candidate of value.decisions) {
    if (!isRecord(candidate)) throw new Error("Decision must be an object");
    requireNonEmptyStrings(candidate, decisionStringFields, "Decision");
    if (typeof candidate.maturity_stage !== "string" || !stages.has(candidate.maturity_stage)) {
      throw new Error(`Invalid maturity stage for decision ${candidate.id}`);
    }
    const decision = candidate as unknown as Decision;
    if (ids.has(decision.id)) throw new Error(`Duplicate decision ID: ${decision.id}`);
    ids.add(decision.id);
  }

  for (const candidate of value.relationships) {
    if (!isRecord(candidate)) throw new Error("Relationship must be an object");
    requireNonEmptyStrings(candidate, relationshipStringFields, "Relationship");
    if (typeof candidate.relationship !== "string" || !relationshipTypes.has(candidate.relationship)) {
      throw new Error(`Invalid relationship type: ${String(candidate.relationship)}`);
    }
    const relation = candidate as unknown as Relationship;
    if (!ids.has(relation.from) || !ids.has(relation.to)) {
      throw new Error(`Invalid relationship endpoint: ${relation.from} → ${relation.to}`);
    }
  }

  return {
    version: value.version,
    description: value.description,
    decisions: value.decisions as Decision[],
    relationships: value.relationships as Relationship[],
  };
}
export const ontology = parseOntology(raw);
export const decisionsById = new Map(ontology.decisions.map((decision) => [decision.id, decision]));
export const splitField = (value: string) => value.split(/\s*[;|]\s*/).filter(Boolean);
