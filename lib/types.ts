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
export type ApplicabilityContextId =
  | "general_sensitive_data"
  | "public_non_sensitive_data"
  | "ferpa_education_records"
  | "hipaa_phi"
  | "hipaa_ephi"
  | "consumer_health_data"
  | "part2_sud_records"
  | "human_subjects_research"
  | "cui_controlled_research"
  | "contract_restricted_data"
  | "indigenous_community_governed_data";

export interface ApplicabilityContext {
  id: ApplicabilityContextId;
  label: string;
  description: string;
  category: "general" | "education" | "health" | "research" | "contractual" | "community";
  aliases: string[];
  relatedDecisionIds: string[];
  primary: boolean;
  parentId?: ApplicabilityContextId;
}

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
  version: "0.3.3";
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

export type DiagnosticDimension =
  | "institution"
  | "objectives"
  | "data_scope"
  | "governance"
  | "data_governance"
  | "research_capacity"
  | "adoption";

export interface DiagnosticResponseOption {
  value: string;
  label: string;
}

export interface DiagnosticIndicator {
  id: string;
  dimension: DiagnosticDimension;
  question: string;
  helpText: string;
  responseOptions: DiagnosticResponseOption[];
  relatedDecisionIds: string[];
  stateMapping: Record<string, string>;
}

export type DiagnosticAnswers = Record<string, string>;

export interface DiagnosticState {
  version: 1;
  answers: DiagnosticAnswers;
  profile: InstitutionProfile;
  observations: string[];
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
export interface NavigatorSession {
  version: 1;
  intentId: IntentId;
  answers: IntentAnswers;
  entryMode: "guided" | "situation" | "shortcut";
}

export interface InstitutionContextState {
  version: 1;
  profile: InstitutionProfile;
}

export type SituationTopic =
  | "strategy"
  | "governance"
  | "policy"
  | "procurement"
  | "research"
  | "infrastructure"
  | "teaching_learning"
  | "skills_support"
  | "operations"
  | "unknown";

export interface SituationContext {
  topic: SituationTopic;
  institutionType: InstitutionProfile["institutionType"] | "unknown";
  institutionScale: InstitutionProfile["institutionScale"] | "unknown";
  adoption: InstitutionProfile["aiAdoptionLevel"] | "unknown";
  governance: InstitutionProfile["aiGovernanceMaturity"] | "unknown";
  policy: "approved" | "draft" | "none" | "unknown";
  dataSensitivity: "public" | "internal" | "sensitive" | "unknown";
  procurement: "new" | "existing" | "none" | "unknown";
  peopleImpact: "yes" | "no" | "unknown";
  applicabilityContextIds: ApplicabilityContextId[];
}

export interface SituationState {
  version: 1;
  rawText: string;
  context: SituationContext;
  observations: string[];
  confirmed: boolean;
}

export type ValidatorRole =
  | "cio_it_leadership"
  | "research_computing"
  | "faculty"
  | "research_administration"
  | "teaching_learning"
  | "library"
  | "privacy_security_compliance"
  | "accessibility"
  | "senior_leadership"
  | "student"
  | "other";

export interface ValidatorProfile {
  version: 1;
  role: ValidatorRole | "";
  institutionType: InstitutionProfile["institutionType"] | "";
  institutionSize: "under_2500" | "2500_5000" | "5000_15000" | "over_15000" | "prefer_not" | "";
}

export interface DecisionFeedback {
  decisionId: string;
  relevance: "yes" | "depends" | "no" | "unsure" | "";
  clarity: "yes" | "mostly" | "no" | "";
  sequencing: "earlier" | "about_here" | "later" | "depends" | "";
  comments: string;
  updatedAt: string;
}

export interface RelationshipFeedback {
  from: string;
  to: string;
  response: "yes" | "depends" | "no" | "unsure" | "";
  comments: string;
  updatedAt: string;
}
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
