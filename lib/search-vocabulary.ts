import { applicabilityContexts } from "./applicability-contexts";

export interface SearchConcept {
  id: string;
  terms: string[];
  decisionIds: string[];
}

/**
 * Application retrieval metadata for common institutional language that does
 * not appear verbatim in the normalized ontology. Decision order expresses a
 * small, reviewable relevance preference within each concept.
 */
export const searchVocabulary: SearchConcept[] = [
  {
    id: "student-data",
    terms: ["student data", "student record", "student records"],
    decisionIds: ["DAT-001", "DAT-002", "DAT-003", "POL-005", "TL-005"],
  },
  {
    id: "education-records",
    terms: ["ferpa", "education record", "education records"],
    decisionIds: ["POL-005", "DAT-002", "DAT-001", "TL-005"],
  },
  {
    id: "sensitive-data",
    terms: ["sensitive data", "regulated data", "hipaa", "protected health information"],
    decisionIds: ["DAT-002", "DAT-001", "POL-005", "SEC-007", "DAT-003"],
  },
  {
    id: "vendor-review",
    terms: ["vendor review", "vendor assessment", "vendor risk", "due diligence", "third party ai", "third-party ai"],
    decisionIds: ["PRO-002", "POL-009", "DAT-004", "PRO-004", "PRO-005"],
  },
  {
    id: "procurement-contracts",
    terms: ["procurement", "contract", "contracts", "service agreement", "buying ai"],
    decisionIds: ["PRO-002", "POL-009", "PRO-003", "PRO-004", "PRO-006"],
  },
  {
    id: "gpu-compute",
    terms: ["gpu", "gpus", "accelerator", "accelerators"],
    decisionIds: ["TEC-002", "TEC-004", "SEC-002", "RES-003", "TEC-003"],
  },
  {
    id: "ai-policy",
    terms: ["ai policy", "generative ai policy", "acceptable use", "institutional guidance", "campus guidance"],
    decisionIds: ["POL-001", "STR-004", "POL-003", "GOV-006", "TL-001"],
  },
  {
    id: "chatgpt",
    terms: ["chatgpt", "consumer generative ai", "public generative ai"],
    decisionIds: ["DAT-002", "POL-001", "TL-001", "STR-002"],
  },
  {
    id: "copilot",
    terms: ["copilot", "microsoft copilot", "embedded ai assistant", "productivity ai"],
    decisionIds: ["PRO-001", "PRO-002", "DAT-004", "POL-001", "STR-002"],
  },
  {
    id: "research-data",
    terms: ["research data", "research dataset", "research datasets"],
    decisionIds: ["RES-003", "SEC-007", "DAT-003", "DAT-008", "RES-008", "RES-010"],
  },
  {
    id: "ai-literacy",
    terms: ["ai literacy", "faculty training", "staff training", "student training", "professional development"],
    decisionIds: ["PEO-001", "PEO-002", "PEO-003", "TL-006", "PEO-004"],
  },
  {
    id: "hosted-ai",
    terms: ["hosted ai", "cloud hosting", "cloud ai"],
    decisionIds: ["TEC-003", "DAT-005", "DAT-008", "SEC-007"],
  },
];

export const applicabilitySearchVocabulary: SearchConcept[] = applicabilityContexts.map((context) => ({
  id: `applicability-${context.id}`,
  terms: context.aliases,
  decisionIds: context.relatedDecisionIds,
}));

const pluralTokens: Record<string, string> = {
  accelerators: "accelerator",
  assistants: "assistant",
  contracts: "contract",
  datasets: "dataset",
  gpus: "gpu",
  models: "model",
  policies: "policy",
  records: "record",
  rules: "rule",
  services: "service",
  students: "student",
  tools: "tool",
  vendors: "vendor",
  workloads: "workload",
};

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => pluralTokens[token] ?? token)
    .join(" ");
}

export function conceptsForQuery(query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  return [...searchVocabulary, ...applicabilitySearchVocabulary].filter((concept) => concept.terms.some((term) => {
    const normalizedTerm = normalizeSearchText(term);
    return normalizedQuery === normalizedTerm || normalizedQuery.includes(normalizedTerm);
  }));
}
