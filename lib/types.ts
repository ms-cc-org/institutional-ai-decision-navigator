export type MaturityStage = "Foundation" | "Developing" | "Advanced";
export type Priority = "DO_NOW" | "DO_NEXT" | "LATER" | "NOT_CURRENTLY_RELEVANT";
export type DecisionCategory =
  | "STRATEGY"
  | "GOVERNANCE"
  | "POLICY_RISK_COMPLIANCE"
  | "DATA_PRIVACY"
  | "SECURITY_IDENTITY"
  | "PROCUREMENT_VENDOR"
  | "TECHNOLOGY_INFRASTRUCTURE"
  | "WORKFORCE_SUPPORT"
  | "TEACHING_LEARNING"
  | "RESEARCH"
  | "ADMINISTRATIVE_OPERATIONS"
  | "ACCESSIBILITY_EQUITY"
  | "EVALUATION_LIFECYCLE";
export type ValidationStatus = "not_validated" | "practitioner_supported" | "mixed" | "challenged";

export interface Source {
  id: string;
  title: string;
  publisher: string;
  year: number | null;
  source_type: string;
  geography: string;
  url: string | null;
  notes?: string | null;
  verification:
    | "verified"
    | "verified_from_user_source"
    | "verified_title_date"
    | "verified_with_scope_correction"
    | "verified_with_year_correction";
}

export interface EvidenceProfile {
  source_support: "direct" | "synthesized" | "contextual";
  corroboration: "multiple_independent_sources" | "partial" | "none";
  evidence_breadth: number;
  specificity: "specific" | "general" | "mixed";
  validation_status: ValidationStatus;
  notes: string;
}

export interface EvidenceLink {
  source_id: string;
  support_type: "direct" | "corroborating" | "contextual" | "researcher_synthesis";
  specificity: "specific" | "general";
  claim_supported: string;
  source_location: string | null;
  notes: string;
}

export interface Decision {
  id: string;
  domain: string;
  subdomain: string;
  question: string;
  decision_type: string;
  decision_type_original: string;
  decision_category: DecisionCategory;
  trigger: string;
  context_variables: string;
  options: string;
  recommendation_logic: string;
  primary_risks: string;
  stakeholders: string;
  source_ids: string;
  evidence_profile: EvidenceProfile;
  evidence_links: EvidenceLink[];
  maturity_stage: MaturityStage;
  decision_output: string;
}
export interface Relationship {
  from: string;
  to: string;
  relationship: "prerequisite_for" | "related_to";
  rationale: string;
  provenance: {
    basis: "source_explicit" | "source_synthesized" | "researcher_inferred";
    confidence: "high" | "moderate" | "low";
    supporting_source_ids: string[];
    validation_status: "not_validated";
    notes: string;
  };
}
export interface Ontology {
  version: "0.3.2";
  description: string;
  sources: Source[];
  decisions: Decision[];
  relationships: Relationship[];
}

export interface InstitutionProfile {
  institutionType: "community_college" | "liberal_arts" | "masters" | "research_university" | "system";
  institutionScale: "small" | "medium" | "large";
  researchIntensity: "low" | "moderate" | "high";
  itCapacity: "limited" | "moderate" | "strong";
  researchComputingCapacity: "limited" | "moderate" | "strong";
  aiGovernanceMaturity: "none" | "informal" | "formal";
  dataGovernanceMaturity: "weak" | "developing" | "strong";
  securityMaturity: "weak" | "developing" | "strong";
  aiAdoptionLevel: "exploring" | "emerging" | "widespread";
  primaryObjectives: Array<"teaching_learning" | "research" | "student_services" | "administration" | "workforce">;
  regulatedDataUsage: boolean;
  budgetFlexibility: "limited" | "moderate" | "flexible";
  aiExpertise: "limited" | "moderate" | "strong";
  accessibilityMaturity: "weak" | "developing" | "strong";
}
export interface Recommendation {
  decisionId: string;
  priority: Priority;
  reasons: string[];
  prerequisites: string[];
  evidenceSourceIds: string[];
  /** Internal ordering value from the documented, deterministic rules. */
  score: number;
}

export type IntentId =
  | "set-direction"
  | "create-governance"
  | "develop-policy"
  | "evaluate-tool"
  | "support-research"
  | "infrastructure"
  | "teaching-learning"
  | "skills-support"
  | "administrative-automation"
  | "getting-started";

export interface IntentAnswerOption {
  value: string;
  label: string;
}

export interface IntentContextQuestion {
  id: string;
  prompt: string;
  helpText?: string;
  options: IntentAnswerOption[];
}

export interface Intent {
  id: IntentId;
  title: string;
  description: string;
  relevantDomains: string[];
  seedDecisionIds: string[];
  contextQuestions: IntentContextQuestion[];
}

export type IntentAnswers = Record<string, string>;
export type IntentRecommendationStatus =
  | "PRIMARY"
  | "NEXT"
  | "CONDITIONAL"
  | "NOT_RECOMMENDED_NOW";

export interface IntentRecommendation {
  decisionId: string;
  status: IntentRecommendationStatus;
  plainLanguageTitle: string;
  reason: string;
  recommendedAction: string;
  prerequisites: string[];
  evidenceSourceIds: string[];
}

export interface IntentRoadmap {
  intentId: IntentId;
  primary: IntentRecommendation[];
  next: IntentRecommendation[];
  conditional: IntentRecommendation[];
  notRecommendedNow: IntentRecommendation[];
  timeline?: Array<{ period: "0–30 days" | "30–60 days" | "60–90 days"; decisionId: string }>;
}
