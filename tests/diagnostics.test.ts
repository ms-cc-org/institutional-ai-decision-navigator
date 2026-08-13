import { describe, expect, it } from "vitest";
import {
  createDiagnosticState,
  deriveAdoptionState,
  deriveDataGovernanceState,
  deriveGovernanceState,
  deriveInstitutionProfile,
  deriveResearchCapacityState,
  diagnosticIndicators,
  parseDiagnosticState,
  summarizeDiagnostics,
} from "../lib/diagnostics";
import { evaluateIntent } from "../lib/intent-engine";
import { decisionsById } from "../lib/ontology";
import type { DiagnosticAnswers } from "../lib/types";

const answers: DiagnosticAnswers = {
  institution_type: "masters",
  primary_objective: "research",
  regulated_data: "yes",
  governance_owner: "informal",
  tool_review: "no",
  ai_guidance: "draft",
  data_classification: "no",
  external_ai_rules: "partial",
  research_compute: "limited",
  research_expertise: "no",
  secure_research_environment: "sometimes",
  current_ai_use: "some",
  embedded_vendor_ai: "yes",
  multi_unit_demand: "yes",
};

describe("observable diagnostic model", () => {
  it("contains 14 mapped observable questions with help text", () => {
    expect(diagnosticIndicators).toHaveLength(14);
    expect(diagnosticIndicators.every((indicator) => indicator.helpText.length > 0)).toBe(true);
    for (const indicator of diagnosticIndicators) {
      expect(indicator.relatedDecisionIds.length).toBeGreaterThan(0);
      for (const decisionId of indicator.relatedDecisionIds) expect(decisionsById.has(decisionId), `${indicator.id}: ${decisionId}`).toBe(true);
      for (const option of indicator.responseOptions) expect(indicator.stateMapping[option.value], `${indicator.id}: ${option.value}`).toBeDefined();
    }
  });

  it("derives governance state from observable controls", () => {
    expect(deriveGovernanceState({ governance_owner: "formal", tool_review: "consistent", ai_guidance: "approved" })).toBe("formal");
    expect(deriveGovernanceState({ governance_owner: "no", tool_review: "no", ai_guidance: "no" })).toBe("none");
    expect(deriveGovernanceState(answers)).toBe("informal");
  });

  it("derives data governance from classification and external-use rules", () => {
    expect(deriveDataGovernanceState({ data_classification: "yes", external_ai_rules: "explicit" })).toBe("strong");
    expect(deriveDataGovernanceState({ data_classification: "no", external_ai_rules: "no" })).toBe("weak");
    expect(deriveDataGovernanceState(answers)).toBe("developing");
  });

  it("derives research capacity and adoption deterministically", () => {
    expect(deriveResearchCapacityState({ research_compute: "reliable", research_expertise: "yes", secure_research_environment: "yes" })).toBe("strong");
    expect(deriveResearchCapacityState(answers)).toBe("moderate");
    expect(deriveAdoptionState(answers)).toBe("widespread");
  });

  it("treats unknown responses conservatively without failing", () => {
    const unknown = {
      governance_owner: "unsure",
      tool_review: "unsure",
      ai_guidance: "unsure",
      data_classification: "unsure",
      external_ai_rules: "unsure",
      research_compute: "unsure",
      research_expertise: "unsure",
      secure_research_environment: "unsure",
      current_ai_use: "unsure",
      embedded_vendor_ai: "unsure",
      multi_unit_demand: "unsure",
    };
    expect(deriveGovernanceState(unknown)).toBe("informal");
    expect(deriveDataGovernanceState(unknown)).toBe("developing");
    expect(deriveResearchCapacityState(unknown)).toBe("limited");
    expect(deriveAdoptionState(unknown)).toBe("exploring");
  });

  it("creates observations grounded in answers and exactly three priorities", () => {
    const profile = deriveInstitutionProfile(answers);
    const observations = summarizeDiagnostics(answers);
    expect(observations).toContain("AI governance ownership exists, but it is informal.");
    expect(observations).toContain("There is no documented AI tool-review process.");
    expect(observations).toContain("Sensitive or regulated data is in scope.");
    expect(evaluateIntent("getting-started", {}, profile).primary).toHaveLength(3);
  });

  it("persists versioned diagnostics and gracefully rejects legacy profile JSON", () => {
    const state = createDiagnosticState(answers);
    expect(parseDiagnosticState(JSON.stringify(state))).toEqual(state);
    expect(parseDiagnosticState(JSON.stringify(state.profile))).toBeNull();
    expect(parseDiagnosticState("not-json")).toBeNull();
  });
});
