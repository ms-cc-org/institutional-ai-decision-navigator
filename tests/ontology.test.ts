import { describe, expect, it } from "vitest";
import { isC035C036OnlyDecision, ontology, parseOntology, splitField } from "../lib/ontology";

describe("ontology v0.3.3 schema", () => {
  it("loads the canonical release cardinalities", () => {
    expect(ontology.version).toBe("0.3.3");
    expect(ontology.decisions).toHaveLength(99);
    expect(ontology.relationships).toHaveLength(202);
    expect(ontology.sources).toHaveLength(33);
  });

  it("resolves every decision and evidence-link source", () => {
    const sourceIds = new Set(ontology.sources.map((source) => source.id));
    for (const decision of ontology.decisions) {
      for (const sourceId of splitField(decision.source_ids)) {
        expect(sourceIds.has(sourceId), `${decision.id} source_ids → ${sourceId}`).toBe(true);
      }
      for (const link of decision.evidence_links) {
        expect(sourceIds.has(link.source_id), `${decision.id} evidence link → ${link.source_id}`).toBe(true);
      }
    }
  });

  it("resolves every relationship endpoint and supporting source", () => {
    const decisionIds = new Set(ontology.decisions.map((decision) => decision.id));
    const sourceIds = new Set(ontology.sources.map((source) => source.id));
    for (const relationship of ontology.relationships) {
      expect(decisionIds.has(relationship.from), relationship.from).toBe(true);
      expect(decisionIds.has(relationship.to), relationship.to).toBe(true);
      for (const sourceId of relationship.provenance.supporting_source_ids) {
        expect(sourceIds.has(sourceId), `${relationship.from} → ${relationship.to}: ${sourceId}`).toBe(true);
      }
    }
  });

  it("accepts direct source support without independent corroboration", () => {
    const decision = ontology.decisions.find((candidate) =>
      candidate.evidence_profile.source_support === "direct"
      && candidate.evidence_profile.corroboration === "none");
    expect(decision).toBeDefined();
    expect(() => parseOntology(ontology)).not.toThrow();
  });

  it("adds passage locations without concealing remaining gaps", () => {
    const links = ontology.decisions.flatMap((decision) => decision.evidence_links);
    expect(links.filter((link) => link.source_location !== null)).toHaveLength(26);
    expect(links.filter((link) => link.source_location === null)).toHaveLength(244);
  });

  it("identifies decisions relying only on C035 and/or C036", () => {
    expect(ontology.decisions.filter(isC035C036OnlyDecision)).toHaveLength(27);
  });

  it("resolves C039–C044 and preserves validation status", () => {
    const sourceIds = new Set(ontology.sources.map((source) => source.id));
    for (const sourceId of ["C039", "C040", "C041", "C042", "C043", "C044"]) expect(sourceIds.has(sourceId)).toBe(true);
    expect(new Set(ontology.sources.map((source) => source.id)).size).toBe(ontology.sources.length);
    expect(ontology.decisions.every((decision) => decision.evidence_profile.validation_status === "not_validated")).toBe(true);
    expect(ontology.decisions.find((decision) => decision.id === "DAT-002")?.evidence_profile).toMatchObject({ evidence_breadth: 7, corroboration: "multiple_independent_sources" });
  });

  it("keeps evidence breadth synchronized with unique linked sources", () => {
    for (const decision of ontology.decisions) {
      const linkedSources = new Set(decision.evidence_links.map((link) => link.source_id));
      expect(decision.evidence_profile.evidence_breadth, decision.id).toBe(linkedSources.size);
      expect(new Set(splitField(decision.source_ids)), decision.id).toEqual(linkedSources);
    }
  });
});

describe("ontology v0.3.3 runtime validation", () => {
  it("rejects duplicate decision IDs", () => {
    const invalid = structuredClone(ontology);
    invalid.decisions[1].id = invalid.decisions[0].id;
    expect(() => parseOntology(invalid)).toThrow(/Duplicate decision ID/);
  });

  it("rejects duplicate source IDs", () => {
    const invalid = structuredClone(ontology);
    invalid.sources[1].id = invalid.sources[0].id;
    expect(() => parseOntology(invalid)).toThrow(/Duplicate source ID/);
  });

  it("rejects malformed evidence profiles", () => {
    const invalid = structuredClone(ontology) as unknown as {
      decisions: Array<{ evidence_profile: { source_support: string } }>;
    };
    invalid.decisions[0].evidence_profile.source_support = "strong";
    expect(() => parseOntology(invalid)).toThrow(/source_support/);
  });

  it("rejects unresolved evidence-link sources", () => {
    const invalid = structuredClone(ontology) as unknown as {
      decisions: Array<{ evidence_links: Array<{ source_id: string }> }>;
    };
    invalid.decisions[0].evidence_links[0].source_id = "UNKNOWN";
    expect(() => parseOntology(invalid)).toThrow(/unknown source/);
  });

  it("rejects unresolved relationship endpoints", () => {
    const invalid = structuredClone(ontology) as unknown as {
      relationships: Array<{ from: string }>;
    };
    invalid.relationships[0].from = "UNKNOWN";
    expect(() => parseOntology(invalid)).toThrow(/endpoint/);
  });
});
