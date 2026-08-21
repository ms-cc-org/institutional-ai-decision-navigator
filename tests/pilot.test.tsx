import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { filterDecisions, emptyExplorerFilters } from "../lib/explorer";
import { evaluateIntent } from "../lib/intent-engine";
import { ontology } from "../lib/ontology";
import { interpretSituation, situationToSession } from "../lib/situation-interpreter";
import { landingExampleDecisions, landingStats } from "../lib/landing";
import { createInstitutionContext, parseInstitutionProfile, parseNavigatorSession } from "../lib/session";
import { NAVIGATOR_STORAGE_KEYS } from "../lib/roadmap-export";
import type { InstitutionProfile } from "../lib/types";
import {
  buildValidationExport, DECISION_FEEDBACK_KEY, RELATIONSHIP_FEEDBACK_KEY,
  saveDecisionFeedback, saveRelationshipFeedback,
} from "../lib/validation";

const exactAttribution = [
  "© 2026 MS-CC, in partnership with Internet2.",
  "This website is based upon work supported by the National Science Foundation under Grant #2234326.",
  "Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.",
];

describe("MS-CC pilot shell", () => {
  it("uses the supplied logo assets and exact shared attribution", () => {
    expect(existsSync("public/brand/mscc-logo-horizontal.png")).toBe(true);
    expect(existsSync("public/brand/mscc-logo-vertical.png")).toBe(true);
    const header = renderToStaticMarkup(<SiteHeader />);
    const footer = renderToStaticMarkup(<SiteFooter />);
    expect(header).toContain("/brand/mscc-logo-horizontal.png");
    expect(header).toContain("Browse topics");
    expect(header).toContain("MS-CC Pilot");
    expect(footer).toContain("/brand/mscc-logo-vertical.png");
    exactAttribution.forEach((line) => expect(footer).toContain(line));
  });

  it("renders three primary entry modes and their destinations", () => {
    const source = readFileSync("components/IntentNavigator.tsx", "utf8");
    expect(source).toContain("Know which AI decisions matter for your institution.");
    expect(source).toContain("Build my roadmap");
    expect(source).toContain("Ask about my situation");
    expect(source).toContain("Explore a topic");
    expect(source).toContain("Browse topics");
    expect(source).not.toContain("Explore the decision model");
    expect(source).toContain('href="/explore"');
    expect(source).toContain('chooseIntent("getting-started")');
    expect(source).toContain('setSelectedMode("situation")');
  });

  it("derives landing-page proof counts and examples from the canonical ontology", () => {
    expect(landingStats).toEqual({
      decisions: ontology.decisions.length,
      domains: new Set(ontology.decisions.map((decision) => decision.domain)).size,
      sources: ontology.sources.length,
    });
    expect(landingExampleDecisions).toHaveLength(5);
    for (const decision of landingExampleDecisions) expect(ontology.decisions).toContain(decision);
  });

  it("uses evidence-honest landing-page positioning", () => {
    const source = readFileSync("components/IntentNavigator.tsx", "utf8");
    expect(source).toContain("Built for decisions, not another maturity score.");
    expect(source).toContain("Practitioner validation of the core decision model and sequencing is ongoing.");
    expect(source).toContain("researcher synthesis");
    expect(source).toContain("supports institutional judgment rather than replacing it");
    expect(source).toContain("defined decision rules—not open-ended AI generation");
    expect(source).toContain("direct, corroborating, contextual, or researcher synthesis");
    expect(source).toContain("Inspectable");
    expect(source).not.toMatch(/scientifically proven|validated recommendations|authoritative recommendations/i);
  });

  it("uses plain-language explorer headings, search copy, and topic labels", () => {
    const source = readFileSync("components/DecisionExplorer.tsx", "utf8");
    expect(source).toContain("Explore institutional AI decisions");
    expect(source).toContain("Search decisions or recommended actions");
    expect(source).toContain('Try "AI policy," "student data," "GPUs," or "vendor review"');
    expect(source).toContain("All topics");
    expect(source).toContain('href="/?intent=getting-started"');
    expect(source).toContain("Guide me through it →");
    expect(source).toContain("What kind of data or requirements are involved?");
    expect(source).toContain("They do not determine legal compliance.");
    expect(source).toContain("We couldn&apos;t find a close match.");
    expect(source).not.toContain("Search decision text or expected output");
    expect(source).not.toContain("Explore the decision model");
  });

  it("connects decision details to a contextual guided pathway", () => {
    const detail = readFileSync("app/decisions/[id]/page.tsx", "utf8");
    const navigator = readFileSync("components/IntentNavigator.tsx", "utf8");
    expect(detail).toContain("Help me prioritize this →");
    expect(detail).toContain("guidedPathForDecision(decision)");
    expect(navigator).toContain("You&apos;re exploring:");
    expect(navigator).toContain('searchParams.get("fromDecision")');
  });

  it("keeps GitHub Pages deployment paths repository-independent", () => {
    const nextConfig = readFileSync("next.config.ts", "utf8");
    const workflow = readFileSync(".github/workflows/deploy-pages.yml", "utf8");
    const header = readFileSync("components/SiteHeader.tsx", "utf8");
    const footer = readFileSync("components/SiteFooter.tsx", "utf8");
    const institutionConfigSource = readFileSync("config/institution.ts", "utf8");
    expect(nextConfig).toContain('basePath: process.env.PAGES_BASE_PATH ?? ""');
    expect(workflow).toContain("PAGES_BASE_PATH: ${{ steps.pages.outputs.base_path }}");
    expect(header).toContain("assetUrl(config.logoHorizontal)");
    expect(footer).toContain("assetUrl(config.logoVertical)");
    expect(institutionConfigSource).toContain('logoHorizontal: "/brand/mscc-logo-horizontal.png"');
    expect(institutionConfigSource).toContain('logoVertical: "/brand/mscc-logo-vertical.png"');
  });

  it("contains no former personal repository URL in production-facing files", () => {
    const files = [
      "README.md",
      "app/layout.tsx",
      "app/methodology/page.tsx",
      "lib/roadmap-export.ts",
      "lib/site.ts",
      "lib/core.ts",
      "config/institution.ts",
      ".github/workflows/deploy-pages.yml",
    ];
    const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/amanda-tan\.github\.io|github\.com\/amanda-tan\/institutional-ai-decision-tool/);
    expect(source).toContain("https://github.com/ms-cc-org/institutional-ai-decision-navigator");
    expect(source).toContain("https://ms-cc-org.github.io/institutional-ai-decision-navigator/");
  });
});

describe("deterministic situation interpretation", () => {
  it("extracts stated context, preserves unmentioned fields as unknown, and uses the existing engine", () => {
    const state = interpretSituation("We're a small university. Faculty are already using ChatGPT. We don't have an AI policy yet, and want to buy an enterprise AI platform.");
    expect(state.confirmed).toBe(false);
    expect(state.context.institutionScale).toBe("small");
    expect(state.context.policy).toBe("none");
    expect(state.context.procurement).toBe("new");
    expect(state.context.governance).toBe("unknown");
    expect(state.context.dataSensitivity).toBe("unknown");
    const session = situationToSession(state.context);
    expect(session.entryMode).toBe("situation");
    expect(session.intentId).toBe("evaluate-tool");
    expect(evaluateIntent(session.intentId, session.answers).primary.length).toBeGreaterThan(0);
  });

  it.each([
    ["student records", ["ferpa_education_records"]],
    ["patient records", ["hipaa_phi", "hipaa_ephi"]],
    ["human subjects data", ["human_subjects_research"]],
    ["CUI research data", ["cui_controlled_research"]],
    ["Tribal data", ["indigenous_community_governed_data"]],
  ])("maps %s to possible applicability and still requires confirmation", (phrase, expected) => {
    const state = interpretSituation(`Our institution is planning an AI project involving ${phrase}.`);
    expect(state.context.applicabilityContextIds).toEqual(expect.arrayContaining(expected));
    expect(state.observations.some((observation) => observation.includes("may be involved"))).toBe(true);
    expect(state.observations.join(" ")).not.toMatch(/applies|compliant/i);
    expect(state.confirmed).toBe(false);
  });

  it("migrates legacy navigator and institution context records safely", () => {
    const legacySession = parseNavigatorSession(JSON.stringify({ intentId: "set-direction", answers: { current_use: "yes" } }));
    expect(legacySession?.version).toBe(1);
    const profile: InstitutionProfile = { institutionType: "masters", institutionScale: "medium", researchIntensity: "moderate", itCapacity: "moderate", researchComputingCapacity: "moderate", aiGovernanceMaturity: "informal", dataGovernanceMaturity: "developing", securityMaturity: "developing", aiAdoptionLevel: "emerging", primaryObjectives: ["research"], regulatedDataUsage: true, budgetFlexibility: "moderate", aiExpertise: "moderate", accessibilityMaturity: "developing" };
    expect(parseInstitutionProfile(JSON.stringify(profile))).toEqual(profile);
    expect(parseInstitutionProfile(JSON.stringify(createInstitutionContext(profile)))).toEqual(profile);
  });

  it("contains no client-side API integration or secret placeholder", () => {
    const source = readFileSync("lib/situation-interpreter.ts", "utf8");
    expect(source).not.toMatch(/OPENAI_API_KEY|Authorization: Bearer|api\.openai\.com/);
  });
});

describe("decision explorer", () => {
  it("supports search, domain, and evidence filters", () => {
    expect(filterDecisions(ontology.decisions, { ...emptyExplorerFilters, query: "data classification" }).some((decision) => decision.id === "DAT-001")).toBe(true);
    const domain = ontology.decisions[0].domain;
    expect(filterDecisions(ontology.decisions, { ...emptyExplorerFilters, domain }).every((decision) => decision.domain === domain)).toBe(true);
    expect(filterDecisions(ontology.decisions, { ...emptyExplorerFilters, corroboration: "none" }).every((decision) => decision.evidence_profile.corroboration === "none")).toBe(true);
  });
});

describe("working-group feedback", () => {
  it("stores decision and relationship feedback and exports ontology version", () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: vi.fn((key: string, value: string) => values.set(key, value)) };
    const decision = { decisionId: "GOV-001", relevance: "yes", clarity: "mostly", sequencing: "about_here", comments: "Clearer scope needed", updatedAt: "2026-08-20T00:00:00.000Z" } as const;
    const relationship = { from: "STR-001", to: "GOV-001", response: "depends", comments: "Depends on charter", updatedAt: "2026-08-20T00:00:00.000Z" } as const;
    saveDecisionFeedback(storage, decision);
    saveRelationshipFeedback(storage, relationship);
    expect(values.get(DECISION_FEEDBACK_KEY)).toContain("GOV-001");
    expect(values.get(RELATIONSHIP_FEEDBACK_KEY)).toContain("STR-001->GOV-001");
    const exported = buildValidationExport({ version: 1, role: "faculty", institutionType: "masters", institutionSize: "2500_5000" }, { "GOV-001": decision }, { "STR-001->GOV-001": relationship }, ontology.version, new Date("2026-08-20T00:00:00.000Z"));
    expect(exported.pilot).toBe("MS-CC Institutional AI Decision Navigator");
    expect(exported.ontology_version).toBe("0.3.3");
    expect(exported.decisions_reviewed[0].decisionId).toBe("GOV-001");
    expect(exported.relationship_reviews[0].to).toBe("GOV-001");
  });

  it("keeps pilot validation records outside normal assessment restart", () => {
    expect(NAVIGATOR_STORAGE_KEYS).not.toContain(DECISION_FEEDBACK_KEY);
    expect(NAVIGATOR_STORAGE_KEYS).not.toContain(RELATIONSHIP_FEEDBACK_KEY);
  });
});
