import type {
  Decision,
  InstitutionProfile,
  MaturityStage,
  Priority,
  Recommendation,
} from "./types";
import { ontology, splitField } from "./ontology";

/** Public so the ranking contract can be inspected and tested. */
export const RANKING_RULES = {
  stageBase: { Foundation: 32, Developing: 18, Advanced: 8 },
  thresholds: { DO_NOW: 48, DO_NEXT: 28, LATER: 8 },
  adjustments: {
    activeAdoptionTrigger: 10,
    operationalAtScale: 8,
    governanceGap: 20,
    matureFoundation: -12,
    regulatedData: 16,
    weakDataGovernance: 16,
    strongDataGovernance: -10,
    highResearch: 18,
    researchAdjacent: 10,
    moderateResearch: 6,
    lowResearch: -36,
    objective: 18,
    limitedCapacitySupport: 16,
    limitedGpuReadiness: -30,
    strongComputingReadiness: 10,
    weakSecurity: 14,
    advancedSecurityReadiness: 16,
    matureAdvancedReadiness: 24,
    accessibilityGap: 12,
    limitedBudgetInvestment: -12,
    prerequisite: -4,
  },
} as const;

const governanceGapDomains = new Set([
  "Strategy & Portfolio",
  "Governance & Accountability",
  "Policy, Compliance & Risk",
  "Data Governance & Privacy",
  "Procurement & Vendor Management",
  "Workforce, Training & Support",
]);
const operationalWords = ["active", "deployed", "embedded", "live", "operational", "remains in use", "relies on"];
const adoptionWords = ["ai use", "using", "users", "available", "vendor", "adoption", "coursework", "procur", "renew"];
const sensitiveDataWords = ["regulated", "sensitive", "pii", "phi", "cui", "privacy", "restricted data", "student", "employee"];
const supportWords = ["shared", "support", "training", "literacy", "facilitat", "build, buy", "partner", "national"];
const investmentWords = ["purchase", "investment", "infrastructure", "platform commitment", "full lifecycle cost"];

const priorityOrder: Record<Priority, number> = {
  NOT_CURRENTLY_RELEVANT: 0,
  LATER: 1,
  DO_NEXT: 2,
  DO_NOW: 3,
};
const stageOrder: Record<MaturityStage, number> = {
  Foundation: 0,
  Developing: 1,
  Advanced: 2,
};

function includesAny(text: string, words: readonly string[]) {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word));
}

function decisionText(decision: Decision) {
  return `${decision.domain} ${decision.subdomain} ${decision.question} ${decision.trigger} ${decision.context_variables}`.toLowerCase();
}

function scoreToPriority(score: number): Priority {
  if (score >= RANKING_RULES.thresholds.DO_NOW) return "DO_NOW";
  if (score >= RANKING_RULES.thresholds.DO_NEXT) return "DO_NEXT";
  if (score >= RANKING_RULES.thresholds.LATER) return "LATER";
  return "NOT_CURRENTLY_RELEVANT";
}

function capPriority(priority: Priority, cap: Priority): Priority {
  return priorityOrder[priority] > priorityOrder[cap] ? cap : priority;
}

function objectiveMatch(profile: InstitutionProfile, decision: Decision) {
  if (profile.primaryObjectives.includes("teaching_learning")) {
    if (
      decision.domain === "Teaching, Learning & Student Experience" ||
      decision.domain === "Accessibility, Equity & Community"
    ) return "Teaching and learning is a stated institutional objective.";
  }
  if (profile.primaryObjectives.includes("research") && decision.domain === "Research & Research Computing") {
    return "Research is a stated institutional objective.";
  }
  if (profile.primaryObjectives.includes("administration") && decision.domain === "Administrative & Operational AI") {
    return "Administrative improvement is a stated institutional objective.";
  }
  if (profile.primaryObjectives.includes("workforce") && decision.domain === "Workforce, Training & Support") {
    return "Workforce productivity is a stated institutional objective.";
  }
  if (profile.primaryObjectives.includes("student_services") && includesAny(decisionText(decision), ["student", "advising", "service"])) {
    return "Student services is a stated institutional objective.";
  }
}

function hasFoundationReadiness(profile: InstitutionProfile) {
  return (
    profile.aiGovernanceMaturity === "formal" &&
    profile.dataGovernanceMaturity === "strong" &&
    profile.securityMaturity === "strong"
  );
}

/**
 * Evaluates every canonical ontology decision with explicit rules. Adjustments are
 * always paired with a user-visible explanation; the score is only an ordering aid.
 */
export function evaluateProfile(profile: InstitutionProfile): Recommendation[] {
  const prerequisites = new Map<string, string[]>();
  for (const relationship of ontology.relationships) {
    if (relationship.relationship !== "prerequisite_for") continue;
    prerequisites.set(relationship.to, [
      ...(prerequisites.get(relationship.to) ?? []),
      relationship.from,
    ]);
  }

  return ontology.decisions
    .map((decision) => {
      let score = RANKING_RULES.stageBase[decision.maturity_stage];
      const reasons = [`The ontology classifies this as a ${decision.maturity_stage} decision.`];
      const text = decisionText(decision);
      const prereqs = prerequisites.get(decision.id) ?? [];
      const adjust = (amount: number, reason: string) => {
        score += amount;
        reasons.push(reason);
      };

      if (profile.aiAdoptionLevel !== "exploring" && includesAny(decision.trigger, adoptionWords)) {
        adjust(
          RANKING_RULES.adjustments.activeAdoptionTrigger,
          `Your ${profile.aiAdoptionLevel} adoption matches the ontology trigger: “${decision.trigger}.”`,
        );
      }
      if (profile.aiAdoptionLevel === "widespread" && includesAny(decision.trigger, operationalWords)) {
        adjust(RANKING_RULES.adjustments.operationalAtScale, "Widespread use makes operational and lifecycle controls timely.");
      }
      if (profile.aiGovernanceMaturity === "none" && governanceGapDomains.has(decision.domain)) {
        adjust(RANKING_RULES.adjustments.governanceGap, "AI adoption without established governance increases urgency.");
      }
      if (
        profile.aiGovernanceMaturity === "formal" &&
        decision.maturity_stage === "Foundation" &&
        governanceGapDomains.has(decision.domain)
      ) {
        adjust(RANKING_RULES.adjustments.matureFoundation, "Formal governance reduces the urgency of foundational setup.");
      }
      if (profile.regulatedDataUsage && includesAny(text, sensitiveDataWords)) {
        adjust(RANKING_RULES.adjustments.regulatedData, "Sensitive or regulated data requires earlier controls.");
      }
      if (profile.dataGovernanceMaturity === "weak" && decision.domain === "Data Governance & Privacy") {
        adjust(RANKING_RULES.adjustments.weakDataGovernance, "Weak data governance makes this data decision more urgent.");
      }
      if (
        profile.dataGovernanceMaturity === "strong" &&
        decision.domain === "Data Governance & Privacy" &&
        decision.maturity_stage === "Foundation"
      ) {
        adjust(RANKING_RULES.adjustments.strongDataGovernance, "Strong data governance lowers immediate setup urgency.");
      }
      if (profile.researchIntensity === "high" && decision.domain === "Research & Research Computing") {
        adjust(RANKING_RULES.adjustments.highResearch, "High research intensity makes research AI planning directly relevant.");
      } else if (
        profile.researchIntensity === "high" &&
        includesAny(text, ["research", "model", "compute", "sustainab"])
      ) {
        adjust(RANKING_RULES.adjustments.researchAdjacent, "High research intensity makes this adjacent model or infrastructure decision timely.");
      } else if (profile.researchIntensity === "moderate" && decision.domain === "Research & Research Computing") {
        adjust(RANKING_RULES.adjustments.moderateResearch, "Moderate research activity makes this relevant, though not always immediate.");
      } else if (profile.researchIntensity === "low" && decision.domain === "Research & Research Computing") {
        adjust(RANKING_RULES.adjustments.lowResearch, "Low research intensity makes research-computing work premature.");
      }

      const objectiveReason = objectiveMatch(profile, decision);
      if (objectiveReason) adjust(RANKING_RULES.adjustments.objective, objectiveReason);

      if (
        (profile.aiExpertise === "limited" || profile.itCapacity === "limited") &&
        includesAny(text, supportWords)
      ) {
        adjust(RANKING_RULES.adjustments.limitedCapacitySupport, "Limited internal capacity increases the value of training or shared support.");
      }
      if (profile.researchComputingCapacity === "limited" && decision.id === "TEC-004") {
        adjust(RANKING_RULES.adjustments.limitedGpuReadiness, "Dedicated GPU purchasing is premature before workload and capacity planning.");
      }
      if (
        profile.researchComputingCapacity === "strong" &&
        (decision.domain === "Research & Research Computing" || decision.domain === "Technology & Infrastructure") &&
        decision.maturity_stage !== "Foundation"
      ) {
        adjust(RANKING_RULES.adjustments.strongComputingReadiness, "Strong research-computing capacity makes scaled technical work actionable.");
      }
      if (
        profile.securityMaturity === "weak" &&
        decision.domain === "Security, Identity & Access" &&
        decision.maturity_stage !== "Advanced"
      ) {
        adjust(RANKING_RULES.adjustments.weakSecurity, "Weak security maturity increases the urgency of baseline AI security controls.");
      }
      if (
        profile.securityMaturity === "strong" &&
        decision.domain === "Security, Identity & Access" &&
        decision.maturity_stage === "Advanced"
      ) {
        adjust(RANKING_RULES.adjustments.advancedSecurityReadiness, "Strong security maturity makes advanced security controls actionable.");
      }
      if (
        hasFoundationReadiness(profile) &&
        profile.aiAdoptionLevel === "widespread" &&
        decision.maturity_stage === "Advanced"
      ) {
        adjust(RANKING_RULES.adjustments.matureAdvancedReadiness, "Mature foundations and widespread adoption make advanced lifecycle work actionable.");
      }
      if (profile.accessibilityMaturity !== "strong" && decision.domain === "Accessibility, Equity & Community") {
        adjust(RANKING_RULES.adjustments.accessibilityGap, "Accessibility capabilities need attention before AI use scales.");
      }
      if (profile.budgetFlexibility === "limited" && includesAny(text, investmentWords)) {
        adjust(RANKING_RULES.adjustments.limitedBudgetInvestment, "Limited budget flexibility makes a major investment premature.");
      }
      if (prereqs.length > 0 && decision.maturity_stage !== "Foundation") {
        adjust(
          RANKING_RULES.adjustments.prerequisite * prereqs.length,
          `Sequence this after ${prereqs.length} ontology prerequisite${prereqs.length === 1 ? "" : "s"}.`,
        );
      }

      let priority = scoreToPriority(score);
      if (
        prereqs.length > 0 &&
        decision.maturity_stage !== "Foundation" &&
        !hasFoundationReadiness(profile)
      ) {
        const cap = decision.maturity_stage === "Advanced" ? "LATER" : "DO_NEXT";
        const capped = capPriority(priority, cap);
        if (capped !== priority) {
          priority = capped;
          reasons.push(`Placement is capped at ${cap === "DO_NEXT" ? "Do next" : "Later"} until prerequisite foundations are ready.`);
        }
      }

      return {
        decisionId: decision.id,
        priority,
        reasons,
        prerequisites: prereqs,
        evidenceSourceIds: splitField(decision.source_ids),
        score,
      };
    })
    .sort((a, b) => {
      const priorityDifference = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDifference) return priorityDifference;
      const aDecision = ontology.decisions.find((decision) => decision.id === a.decisionId)!;
      const bDecision = ontology.decisions.find((decision) => decision.id === b.decisionId)!;
      return (
        stageOrder[aDecision.maturity_stage] - stageOrder[bDecision.maturity_stage] ||
        b.score - a.score ||
        a.decisionId.localeCompare(b.decisionId)
      );
    });
}
