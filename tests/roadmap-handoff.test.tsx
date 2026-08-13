import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FollowUpSection } from "../components/FollowUpSection";
import { createDiagnosticState } from "../lib/diagnostics";
import { evaluateIntent } from "../lib/intent-engine";
import { buildRoadmapMarkdown, restartNavigator } from "../lib/roadmap-export";
import type { DiagnosticAnswers } from "../lib/types";

const answers: DiagnosticAnswers = {
  institution_type: "masters", primary_objective: "teaching_learning", regulated_data: "yes",
  governance_owner: "informal", tool_review: "no", ai_guidance: "draft",
  data_classification: "no", external_ai_rules: "no", research_compute: "limited",
  research_expertise: "no", secure_research_environment: "no", current_ai_use: "some",
  embedded_vendor_ai: "yes", multi_unit_demand: "yes",
};

describe("roadmap handoff", () => {
  it("exports priorities, observations, and distinct evidence dimensions", () => {
    const diagnosticState = createDiagnosticState(answers);
    const roadmap = evaluateIntent("getting-started", {}, diagnosticState.profile);
    const markdown = buildRoadmapMarkdown({ roadmap, observations: diagnosticState.observations, generatedAt: new Date("2026-08-12T12:00:00Z") });
    expect(markdown).toContain("# Institutional AI Decision Roadmap");
    expect(markdown).toContain("## Context / What we heard");
    expect(markdown).toContain("## Primary priorities");
    expect(markdown).toContain(roadmap.primary[0].plainLanguageTitle);
    expect(markdown).toContain("Source support:");
    expect(markdown).toContain("Independent corroboration:");
    expect(markdown).toContain("Validation status: Not validated");
    expect(markdown).toContain("## Coming up next");
    expect(markdown).toContain("## Only if this applies");
    expect(markdown).toContain("## Next 90 days");
    expect(markdown).not.toMatch(/\b(?:GOV|DAT|TL)-\d{3}\b/);
  });

  it("renders next and conditional recommendations as separate groups", () => {
    const roadmap = evaluateIntent("evaluate-tool", { data_access: "sensitive", tool_type: "student", purchase_type: "new", people_decisions: "no" });
    const nextHtml = renderToStaticMarkup(<FollowUpSection heading="Coming up next" items={roadmap.next} />);
    const conditionalHtml = renderToStaticMarkup(<FollowUpSection heading="Only if this applies" items={roadmap.conditional} conditional />);
    expect(nextHtml).toContain("Coming up next");
    expect(nextHtml).not.toContain("Only if this applies");
    expect(conditionalHtml).toContain("Only if this applies");
  });

  it("does not clear storage until restart is confirmed", () => {
    const storage = { removeItem: vi.fn() };
    expect(restartNavigator(false, storage)).toBe(false);
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(restartNavigator(true, storage)).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledTimes(3);
  });
});
