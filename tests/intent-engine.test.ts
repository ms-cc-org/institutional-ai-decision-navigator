import { describe, expect, it } from "vitest";
import { evaluateIntent } from "../lib/intent-engine";
import type { InstitutionProfile, IntentRoadmap } from "../lib/types";

const allIds = (roadmap: IntentRoadmap) => [
  ...roadmap.primary,
  ...roadmap.next,
  ...roadmap.conditional,
].map((item) => item.decisionId);

const generalProfile: InstitutionProfile = {
  institutionType: "masters",
  institutionScale: "medium",
  researchIntensity: "moderate",
  itCapacity: "moderate",
  researchComputingCapacity: "moderate",
  aiGovernanceMaturity: "informal",
  dataGovernanceMaturity: "developing",
  securityMaturity: "developing",
  aiAdoptionLevel: "emerging",
  primaryObjectives: ["teaching_learning"],
  regulatedDataUsage: true,
  budgetFlexibility: "moderate",
  aiExpertise: "moderate",
  accessibilityMaturity: "developing",
};

describe("intent-aware decision navigation", () => {
  it("focuses a sensitive student-facing new purchase on procurement controls", () => {
    const roadmap = evaluateIntent("evaluate-tool", {
      tool_type: "student",
      data_access: "sensitive",
      people_decisions: "no",
      purchase_type: "new",
    });
    const ids = allIds(roadmap);
    expect(roadmap.primary).toHaveLength(4);
    expect(ids).toEqual(expect.arrayContaining(["DAT-001", "PRO-002", "PRO-005", "POL-009"]));
    expect(ids).not.toContain("TEC-004");
    expect(ids).not.toContain("RES-002");
  });

  it("focuses constrained sensitive research on feasibility, security, sharing, and reproducibility", () => {
    const roadmap = evaluateIntent("support-research", {
      research_stage: "planning",
      research_data: "sensitive",
      local_compute: "limited",
      research_output: "yes",
    });
    const ids = allIds(roadmap);
    expect(roadmap.primary.map((item) => item.decisionId)).toEqual(["RES-002", "RES-003", "SEC-007", "RES-011", "RES-008"]);
    expect(ids).not.toContain("TL-001");
    expect(roadmap.primary).toHaveLength(5);
  });

  it("focuses emerging teaching use on guidance, literacy, accessibility, and governance dependencies", () => {
    const roadmap = evaluateIntent("teaching-learning", {
      ai_use: "emerging",
      course_guidance: "no",
      governance: "no",
      assessment: "no",
      accessibility: "no",
    });
    const ids = allIds(roadmap);
    expect(ids).toEqual(expect.arrayContaining(["TL-001", "PEO-001", "ACC-001", "GOV-001", "POL-001"]));
    expect(ids).not.toContain("EVA-004");
    expect(roadmap.primary.length).toBeLessThanOrEqual(5);
  });

  it("returns exactly three strategic priorities for the general pathway", () => {
    const roadmap = evaluateIntent("getting-started", {}, generalProfile);
    expect(roadmap.primary.map((item) => item.decisionId)).toEqual(["GOV-001", "DAT-001", "TL-001"]);
    expect(roadmap.primary).toHaveLength(3);
    expect(roadmap.timeline).toHaveLength(3);
  });

  it("keeps every targeted result at five primary decisions or fewer", () => {
    for (const intentId of ["set-direction", "create-governance", "develop-policy", "evaluate-tool", "support-research", "infrastructure", "teaching-learning", "skills-support", "administrative-automation"] as const) {
      expect(evaluateIntent(intentId, {}).primary.length, intentId).toBeLessThanOrEqual(5);
    }
  });
});
