import { describe, expect, it } from "vitest";
import { applicabilityContexts, decisionAppliesTo } from "../lib/applicability-contexts";
import { emptyExplorerFilters, filterDecisions } from "../lib/explorer";
import { decisionsById, ontology } from "../lib/ontology";

describe("application-level applicability contexts", () => {
  it("uses unique IDs and resolves every mapped decision", () => {
    expect(new Set(applicabilityContexts.map((context) => context.id)).size).toBe(applicabilityContexts.length);
    for (const context of applicabilityContexts) {
      expect(context.relatedDecisionIds.length).toBeGreaterThan(0);
      for (const decisionId of context.relatedDecisionIds) expect(decisionsById.has(decisionId), `${context.id}: ${decisionId}`).toBe(true);
    }
  });

  it("filters relevant decisions without altering ontology evidence", () => {
    const before = JSON.stringify(ontology.decisions.map((decision) => decision.evidence_profile));
    const results = filterDecisions(ontology.decisions, { ...emptyExplorerFilters, applicabilityContext: "ferpa_education_records" });
    expect(results.some((decision) => decision.id === "TL-005")).toBe(true);
    expect(results.every((decision) => decisionAppliesTo(decision, "ferpa_education_records"))).toBe(true);
    expect(JSON.stringify(ontology.decisions.map((decision) => decision.evidence_profile))).toBe(before);
  });
});
