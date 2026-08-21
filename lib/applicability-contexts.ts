import type { ApplicabilityContext, ApplicabilityContextId, Decision } from "./types";

/**
 * Application routing metadata describing when a decision may matter. These
 * contexts are not evidence, legal conclusions, or project compliance status.
 */
export const applicabilityContexts: ApplicabilityContext[] = [
  {
    id: "public_non_sensitive_data",
    label: "Public / non-sensitive data",
    description: "Information intended for public use or otherwise classified as non-sensitive.",
    category: "general",
    aliases: ["public data", "non-sensitive data", "open data"],
    relatedDecisionIds: ["DAT-001", "DAT-002", "DAT-003", "TEC-003", "PRO-002"],
    primary: true,
  },
  {
    id: "general_sensitive_data",
    label: "Personal or sensitive information",
    description: "Personal, confidential, regulated, or otherwise sensitive institutional information.",
    category: "general",
    aliases: ["sensitive data", "regulated data", "personal data", "confidential data"],
    relatedDecisionIds: ["POL-005", "POL-009", "DAT-001", "DAT-002", "DAT-003", "DAT-005", "DAT-006", "DAT-007", "DAT-008", "SEC-001", "SEC-007", "PRO-002"],
    primary: true,
  },
  {
    id: "ferpa_education_records",
    label: "Student / education records",
    description: "Student records or education records that may require institution-specific privacy review.",
    category: "education",
    aliases: ["ferpa", "student data", "student records", "education records"],
    relatedDecisionIds: ["DAT-001", "DAT-002", "DAT-005", "DAT-006", "DAT-007", "DAT-008", "SEC-007", "PRO-002", "POL-005", "POL-009", "TL-005"],
    primary: true,
  },
  {
    id: "hipaa_phi",
    label: "Health information",
    description: "Patient or health information that may require health-privacy review.",
    category: "health",
    aliases: ["hipaa", "phi", "protected health information", "patient records", "health records", "health information"],
    relatedDecisionIds: ["POL-005", "POL-009", "DAT-001", "DAT-002", "DAT-005", "DAT-006", "DAT-007", "DAT-008", "SEC-007", "PRO-002", "TEC-003"],
    primary: true,
  },
  {
    id: "hipaa_ephi",
    label: "Electronic protected health information",
    description: "Electronic health information that may involve cloud-provider, security, or business-associate requirements.",
    category: "health",
    aliases: ["ephi", "electronic phi", "electronic protected health information", "baa", "business associate agreement"],
    relatedDecisionIds: ["POL-005", "POL-009", "DAT-001", "DAT-002", "DAT-005", "DAT-006", "DAT-007", "DAT-008", "SEC-001", "SEC-007", "PRO-002", "TEC-003"],
    primary: false,
    parentId: "hipaa_phi",
  },
  {
    id: "consumer_health_data",
    label: "Consumer health data",
    description: "Health-related information collected outside traditional covered health-care settings.",
    category: "health",
    aliases: ["consumer health data", "wellness app data", "health app data"],
    relatedDecisionIds: ["POL-005", "POL-009", "DAT-001", "DAT-002", "DAT-003", "DAT-005", "PRO-002"],
    primary: false,
    parentId: "hipaa_phi",
  },
  {
    id: "part2_sud_records",
    label: "Substance-use treatment records",
    description: "Substance-use treatment or counseling records that may require specialized privacy review.",
    category: "health",
    aliases: ["42 cfr part 2", "part 2 records", "substance use treatment records", "campus counseling records"],
    relatedDecisionIds: ["POL-005", "POL-009", "DAT-001", "DAT-002", "DAT-003", "DAT-005", "DAT-006", "DAT-007", "DAT-008", "SEC-007", "PRO-002"],
    primary: false,
    parentId: "hipaa_phi",
  },
  {
    id: "human_subjects_research",
    label: "Human-subjects research",
    description: "Research involving information about participants or data collected from people.",
    category: "research",
    aliases: ["human subjects", "human subjects data", "research participants", "irb", "institutional review board"],
    relatedDecisionIds: ["POL-005", "DAT-001", "DAT-003", "DAT-005", "DAT-007", "DAT-008", "SEC-007", "RES-001", "RES-002", "RES-003", "RES-008"],
    primary: true,
  },
  {
    id: "cui_controlled_research",
    label: "Controlled research data",
    description: "Controlled unclassified information or similarly restricted research data.",
    category: "research",
    aliases: ["cui", "controlled unclassified information", "controlled research data", "restricted research data"],
    relatedDecisionIds: ["POL-005", "DAT-001", "DAT-003", "DAT-005", "DAT-006", "DAT-007", "DAT-008", "SEC-001", "SEC-003", "SEC-004", "SEC-007", "PRO-002", "TEC-003", "RES-001", "RES-002", "RES-003"],
    primary: true,
  },
  {
    id: "contract_restricted_data",
    label: "Contract-restricted data",
    description: "Information whose handling is limited by a contract, data-use agreement, sponsor term, or license.",
    category: "contractual",
    aliases: ["contract restricted data", "data use agreement", "dua", "sponsor restricted data"],
    relatedDecisionIds: ["POL-005", "POL-009", "DAT-001", "DAT-003", "DAT-005", "DAT-006", "DAT-007", "DAT-008", "SEC-001", "SEC-007", "PRO-002", "TEC-003", "RES-003"],
    primary: true,
  },
  {
    id: "indigenous_community_governed_data",
    label: "Indigenous / community-governed data",
    description: "Data subject to Tribal, Indigenous, or community governance principles and expectations.",
    category: "community",
    aliases: ["tribal data", "indigenous data", "community governed data", "tribal records"],
    relatedDecisionIds: ["ACC-004", "POL-005", "DAT-001", "DAT-003", "DAT-005", "DAT-007", "DAT-008", "RES-002", "RES-003"],
    primary: true,
  },
];

export const applicabilityContextsById = new Map(applicabilityContexts.map((context) => [context.id, context]));
export const primaryApplicabilityContexts = applicabilityContexts.filter((context) => context.primary);

export function decisionAppliesTo(decision: Pick<Decision, "id">, contextId: ApplicabilityContextId) {
  return applicabilityContextsById.get(contextId)?.relatedDecisionIds.includes(decision.id) ?? false;
}

export function applicabilityLabel(contextId: ApplicabilityContextId) {
  return applicabilityContextsById.get(contextId)?.label ?? contextId;
}
