import { ontology } from "./ontology";

export const landingStats = {
  decisions: ontology.decisions.length,
  domains: new Set(ontology.decisions.map((decision) => decision.domain)).size,
  sources: ontology.sources.length,
};

const exampleDecisionIds = ["GOV-001", "DAT-002", "PRO-002", "TEC-002", "POL-008"];

export const landingExampleDecisions = exampleDecisionIds.map((decisionId) => {
  const decision = ontology.decisions.find((candidate) => candidate.id === decisionId);
  if (!decision) throw new Error(`Landing-page example references unknown decision ${decisionId}`);
  return decision;
});
