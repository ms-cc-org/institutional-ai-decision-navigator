import { defineInstitutionConfig } from "./institution";

/**
 * Fictional example only. Copy the values you need into institution.ts and
 * add the referenced logo files under public/brand/.
 */
export const exampleInstitutionConfig = defineInstitutionConfig({
  configVersion: "1.0.0-example",
  institutionName: "Example Valley College",
  productName: "Example Valley AI Decision Navigator",
  productNamePrimary: "Example Valley AI",
  productNameSecondary: "Decision Navigator",
  shortName: "EVC",
  logoHorizontal: "/brand/example-valley-horizontal.png",
  logoHorizontalWidth: 220,
  logoHorizontalHeight: 80,
  logoVertical: "/brand/example-valley-vertical.png",
  logoVerticalWidth: 160,
  logoVerticalHeight: 160,
  homepageUrl: "https://ai-governance.example.edu/",
  contactLabel: "AI governance help",
  contactUrl: "https://example.edu/ai-governance/help",
  aboutText: "Local decision support for Example Valley College, based on the MS-CC core decision model.",
  deploymentMode: "institution_fork",
  showMsccAttribution: false,
});
