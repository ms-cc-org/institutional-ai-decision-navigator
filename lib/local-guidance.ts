import rawLocalGuidance from "../data/local/institution-guidance.json";
import { decisionsById } from "./ontology";

export type LocalGuidanceOrigin = "institution_local";

export interface LocalPolicyReference {
  label: string;
  url: string;
}

export interface LocalGuidanceItem {
  id: string;
  origin: LocalGuidanceOrigin;
  decision_ids: string[];
  title: string;
  publisher: string;
  url: string | null;
  guidance_type: string;
  notes?: string;
  localNotes?: string;
  localAction?: string;
  localOwner?: string;
  localContact?: string;
  localPolicyReferences?: LocalPolicyReference[];
}

export interface LocalGuidanceRegistry {
  version: 1;
  institution_name: string;
  items: LocalGuidanceItem[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const requireText = (value: unknown, label: string) => {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} must be a non-empty string`);
};

export function parseLocalGuidanceRegistry(input: unknown): LocalGuidanceRegistry {
  if (!isRecord(input) || input.version !== 1 || !Array.isArray(input.items)) {
    throw new Error("Local guidance must be a version 1 registry");
  }
  requireText(input.institution_name, "Local guidance institution_name");
  const ids = new Set<string>();
  for (const candidate of input.items) {
    if (!isRecord(candidate)) throw new Error("Local guidance item must be an object");
    for (const field of ["id", "title", "publisher", "guidance_type"] as const) requireText(candidate[field], `Local guidance ${field}`);
    if (candidate.origin !== "institution_local") throw new Error(`Local guidance ${String(candidate.id)} must use origin institution_local`);
    if (ids.has(candidate.id as string)) throw new Error(`Duplicate local guidance ID: ${String(candidate.id)}`);
    ids.add(candidate.id as string);
    if (!Array.isArray(candidate.decision_ids) || candidate.decision_ids.length === 0) {
      throw new Error(`Local guidance ${String(candidate.id)} must reference at least one decision`);
    }
    for (const decisionId of candidate.decision_ids) {
      if (typeof decisionId !== "string" || !decisionsById.has(decisionId)) {
        throw new Error(`Local guidance ${String(candidate.id)} references unknown decision ${String(decisionId)}`);
      }
    }
    if (candidate.url !== null && typeof candidate.url !== "string") throw new Error(`Local guidance ${String(candidate.id)} has an invalid URL`);
    for (const field of ["notes", "localNotes", "localAction", "localOwner", "localContact"] as const) {
      if (candidate[field] !== undefined && typeof candidate[field] !== "string") {
        throw new Error(`Local guidance ${String(candidate.id)} has an invalid ${field}`);
      }
    }
    if (candidate.localPolicyReferences !== undefined) {
      if (!Array.isArray(candidate.localPolicyReferences)) throw new Error(`Local guidance ${String(candidate.id)} has invalid localPolicyReferences`);
      for (const reference of candidate.localPolicyReferences) {
        if (!isRecord(reference)) throw new Error(`Local guidance ${String(candidate.id)} has an invalid policy reference`);
        requireText(reference.label, `Local guidance ${String(candidate.id)} policy label`);
        requireText(reference.url, `Local guidance ${String(candidate.id)} policy URL`);
      }
    }
  }
  return input as unknown as LocalGuidanceRegistry;
}

export const localGuidanceRegistry = parseLocalGuidanceRegistry(rawLocalGuidance);

export function localGuidanceForDecision(
  decisionId: string,
  registry: LocalGuidanceRegistry = localGuidanceRegistry,
) {
  return registry.items.filter((item) => item.decision_ids.includes(decisionId));
}
