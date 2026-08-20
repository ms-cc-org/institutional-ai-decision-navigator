import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RootLayout, { metadata } from "../app/layout";
import { EvidenceDetail, EvidenceSummary } from "../components/EvidenceDisclosure";
import { RelationshipProvenanceNote } from "../components/RelationshipProvenanceNote";
import { decisionsById, ontology } from "../lib/ontology";
import { CANONICAL_SITE_URL, PRODUCT_DESCRIPTION, PRODUCT_TITLE } from "../lib/site";

describe("v0.3.2 evidence presentation", () => {
  it("separates direct support from absent independent corroboration", () => {
    const decision = decisionsById.get("POL-008")!;
    const summary = renderToStaticMarkup(<EvidenceSummary decision={decision} />);
    const detail = renderToStaticMarkup(<EvidenceDetail decision={decision} />);

    expect(summary).toContain("Source support");
    expect(summary).toContain("Direct");
    expect(summary).toContain("Independent corroboration");
    expect(summary).toContain("No independent corroboration");
    expect(detail).toContain("These are separate dimensions, not a combined score.");
    expect(detail).toContain("Guidance for AI Policy Development");
    expect(`${summary}${detail}`).not.toMatch(/C035|C036/);
  });

  it("renders null source locations safely without inventing a location", () => {
    const html = renderToStaticMarkup(<EvidenceDetail decision={decisionsById.get("STR-001")!} />);
    expect(html).not.toContain("Source location");
    expect(html).toContain("Exact passage-level verification remains required");
  });

  it("renders complete researcher-inferred relationship provenance", () => {
    const relationship = ontology.relationships[0];
    const html = renderToStaticMarkup(<RelationshipProvenanceNote relationship={relationship} />);
    expect(html).toContain("Researcher inferred");
    expect(html).toContain("High confidence");
    expect(html).toContain("Not yet practitioner validated");
    expect(html).toContain("do not independently validate the relationship itself");
  });

  it("uses evidence-traceable global positioning", () => {
    const html = renderToStaticMarkup(<RootLayout><main>Content</main></RootLayout>);
    expect(metadata.title).toBe(PRODUCT_TITLE);
    expect(metadata.description).toBe(PRODUCT_DESCRIPTION);
    expect(metadata.alternates?.canonical).toBe(CANONICAL_SITE_URL);
    expect(metadata.openGraph?.url).toBe(CANONICAL_SITE_URL);
    expect(html).toContain("Evidence-traceable decision support");
    expect(html.toLowerCase()).not.toContain("evidence-based");
  });
});
