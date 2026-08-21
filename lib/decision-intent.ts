import { intents } from "./intents";
import type { Decision, IntentId } from "./types";

export interface DecisionIntentMapping {
  intentId: IntentId;
  basis: "seed_decision" | "primary_domain" | "general_fallback";
}

const targetedIntents = intents.filter((intent) => intent.id !== "getting-started");

export function mapDecisionToIntent(decision: Pick<Decision, "id" | "domain">): DecisionIntentMapping {
  const seedMatches = targetedIntents.filter((intent) => intent.seedDecisionIds.includes(decision.id));
  if (seedMatches.length === 1) return { intentId: seedMatches[0].id, basis: "seed_decision" };
  if (seedMatches.length > 1) return { intentId: "getting-started", basis: "general_fallback" };

  const primaryDomainMatches = targetedIntents.filter((intent) => intent.relevantDomains[0] === decision.domain);
  if (primaryDomainMatches.length === 1) return { intentId: primaryDomainMatches[0].id, basis: "primary_domain" };
  return { intentId: "getting-started", basis: "general_fallback" };
}

export function guidedPathForDecision(decision: Pick<Decision, "id" | "domain">) {
  const mapping = mapDecisionToIntent(decision);
  return `/?intent=${mapping.intentId}&fromDecision=${decision.id}`;
}
