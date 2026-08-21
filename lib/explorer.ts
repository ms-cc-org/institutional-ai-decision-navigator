import type { Decision } from "./types";
import { conceptsForQuery, normalizeSearchText } from "./search-vocabulary";
import { decisionAppliesTo } from "./applicability-contexts";
import type { ApplicabilityContextId } from "./types";

export interface ExplorerFilters {
  query: string;
  domain: string;
  sourceSupport: string;
  corroboration: string;
  validationStatus: string;
  applicabilityContext: ApplicabilityContextId | "all";
}

export const emptyExplorerFilters: ExplorerFilters = {
  query: "",
  domain: "all",
  sourceSupport: "all",
  corroboration: "all",
  validationStatus: "all",
  applicabilityContext: "all",
};

export type SearchMatchType = "question_phrase" | "question_keywords" | "action" | "topic" | "alias";

export interface DecisionSearchResult {
  decision: Decision;
  matchType: SearchMatchType;
  score: number;
}

const containsAllTokens = (field: string, tokens: string[]) => tokens.every((token) => field.split(" ").includes(token));

export function rankDecisionsForQuery(decisions: Decision[], rawQuery: string): DecisionSearchResult[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) return decisions.map((decision) => ({ decision, matchType: "topic", score: 0 }));
  const tokens = query.split(" ");
  const concepts = conceptsForQuery(query);

  return decisions.flatMap((decision) => {
    const question = normalizeSearchText(decision.question);
    const action = normalizeSearchText(decision.decision_output);
    const domain = normalizeSearchText(decision.domain);
    const subdomain = normalizeSearchText(decision.subdomain);
    let result: DecisionSearchResult | null = null;

    if (question.includes(query)) result = { decision, matchType: "question_phrase", score: 500 };
    else if (containsAllTokens(question, tokens)) result = { decision, matchType: "question_keywords", score: 400 };
    else if (action.includes(query)) result = { decision, matchType: "action", score: 300 };
    else if (containsAllTokens(action, tokens)) result = { decision, matchType: "action", score: 280 };
    else if (domain.includes(query) || subdomain.includes(query)) result = { decision, matchType: "topic", score: 200 };

    const aliasRanks = concepts.flatMap((concept) => {
      const index = concept.decisionIds.indexOf(decision.id);
      return index === -1 ? [] : [120 - index];
    });
    const aliasScore = aliasRanks.length ? Math.max(...aliasRanks) : 0;
    if (!result && aliasScore) result = { decision, matchType: "alias", score: aliasScore };
    return result ? [result] : [];
  }).sort((a, b) => b.score - a.score || decisions.indexOf(a.decision) - decisions.indexOf(b.decision));
}

export function filterDecisions(decisions: Decision[], filters: ExplorerFilters) {
  const filtered = decisions.filter((decision) => {
    return (filters.domain === "all" || decision.domain === filters.domain)
      && (filters.applicabilityContext === "all" || decisionAppliesTo(decision, filters.applicabilityContext))
      && (filters.sourceSupport === "all" || decision.evidence_profile.source_support === filters.sourceSupport)
      && (filters.corroboration === "all" || decision.evidence_profile.corroboration === filters.corroboration)
      && (filters.validationStatus === "all" || decision.evidence_profile.validation_status === filters.validationStatus);
  });
  return rankDecisionsForQuery(filtered, filters.query).map((result) => result.decision);
}
