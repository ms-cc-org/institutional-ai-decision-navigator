import { describe, expect, it } from "vitest";
import { guidedPathForDecision, mapDecisionToIntent } from "../lib/decision-intent";
import { emptyExplorerFilters, filterDecisions, rankDecisionsForQuery } from "../lib/explorer";
import { decisionsById, ontology } from "../lib/ontology";
import { normalizeSearchText, searchVocabulary } from "../lib/search-vocabulary";

const search = (query: string) => filterDecisions(ontology.decisions, { ...emptyExplorerFilters, query });
const ids = (query: string) => search(query).map((decision) => decision.id);

describe("explorer search vocabulary", () => {
  it.each([
    ["AI policy", "GOV-005", ["STR-004", "POL-001"]],
    ["student data", "DAT-001", ["DAT-002", "POL-005"]],
    ["FERPA", "POL-005", ["DAT-002", "DAT-001"]],
    ["GPUs", "TEC-002", ["TEC-004"]],
    ["vendor review", "PRO-002", ["POL-009", "DAT-004"]],
    ["Copilot", "PRO-001", ["PRO-002", "DAT-004"]],
    ["privacy", "DAT-001", ["DAT-002", "DAT-005"]],
    ["accessibility", "PRO-005", ["ACC-001", "ACC-002"]],
  ])("returns semantically relevant decisions for %s", (query, firstId, expectedIds) => {
    const resultIds = ids(query);
    expect(resultIds[0]).toBe(firstId);
    expect(resultIds).toEqual(expect.arrayContaining(expectedIds));
  });

  it("normalizes case and curated plural variants", () => {
    expect(ids("AI POLICY")).toEqual(ids("ai policy"));
    expect(ids("GPU")).toEqual(ids("GPUs"));
    expect(normalizeSearchText("  Student RECORDS  ")).toBe("student record");
  });

  it("uses alias expansion while keeping direct matches ahead of alias-only matches", () => {
    expect(ids("student data")[0]).toBe("DAT-001");
    const ranked = rankDecisionsForQuery(ontology.decisions, "acceptable use");
    expect(ranked[0].decision.id).toBe("POL-001");
    expect(ranked[0].matchType).toBe("action");
    expect(ranked.find((result) => result.matchType === "alias")?.score).toBeLessThan(ranked[0].score);
  });

  it("returns all filtered decisions for empty search and none for nonsense", () => {
    expect(search("")).toHaveLength(ontology.decisions.length);
    expect(search("qzqx impossible phrase")).toEqual([]);
  });

  it("keeps every curated vocabulary reference anchored to the ontology", () => {
    for (const concept of searchVocabulary) {
      expect(concept.terms.length, concept.id).toBeGreaterThan(0);
      for (const decisionId of concept.decisionIds) expect(decisionsById.has(decisionId), `${concept.id}: ${decisionId}`).toBe(true);
    }
  });
});

describe("decision-to-intent mapping", () => {
  it("prefers a unique existing seed-decision mapping", () => {
    expect(mapDecisionToIntent(decisionsById.get("PRO-002")!)).toEqual({ intentId: "evaluate-tool", basis: "seed_decision" });
  });

  it("uses the intent's primary relevant domain when no seed mapping exists", () => {
    expect(mapDecisionToIntent(decisionsById.get("GOV-005")!)).toEqual({ intentId: "create-governance", basis: "primary_domain" });
  });

  it("falls back to the general guided pathway when mapping is ambiguous", () => {
    const decision = decisionsById.get("DAT-010")!;
    expect(mapDecisionToIntent(decision)).toEqual({ intentId: "getting-started", basis: "general_fallback" });
    expect(guidedPathForDecision(decision)).toBe("/?intent=getting-started&fromDecision=DAT-010");
  });
});
