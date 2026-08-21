export type DeploymentMode = "mscc_reference" | "institution_fork";

export interface InstitutionConfig {
  configVersion: string;
  institutionName: string;
  productName: string;
  productNamePrimary: string;
  productNameSecondary: string;
  shortName: string;
  logoHorizontal: string;
  logoHorizontalWidth: number;
  logoHorizontalHeight: number;
  logoVertical: string;
  logoVerticalWidth: number;
  logoVerticalHeight: number;
  homepageUrl: string;
  contactLabel: string;
  contactUrl: string;
  aboutText: string;
  deploymentMode: DeploymentMode;
  showMsccAttribution: boolean;
}

export function defineInstitutionConfig(config: InstitutionConfig) {
  return config;
}

/**
 * Default configuration for the canonical MS-CC reference implementation.
 * Institutional forks should edit this file, not core ontology or UI modules.
 */
export const institutionConfig = defineInstitutionConfig({
  configVersion: "1.0.0",
  institutionName: "Minority Serving – Cyberinfrastructure Consortium (MS-CC)",
  productName: "Institutional AI Decision Navigator",
  productNamePrimary: "Institutional AI",
  productNameSecondary: "Decision Navigator",
  shortName: "MS-CC",
  logoHorizontal: "/brand/mscc-logo-horizontal.png",
  logoHorizontalWidth: 189,
  logoHorizontalHeight: 108,
  logoVertical: "/brand/mscc-logo-vertical.png",
  logoVerticalWidth: 182,
  logoVerticalHeight: 139,
  homepageUrl: "https://ms-cc-org.github.io/institutional-ai-decision-navigator/",
  contactLabel: "Project repository",
  contactUrl: "https://github.com/ms-cc-org/institutional-ai-decision-navigator",
  aboutText: "An evidence-traceable MS-CC decision-support resource for higher-education institutions.",
  deploymentMode: "mscc_reference",
  showMsccAttribution: true,
});
