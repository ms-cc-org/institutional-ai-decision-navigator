import type { DecisionFeedback, RelationshipFeedback, ValidatorProfile } from "./types";
import { institutionConfig } from "../config/institution";

export const VALIDATOR_PROFILE_KEY = "mscc-pilot-validator-profile";
export const DECISION_FEEDBACK_KEY = "mscc-pilot-decision-feedback";
export const RELATIONSHIP_FEEDBACK_KEY = "mscc-pilot-relationship-feedback";
export const PILOT_STORAGE_EVENT = "mscc-pilot-storage";

export interface FeedbackCollection<T> { version: 1; items: Record<string, T> }

export const emptyValidatorProfile: ValidatorProfile = { version: 1, role: "", institutionType: "", institutionSize: "" };

export function parseValidatorProfile(value: string | null): ValidatorProfile {
  if (!value) return emptyValidatorProfile;
  try {
    const parsed = JSON.parse(value) as ValidatorProfile;
    return parsed.version === 1 ? parsed : emptyValidatorProfile;
  } catch { return emptyValidatorProfile; }
}

export function parseFeedbackCollection<T>(value: string | null): FeedbackCollection<T> {
  if (!value) return { version: 1, items: {} };
  try {
    const parsed = JSON.parse(value) as FeedbackCollection<T>;
    return parsed.version === 1 && parsed.items && typeof parsed.items === "object" ? parsed : { version: 1, items: {} };
  } catch { return { version: 1, items: {} }; }
}

export function relationshipFeedbackId(from: string, to: string) { return `${from}->${to}`; }

export function saveValidatorProfile(storage: Pick<Storage, "setItem">, profile: ValidatorProfile) {
  storage.setItem(VALIDATOR_PROFILE_KEY, JSON.stringify(profile));
}

export function saveDecisionFeedback(storage: Pick<Storage, "getItem" | "setItem">, feedback: DecisionFeedback) {
  const collection = parseFeedbackCollection<DecisionFeedback>(storage.getItem(DECISION_FEEDBACK_KEY));
  collection.items[feedback.decisionId] = feedback;
  storage.setItem(DECISION_FEEDBACK_KEY, JSON.stringify(collection));
}

export function saveRelationshipFeedback(storage: Pick<Storage, "getItem" | "setItem">, feedback: RelationshipFeedback) {
  const collection = parseFeedbackCollection<RelationshipFeedback>(storage.getItem(RELATIONSHIP_FEEDBACK_KEY));
  collection.items[relationshipFeedbackId(feedback.from, feedback.to)] = feedback;
  storage.setItem(RELATIONSHIP_FEEDBACK_KEY, JSON.stringify(collection));
}

export function buildValidationExport(
  profile: ValidatorProfile,
  decisions: Record<string, DecisionFeedback>,
  relationships: Record<string, RelationshipFeedback>,
  ontologyVersion: string,
  generatedAt = new Date(),
) {
  const pilotName = institutionConfig.deploymentMode === "mscc_reference"
    ? `${institutionConfig.shortName} ${institutionConfig.productName}`
    : institutionConfig.productName;
  return {
    schema_version: 1,
    pilot: pilotName,
    deployment_mode: institutionConfig.deploymentMode,
    institution: institutionConfig.institutionName,
    local_config_version: institutionConfig.configVersion,
    ontology_version: ontologyVersion,
    exported_at: generatedAt.toISOString(),
    storage_notice: "Collected and exported from this device; not centrally submitted.",
    validator_context: profile,
    decisions_reviewed: Object.values(decisions),
    relationship_reviews: Object.values(relationships),
  };
}
