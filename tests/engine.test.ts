import { describe,expect,it } from "vitest";
import { evaluateProfile, RANKING_RULES } from "../lib/engine";
import { ontology, parseOntology } from "../lib/ontology";
import type { InstitutionProfile } from "../lib/types";
const base:InstitutionProfile={institutionType:"masters",institutionScale:"medium",researchIntensity:"moderate",itCapacity:"moderate",researchComputingCapacity:"moderate",aiGovernanceMaturity:"informal",dataGovernanceMaturity:"developing",securityMaturity:"developing",aiAdoptionLevel:"emerging",primaryObjectives:["teaching_learning"],regulatedDataUsage:true,budgetFlexibility:"moderate",aiExpertise:"moderate",accessibilityMaturity:"developing"};
const rank=(p:InstitutionProfile,id:string)=>evaluateProfile(p).find(r=>r.decisionId===id)!;
describe("deterministic decision engine",()=>{
 it("prioritizes foundations and defers GPU buying for a constrained institution",()=>{const p={...base,institutionScale:"small",itCapacity:"limited",aiGovernanceMaturity:"none",dataGovernanceMaturity:"weak",securityMaturity:"weak",researchComputingCapacity:"limited",aiExpertise:"limited",budgetFlexibility:"limited"} as InstitutionProfile;for(const id of ["GOV-001","STR-002","DAT-001","POL-003","PRO-001","PEO-001"])expect(rank(p,id).priority,id).toBe("DO_NOW");expect(rank(p,"TEC-004").priority).not.toBe("DO_NOW");expect(rank(p,"TEC-004").reasons).toContain("Dedicated GPU purchasing is premature before workload and capacity planning.")});
 it("elevates advanced lifecycle work for a mature research university",()=>{const p={...base,institutionType:"research_university",institutionScale:"large",researchIntensity:"high",aiGovernanceMaturity:"formal",dataGovernanceMaturity:"strong",securityMaturity:"strong",researchComputingCapacity:"strong",aiAdoptionLevel:"widespread",primaryObjectives:["research"],aiExpertise:"strong",accessibilityMaturity:"strong"} as InstitutionProfile;for(const id of ["EVA-004","SEC-005","RES-006","TEC-010"])expect(rank(p,id).priority).toMatch(/DO_NOW|DO_NEXT/);expect(rank(p,"EVA-004").score).toBeGreaterThan(rank(base,"EVA-004").score);expect(rank(p,"SEC-005").score).toBeGreaterThan(rank(base,"SEC-005").score)});
 it("puts teaching, accessibility and literacy above advanced research computing",()=>{const p={...base,institutionType:"community_college",researchIntensity:"low",primaryObjectives:["teaching_learning"],aiAdoptionLevel:"emerging"} as InstitutionProfile;for(const id of ["TL-001","TL-002","TL-006","ACC-001","PEO-001"])expect(rank(p,id).score).toBeGreaterThan(rank(p,"RES-010").score)});
 it("returns traceable evidence and ontology prerequisites",()=>{const r=rank(base,"GOV-002");expect(r.reasons.length).toBeGreaterThan(0);expect(r.evidenceSourceIds.length).toBeGreaterThan(0);expect(r.prerequisites).toContain("GOV-001")});
 it("caps dependent work when foundational readiness is absent",()=>{const p={...base,aiGovernanceMaturity:"none"} as InstitutionProfile;expect(rank(p,"EVA-004").priority).toMatch(/LATER|NOT_CURRENTLY_RELEVANT/);expect(rank(p,"TL-002").priority).not.toBe("DO_NOW")});
 it("is deterministic and returns each ontology decision exactly once",()=>{const first=evaluateProfile(base);const second=evaluateProfile(base);expect(first).toEqual(second);expect(first).toHaveLength(ontology.decisions.length);expect(new Set(first.map(item=>item.decisionId)).size).toBe(ontology.decisions.length)});
 it("publishes readable ranking thresholds",()=>{expect(RANKING_RULES.thresholds).toEqual({DO_NOW:48,DO_NEXT:28,LATER:8})});
});

describe("ontology parser",()=>{
 it("accepts the canonical ontology",()=>{expect(parseOntology(ontology)).toEqual(ontology)});
 it("rejects missing decision fields",()=>{const invalid=structuredClone(ontology) as unknown as {decisions:Array<Record<string,unknown>>};delete invalid.decisions[0].trigger;expect(()=>parseOntology(invalid)).toThrow(/trigger/)});
 it("rejects relationship endpoints that do not exist",()=>{const invalid=structuredClone(ontology) as unknown as {relationships:Array<Record<string,unknown>>};invalid.relationships[0].from="UNKNOWN";expect(()=>parseOntology(invalid)).toThrow(/endpoint/)});
});
