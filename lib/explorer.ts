import type { Decision } from "./types";

export interface ExplorerFilters {
  query: string;
  domain: string;
  sourceSupport: string;
  corroboration: string;
  validationStatus: string;
}

export const emptyExplorerFilters: ExplorerFilters = {
  query: "",
  domain: "all",
  sourceSupport: "all",
  corroboration: "all",
  validationStatus: "all",
};

export function filterDecisions(decisions: Decision[], filters: ExplorerFilters) {
  const query = filters.query.trim().toLowerCase();
  return decisions.filter((decision) => {
    const searchable = `${decision.question} ${decision.domain} ${decision.subdomain} ${decision.decision_output}`.toLowerCase();
    return (!query || searchable.includes(query))
      && (filters.domain === "all" || decision.domain === filters.domain)
      && (filters.sourceSupport === "all" || decision.evidence_profile.source_support === filters.sourceSupport)
      && (filters.corroboration === "all" || decision.evidence_profile.corroboration === filters.corroboration)
      && (filters.validationStatus === "all" || decision.evidence_profile.validation_status === filters.validationStatus);
  });
}
