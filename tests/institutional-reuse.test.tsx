import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import exampleGuidance from "../data/local/example-institution-guidance.json";
import { institutionConfig } from "../config/institution";
import { exampleInstitutionConfig } from "../config/institution.example";
import { LocalGuidanceSection } from "../components/LocalGuidanceSection";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import {
  localGuidanceForDecision,
  localGuidanceRegistry,
  parseLocalGuidanceRegistry,
} from "../lib/local-guidance";
import { ontology } from "../lib/ontology";
import { versionInfo } from "../lib/version";

describe("institutional reuse configuration", () => {
  it("preserves the canonical MS-CC reference branding by default", () => {
    const html = `${renderToStaticMarkup(<SiteHeader />)}${renderToStaticMarkup(<SiteFooter />)}`;
    expect(institutionConfig.deploymentMode).toBe("mscc_reference");
    expect(html).toContain("Institutional AI");
    expect(html).toContain("Decision Navigator");
    expect(html).toContain("/brand/mscc-logo-horizontal.png");
    expect(html).toContain("/brand/mscc-logo-vertical.png");
    expect(html).toContain("MS-CC Pilot");
    expect(html).toContain("National Science Foundation under Grant #2234326");
  });

  it("allows visible branding and attribution behavior to change through config", () => {
    const html = `${renderToStaticMarkup(<SiteHeader config={exampleInstitutionConfig} />)}${renderToStaticMarkup(<SiteFooter config={exampleInstitutionConfig} />)}`;
    expect(html).toContain("Example Valley AI");
    expect(html).toContain("Example Valley College");
    expect(html).toContain("/brand/example-valley-horizontal.png");
    expect(html).toContain("EVC deployment");
    expect(html).toContain("AI governance help");
    expect(html).not.toContain("National Science Foundation under Grant #2234326");
  });

  it("exposes core, application, and local configuration versions", () => {
    expect(versionInfo.coreOntology).toBe(ontology.version);
    expect(versionInfo.application).toBe("0.1.0");
    expect(versionInfo.localConfig).toBe(institutionConfig.configVersion);
  });
});

describe("institution-local guidance", () => {
  it("works with zero local-guidance entries", () => {
    expect(localGuidanceRegistry.items).toEqual([]);
    expect(localGuidanceForDecision("DAT-002")).toEqual([]);
    expect(renderToStaticMarkup(<LocalGuidanceSection items={[]} />)).toBe("");
  });

  it("resolves example guidance only for matching core decisions", () => {
    const registry = parseLocalGuidanceRegistry(exampleGuidance);
    expect(localGuidanceForDecision("DAT-002", registry).map((item) => item.id)).toEqual(["LOCAL-001"]);
    expect(localGuidanceForDecision("PRO-002", registry).map((item) => item.id)).toEqual(["LOCAL-002"]);
    expect(localGuidanceForDecision("GOV-001", registry)).toEqual([]);
  });

  it("renders local guidance separately with explicit provenance", () => {
    const registry = parseLocalGuidanceRegistry(exampleGuidance);
    const html = renderToStaticMarkup(<LocalGuidanceSection items={localGuidanceForDecision("DAT-002", registry)} />);
    expect(html).toContain("Your institution&#x27;s guidance");
    expect(html).toContain("Example Valley Data Classification and Handling Policy");
    expect(html).toContain("Institution local");
    expect(html).toContain("origin");
    expect(html).toContain("institution_local");
    expect(html).toContain("not part of the MS-CC core evidence base");
  });

  it("keeps local records outside the core ontology", () => {
    expect(ontology.version).toBe("0.3.3");
    expect(ontology.decisions).toHaveLength(99);
    expect(ontology.relationships).toHaveLength(202);
    expect(ontology.sources).toHaveLength(33);
    expect(ontology.decisions.some((decision) => decision.id.startsWith("LOCAL-"))).toBe(false);
    expect(ontology.sources.some((source) => source.id.startsWith("LOCAL-"))).toBe(false);
  });
});
