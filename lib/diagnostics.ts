import type {
  DiagnosticAnswers,
  DiagnosticIndicator,
  DiagnosticState,
  InstitutionProfile,
} from "./types";
import { applicabilityLabel } from "./applicability-contexts";
import type { ApplicabilityContextId } from "./types";

const yesNoUnsure = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

export const diagnosticIndicators: DiagnosticIndicator[] = [
  {
    id: "institution_type",
    dimension: "institution",
    question: "Which description best fits your institution?",
    helpText: "Choose the closest fit. This provides context; it does not assign a maturity level.",
    responseOptions: [
      { value: "community_college", label: "Community college" },
      { value: "liberal_arts", label: "Liberal arts college" },
      { value: "masters", label: "Master’s institution" },
      { value: "research_university", label: "Research university" },
      { value: "system", label: "University system" },
    ],
    relatedDecisionIds: ["STR-001"],
    stateMapping: { community_college: "community_college", liberal_arts: "liberal_arts", masters: "masters", research_university: "research_university", system: "system" },
  },
  {
    id: "primary_objective",
    dimension: "objectives",
    question: "Where is an institutional AI decision most pressing right now?",
    helpText: "Choose the area that should most influence your first three priorities.",
    responseOptions: [
      { value: "teaching_learning", label: "Teaching and learning" },
      { value: "research", label: "Research" },
      { value: "student_services", label: "Student services" },
      { value: "administration", label: "Administration" },
      { value: "workforce", label: "Workforce skills and support" },
    ],
    relatedDecisionIds: ["STR-001", "TL-001", "RES-002", "OPS-001", "PEO-001"],
    stateMapping: { teaching_learning: "teaching_learning", research: "research", student_services: "student_services", administration: "administration", workforce: "workforce" },
  },
  {
    id: "regulated_data",
    dimension: "data_scope",
    question: "What kind of data is involved?",
    helpText: "Choose the closest observable context. This helps route decisions; it does not determine which laws apply.",
    responseOptions: [
      { value: "public_non_sensitive_data", label: "Public / non-sensitive" },
      { value: "ferpa_education_records", label: "Student / education records" },
      { value: "hipaa_phi", label: "Health information" },
      { value: "human_subjects_research", label: "Human-subjects research data" },
      { value: "cui_controlled_research", label: "Controlled / contract-restricted research data" },
      { value: "indigenous_community_governed_data", label: "Indigenous / community-governed data" },
      { value: "general_sensitive_data", label: "Other sensitive institutional data" },
      { value: "unsure", label: "Not sure" },
    ],
    relatedDecisionIds: ["DAT-001", "DAT-002", "POL-005", "SEC-007"],
    stateMapping: {
      public_non_sensitive_data: "not_in_scope",
      ferpa_education_records: "ferpa_education_records",
      hipaa_phi: "hipaa_phi",
      human_subjects_research: "human_subjects_research",
      cui_controlled_research: "cui_controlled_research",
      indigenous_community_governed_data: "indigenous_community_governed_data",
      general_sensitive_data: "general_sensitive_data",
      unsure: "uncertain",
    },
  },
  {
    id: "governance_owner",
    dimension: "governance",
    question: "Is a named person, committee, or office responsible for institution-wide AI governance?",
    helpText: "Formal authority means an explicitly assigned role or charter, not simply an informal interest group.",
    responseOptions: [
      { value: "formal", label: "Yes, with formal authority" },
      { value: "informal", label: "Yes, but informally" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
    relatedDecisionIds: ["GOV-001", "GOV-002", "GOV-003"],
    stateMapping: { formal: "established", informal: "emerging", no: "none", unsure: "unknown" },
  },
  {
    id: "tool_review",
    dimension: "governance",
    question: "Is there a documented process for reviewing new AI tools or high-risk AI uses before adoption?",
    helpText: "A consistent process has defined reviewers or criteria and is used across the institution, not only by one unit.",
    responseOptions: [
      { value: "consistent", label: "Yes, consistently" },
      { value: "some", label: "Sometimes or only in some units" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
    relatedDecisionIds: ["POL-003", "PRO-002", "GOV-002"],
    stateMapping: { consistent: "established", some: "developing", no: "none", unsure: "unknown" },
  },
  {
    id: "ai_guidance",
    dimension: "governance",
    question: "Are institution-wide AI policies or guidelines formally approved and communicated?",
    helpText: "Count guidance only when people can find it and it has an identified institutional owner.",
    responseOptions: [
      { value: "approved", label: "Yes" },
      { value: "draft", label: "Draft or informal guidance only" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
    relatedDecisionIds: ["POL-001", "GOV-006"],
    stateMapping: { approved: "established", draft: "developing", no: "none", unsure: "unknown" },
  },
  {
    id: "data_classification",
    dimension: "data_governance",
    question: "Does the institution have a documented data classification scheme?",
    helpText: "A classification scheme distinguishes categories such as public, internal, sensitive, or restricted and ties them to handling rules.",
    responseOptions: yesNoUnsure,
    relatedDecisionIds: ["DAT-001", "SEC-001"],
    stateMapping: { yes: "established", no: "none", unsure: "unknown" },
  },
  {
    id: "external_ai_rules",
    dimension: "data_governance",
    question: "Are there explicit rules for what institutional data may be entered into external AI services?",
    helpText: "External services include public chatbots and vendor-hosted AI features outside institution-managed environments.",
    responseOptions: [
      { value: "explicit", label: "Yes, institution-wide rules" },
      { value: "partial", label: "Rules exist only in some units" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
    relatedDecisionIds: ["DAT-002", "DAT-004", "PRO-002"],
    stateMapping: { explicit: "established", partial: "developing", no: "none", unsure: "unknown" },
  },
  {
    id: "research_compute",
    dimension: "research_capacity",
    question: "Do researchers have access to supported GPU or AI-capable compute when needed?",
    helpText: "Supported access may be local, cloud-based, regional, or national; it should include a known path for requesting resources.",
    responseOptions: [
      { value: "reliable", label: "Yes, with a reliable support path" },
      { value: "limited", label: "Sometimes, but access is limited or ad hoc" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
    relatedDecisionIds: ["TEC-002", "RES-003", "RES-011"],
    stateMapping: { reliable: "established", limited: "developing", no: "limited", unsure: "unknown" },
  },
  {
    id: "research_expertise",
    dimension: "research_capacity",
    question: "Is staff expertise available to help researchers choose and use AI, HPC, or cloud resources?",
    helpText: "This means researchers can reach people who help translate a project need into an appropriate technical environment.",
    responseOptions: yesNoUnsure,
    relatedDecisionIds: ["RES-001", "PEO-005", "PEO-006"],
    stateMapping: { yes: "established", no: "limited", unsure: "unknown" },
  },
  {
    id: "secure_research_environment",
    dimension: "research_capacity",
    question: "Can the institution provide or access secure computing environments for restricted research data?",
    helpText: "Include approved partner or shared environments if researchers have a practical route to use them.",
    responseOptions: [
      { value: "yes", label: "Yes" },
      { value: "sometimes", label: "Only for some projects or data types" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
    relatedDecisionIds: ["SEC-007", "DAT-006", "RES-003"],
    stateMapping: { yes: "established", sometimes: "developing", no: "limited", unsure: "unknown" },
  },
  {
    id: "current_ai_use",
    dimension: "adoption",
    question: "Are faculty, staff, or students already using AI tools in institutional work?",
    helpText: "Consider both institution-provided tools and informal use of public or personally purchased services.",
    responseOptions: [
      { value: "widespread", label: "Yes, across many areas" },
      { value: "some", label: "Yes, in some areas" },
      { value: "no", label: "Not that we know of" },
      { value: "unsure", label: "Not sure" },
    ],
    relatedDecisionIds: ["STR-002", "POL-001", "PEO-001"],
    stateMapping: { widespread: "widespread", some: "emerging", no: "exploring", unsure: "unknown" },
  },
  {
    id: "embedded_vendor_ai",
    dimension: "adoption",
    question: "Are existing institutional vendors introducing embedded AI features?",
    helpText: "Examples include AI assistants, summarization, prediction, or generation added to products already under contract.",
    responseOptions: yesNoUnsure,
    relatedDecisionIds: ["PRO-001", "PRO-002", "EVA-005"],
    stateMapping: { yes: "active", no: "not_observed", unsure: "unknown" },
  },
  {
    id: "multi_unit_demand",
    dimension: "adoption",
    question: "Are multiple units actively piloting or requesting institutional AI services?",
    helpText: "Count separate schools, departments, or administrative functions—not multiple people within one team.",
    responseOptions: yesNoUnsure,
    relatedDecisionIds: ["STR-003", "TEC-001", "GOV-002"],
    stateMapping: { yes: "active", no: "not_observed", unsure: "unknown" },
  },
];

export const deriveGovernanceState = (answers: DiagnosticAnswers): InstitutionProfile["aiGovernanceMaturity"] => {
  if (answers.governance_owner === "formal" && answers.tool_review === "consistent" && answers.ai_guidance === "approved") return "formal";
  if (answers.governance_owner === "no" && answers.tool_review === "no" && answers.ai_guidance === "no") return "none";
  return "informal";
};

export const deriveDataGovernanceState = (answers: DiagnosticAnswers): InstitutionProfile["dataGovernanceMaturity"] => {
  if (answers.data_classification === "yes" && answers.external_ai_rules === "explicit") return "strong";
  if (answers.data_classification === "no" && answers.external_ai_rules === "no") return "weak";
  return "developing";
};

export const deriveResearchCapacityState = (answers: DiagnosticAnswers): InstitutionProfile["researchComputingCapacity"] => {
  const established = [answers.research_compute === "reliable", answers.research_expertise === "yes", answers.secure_research_environment === "yes"].filter(Boolean).length;
  if (established === 3) return "strong";
  if (established >= 2 || answers.research_compute === "limited" || answers.secure_research_environment === "sometimes") return "moderate";
  return "limited";
};

export const deriveAdoptionState = (answers: DiagnosticAnswers): InstitutionProfile["aiAdoptionLevel"] => {
  if (answers.current_ai_use === "widespread" || (answers.current_ai_use === "some" && answers.embedded_vendor_ai === "yes" && answers.multi_unit_demand === "yes")) return "widespread";
  if (answers.current_ai_use === "some" || answers.embedded_vendor_ai === "yes" || answers.multi_unit_demand === "yes") return "emerging";
  return "exploring";
};

export function deriveInstitutionProfile(answers: DiagnosticAnswers): InstitutionProfile {
  const researchCapacity = deriveResearchCapacityState(answers);
  const researchObjective = answers.primary_objective === "research";
  return {
    institutionType: (answers.institution_type as InstitutionProfile["institutionType"]) || "masters",
    institutionScale: "medium",
    researchIntensity: researchObjective ? "moderate" : "low",
    itCapacity: researchCapacity,
    researchComputingCapacity: researchCapacity,
    aiGovernanceMaturity: deriveGovernanceState(answers),
    dataGovernanceMaturity: deriveDataGovernanceState(answers),
    securityMaturity: answers.secure_research_environment === "yes" ? "strong" : answers.secure_research_environment === "no" ? "weak" : "developing",
    aiAdoptionLevel: deriveAdoptionState(answers),
    primaryObjectives: [(answers.primary_objective as InstitutionProfile["primaryObjectives"][number]) || "teaching_learning"],
    regulatedDataUsage: answers.regulated_data !== "no" && answers.regulated_data !== "public_non_sensitive_data",
    budgetFlexibility: "moderate",
    aiExpertise: answers.research_expertise === "yes" ? "strong" : answers.research_expertise === "no" ? "limited" : "moderate",
    accessibilityMaturity: "developing",
  };
}

export function summarizeDiagnostics(answers: DiagnosticAnswers): string[] {
  const observations: string[] = [];
  if (answers.current_ai_use === "widespread") observations.push("AI use is already occurring across many institutional areas.");
  else if (answers.current_ai_use === "some") observations.push("AI use is already occurring in some institutional areas.");
  else if (answers.current_ai_use === "no") observations.push("No current institutional AI use was identified.");
  else observations.push("The current extent of institutional AI use is uncertain.");

  if (answers.governance_owner === "formal") observations.push("A formally authorized AI governance owner is in place.");
  else if (answers.governance_owner === "informal") observations.push("AI governance ownership exists, but it is informal.");
  else if (answers.governance_owner === "no") observations.push("No institution-wide AI governance owner is in place.");
  else observations.push("Institution-wide AI governance ownership is uncertain.");

  if (answers.tool_review === "consistent") observations.push("A consistent AI tool-review process is documented.");
  else if (answers.tool_review === "some") observations.push("AI tool review occurs only in some units or situations.");
  else if (answers.tool_review === "no") observations.push("There is no documented AI tool-review process.");
  else observations.push("Whether AI tools receive consistent review is uncertain.");

  if (answers.regulated_data === "yes") observations.push("Sensitive or regulated data is in scope.");
  else if (answers.regulated_data === "unsure") observations.push("Whether sensitive or regulated data is in scope is uncertain.");
  else if (answers.regulated_data && answers.regulated_data !== "public_non_sensitive_data" && answers.regulated_data !== "no") {
    observations.push(`${applicabilityLabel(answers.regulated_data as ApplicabilityContextId)} may be involved.`);
  }

  const capacity = deriveResearchCapacityState(answers);
  if (capacity === "limited") observations.push("Research AI compute and support capacity appears limited.");
  else if (capacity === "moderate") observations.push("Research AI capacity exists, but access or support is uneven.");
  else observations.push("Researchers have supported compute, expertise, and secure-environment access.");
  return observations;
}

export function createDiagnosticState(answers: DiagnosticAnswers): DiagnosticState {
  return {
    version: 1,
    answers,
    profile: deriveInstitutionProfile(answers),
    observations: summarizeDiagnostics(answers),
  };
}

export function parseDiagnosticState(value: string): DiagnosticState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as DiagnosticState;
    return parsed.version === 1 && parsed.answers && parsed.profile && Array.isArray(parsed.observations) ? parsed : null;
  } catch {
    return null;
  }
}
