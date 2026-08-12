import { evaluateProfile } from "./engine";
import { intentsById } from "./intents";
import { decisionsById, ontology, splitField } from "./ontology";
import type {
  Decision,
  InstitutionProfile,
  IntentAnswers,
  IntentId,
  IntentRecommendation,
  IntentRecommendationStatus,
  IntentRoadmap,
} from "./types";

const plainTitles: Record<string, string> = {
  "STR-001": "Agree on the outcomes AI should advance",
  "STR-002": "Understand where AI is already in use",
  "STR-003": "Prioritize which AI uses to pursue",
  "STR-004": "Define the scope of institutional AI policy",
  "GOV-001": "Establish who oversees institutional AI",
  "GOV-002": "Clarify central and local decision rights",
  "GOV-003": "Include the right voices in AI governance",
  "GOV-004": "Assign an accountable owner for each AI system",
  "GOV-007": "Keep people accountable for consequential decisions",
  "POL-001": "Set clear acceptable-use rules",
  "POL-003": "Classify AI uses by risk",
  "POL-005": "Map legal and institutional requirements",
  "POL-009": "Set required AI contract terms",
  "DAT-001": "Apply data classification rules to AI",
  "DAT-002": "Set rules for sensitive data in public AI tools",
  "SEC-007": "Provide a secure environment for restricted research data",
  "TEC-001": "Define the workload before choosing infrastructure",
  "TEC-002": "Estimate the resources the workload requires",
  "TEC-003": "Choose the right hosting environment",
  "TEC-004": "Test the case for dedicated GPU infrastructure",
  "TEC-010": "Plan who will sustain the service",
  "PRO-001": "Identify AI features already added by vendors",
  "PRO-002": "Complete AI-specific vendor due diligence",
  "PRO-005": "Review the tool for accessibility",
  "PEO-001": "Define an institution-wide AI literacy baseline",
  "PEO-002": "Prioritize who should be trained first",
  "PEO-003": "Choose how training will be delivered and refreshed",
  "PEO-004": "Give users a clear place to get AI help",
  "PEO-006": "Consider sharing specialized AI expertise",
  "TL-001": "Give courses clear AI-use guidance",
  "TL-002": "Prioritize assessments for redesign",
  "TL-006": "Define what students should learn about AI",
  "RES-002": "Translate the research question into a feasible AI problem",
  "RES-003": "Create a complete research resource plan",
  "RES-008": "Plan for reproducible research",
  "RES-011": "Consider national or shared AI infrastructure",
  "OPS-001": "Understand where administrative AI is already in use",
  "OPS-002": "Set limits for AI in consequential decisions",
  "OPS-003": "Choose which workflow steps are suitable for automation",
  "EVA-001": "Define how success will be measured",
  "ACC-001": "Set accessibility requirements for AI tools",
};

const directPrerequisites = new Map<string, string[]>();
for (const relationship of ontology.relationships) {
  if (relationship.relationship !== "prerequisite_for") continue;
  directPrerequisites.set(relationship.to, [
    ...(directPrerequisites.get(relationship.to) ?? []),
    relationship.from,
  ]);
}

function prerequisiteClosure(ids: string[]) {
  const found: string[] = [];
  const visited = new Set<string>(ids);
  const visit = (id: string) => {
    for (const prerequisite of directPrerequisites.get(id) ?? []) {
      if (visited.has(prerequisite)) continue;
      visited.add(prerequisite);
      found.push(prerequisite);
      visit(prerequisite);
    }
  };
  ids.forEach(visit);
  return found;
}

function humanReason(intentId: IntentId, decision: Decision, answers: IntentAnswers, profile?: InstitutionProfile) {
  if (decision.id === "DAT-001" && (answers.data_access === "sensitive" || answers.research_data === "sensitive" || profile?.regulatedDataUsage)) {
    return "Sensitive or regulated data is in scope, so its handling requirements need to be clear before the work proceeds.";
  }
  if (decision.id === "DAT-002") return "People need a clear rule for what may be entered into public or consumer AI services.";
  if (decision.id === "PRO-002") return "A new AI product needs consistent review of privacy, security, performance, and vendor practices before approval.";
  if (decision.id === "PRO-005") return "A student-facing or broadly required tool should be checked for accessibility and accommodation needs before adoption.";
  if (decision.id === "POL-009") return "The agreement should protect institutional data and define responsibilities before a new vendor is engaged.";
  if (decision.id === "RES-002") return "Starting with a testable research question prevents infrastructure or model choices from driving the project.";
  if (decision.id === "RES-003") return "The project needs a realistic plan for compute, storage, software, networking, and staff support.";
  if (decision.id === "SEC-007") return "Restricted research data requires a controlled environment matched to its agreements and oversight requirements.";
  if (decision.id === "RES-011") return "Limited local capacity makes shared or national infrastructure worth evaluating before a local purchase.";
  if (decision.id === "RES-008") return "Published or revisited work needs versions of data, code, models, and environments to be recorded.";
  if (decision.id === "TL-001") return "AI use is emerging in coursework, so students and instructors need clear expectations at course and assignment level.";
  if (decision.id === "PEO-001") return "Consistent AI guidance depends on a shared baseline of practical literacy for students, faculty, staff, and leaders.";
  if (decision.id === "ACC-001") return "Accessibility expectations should be defined before AI tools become embedded in required learning experiences.";
  if (decision.id === "GOV-001" && (answers.governance === "no" || profile?.aiGovernanceMaturity !== "formal")) {
    return "AI activity is moving ahead without a formal governance process, so clear ownership should come before expansion.";
  }
  if (decision.id === "POL-001") return "Institution-wide acceptable-use guardrails support consistent local guidance and decisions.";
  if (decision.id === "TEC-001") return "Infrastructure choices should follow a clear description of the workload they must support.";
  if (decision.id === "TEC-004") return "A dedicated GPU purchase should follow evidence of recurring demand, sizing, and full lifecycle cost.";
  if (decision.id === "GOV-007" || decision.id === "OPS-002") return "AI that affects people requires explicit limits and meaningful human accountability.";
  return `This is one of the decisions that most directly advances your goal to ${intentsById.get(intentId)!.title.toLowerCase()}.`;
}

function recommendation(
  intentId: IntentId,
  decisionId: string,
  status: IntentRecommendationStatus,
  answers: IntentAnswers,
  profile?: InstitutionProfile,
): IntentRecommendation {
  const decision = decisionsById.get(decisionId);
  if (!decision) throw new Error(`Unknown ontology decision in intent metadata: ${decisionId}`);
  return {
    decisionId,
    status,
    plainLanguageTitle: plainTitles[decisionId] ?? decision.question,
    reason: humanReason(intentId, decision, answers, profile),
    recommendedAction: decision.decision_output,
    prerequisites: directPrerequisites.get(decisionId) ?? [],
    evidenceSourceIds: splitField(decision.source_ids),
  };
}

function unique(ids: string[]) {
  return [...new Set(ids)];
}

function targetedSelection(intentId: Exclude<IntentId, "getting-started">, answers: IntentAnswers) {
  const intent = intentsById.get(intentId)!;
  let primary = [...intent.seedDecisionIds];
  const conditional: string[] = [];
  let excluded: string[] = [];

  switch (intentId) {
    case "evaluate-tool":
      primary = ["PRO-002"];
      if (answers.data_access !== "public") primary.push("DAT-001");
      if (answers.tool_type === "student" || answers.tool_type === "teaching") primary.push("PRO-005");
      if (answers.purchase_type === "new") primary.push("POL-009");
      if (answers.purchase_type === "existing") primary.push("PRO-001");
      if (answers.people_decisions === "yes") primary.push("OPS-002");
      if (answers.data_access === "sensitive") conditional.push("DAT-002");
      excluded = ["TEC-004", "RES-002", "RES-003"];
      break;
    case "support-research":
      primary = ["RES-002", "RES-003"];
      if (answers.research_data === "sensitive") primary.push("SEC-007");
      if (answers.local_compute === "limited") primary.push("RES-011");
      if (answers.research_output !== "no") primary.push("RES-008");
      excluded = ["TL-001", "TL-002"];
      break;
    case "teaching-learning":
      primary = ["TL-001", "PEO-001", "ACC-001"];
      if (answers.assessment === "yes") primary.push("TL-002");
      if (answers.ai_use === "widespread") primary.push("TL-006");
      excluded = ["EVA-004", "SEC-005"];
      break;
    case "create-governance":
      primary = ["GOV-001", "GOV-003"];
      if (answers.decentralized !== "no") primary.push("GOV-002");
      if (answers.deployed === "yes") primary.push("GOV-004");
      if (answers.consequential === "yes") primary.push("GOV-007");
      break;
    case "develop-policy":
      primary = ["POL-001", "POL-003"];
      if (answers.sensitive_data !== "no") primary.push("DAT-002", "POL-005");
      if (answers.procurement === "yes") primary.push("POL-009");
      if (answers.consequential === "yes") conditional.push("GOV-007");
      break;
    case "set-direction":
      primary = ["STR-001"];
      if (answers.current_use !== "no") primary.push("STR-002");
      if (answers.priority_pressure !== "no") primary.push("STR-003");
      primary.push("STR-004");
      break;
    case "infrastructure":
      primary = ["TEC-001", "TEC-002", "TEC-003"];
      if (answers.demand === "recurring" || answers.demand === "multiple") conditional.push("TEC-004");
      primary.push("TEC-010");
      break;
    case "skills-support":
      primary = ["PEO-001", "PEO-002"];
      if (answers.demand !== "no") primary.push("PEO-003");
      if (answers.support !== "yes") primary.push("PEO-004");
      if (answers.expertise === "limited") primary.push("PEO-006");
      break;
    case "administrative-automation":
      primary = ["OPS-001", "OPS-003", "EVA-001"];
      if (answers.people_decisions === "yes") primary.push("OPS-002", "GOV-007");
      break;
  }

  return { primary: unique(primary).slice(0, 5), conditional: unique(conditional), excluded: unique(excluded) };
}

function evaluateGeneral(profile: InstitutionProfile): IntentRoadmap {
  const selected: string[] = [];
  selected.push(profile.aiGovernanceMaturity === "formal" ? "STR-002" : "GOV-001");
  selected.push(profile.regulatedDataUsage || profile.dataGovernanceMaturity !== "strong" ? "DAT-001" : "POL-003");
  if (profile.primaryObjectives.includes("teaching_learning")) selected.push("TL-001");
  else if (profile.primaryObjectives.includes("research")) selected.push("RES-002");
  else if (profile.primaryObjectives.includes("administration")) selected.push("OPS-001");
  else selected.push("PEO-001");

  // Preserve the profile engine as a deterministic fallback without exposing its catalog.
  for (const item of evaluateProfile(profile)) {
    if (selected.length === 3) break;
    if (!selected.includes(item.decisionId)) selected.push(item.decisionId);
  }
  const primary = selected.slice(0, 3).map((id) => recommendation("getting-started", id, "PRIMARY", {}, profile));
  const nextIds = prerequisiteClosure(selected).filter((id) => !selected.includes(id)).slice(0, 3);
  return {
    intentId: "getting-started",
    primary,
    next: nextIds.map((id) => recommendation("getting-started", id, "NEXT", {}, profile)),
    conditional: [],
    notRecommendedNow: [],
    timeline: primary.map((item, index) => ({
      period: (["0–30 days", "30–60 days", "60–90 days"] as const)[index],
      decisionId: item.decisionId,
    })),
  };
}

export function evaluateIntent(
  intentId: IntentId,
  answers: IntentAnswers,
  profile?: InstitutionProfile,
): IntentRoadmap {
  if (intentId === "getting-started") {
    if (!profile) throw new Error("The general pathway requires an institution profile");
    return evaluateGeneral(profile);
  }
  const selection = targetedSelection(intentId, answers);
  const preferredNext: Partial<Record<IntentId, string[]>> = {
    "teaching-learning": ["GOV-001", "POL-001"],
    "evaluate-tool": ["POL-003"],
    "infrastructure": ["STR-006", "PRO-006"],
  };
  const nextIds = unique([...(preferredNext[intentId] ?? []), ...prerequisiteClosure(selection.primary)])
    .filter((id) => !selection.primary.includes(id))
    .slice(0, 4);
  return {
    intentId,
    primary: selection.primary.map((id) => recommendation(intentId, id, "PRIMARY", answers, profile)),
    next: nextIds.map((id) => recommendation(intentId, id, "NEXT", answers, profile)),
    conditional: selection.conditional.map((id) => recommendation(intentId, id, "CONDITIONAL", answers, profile)),
    notRecommendedNow: selection.excluded.map((id) => recommendation(intentId, id, "NOT_RECOMMENDED_NOW", answers, profile)),
  };
}
