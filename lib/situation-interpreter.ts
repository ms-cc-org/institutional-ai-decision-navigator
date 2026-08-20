import { createNavigatorSession } from "./session";
import type { IntentAnswers, IntentId, NavigatorSession, SituationContext, SituationState } from "./types";

const contains = (text: string, pattern: RegExp) => pattern.test(text);

export function interpretSituation(rawText: string): SituationState {
  const text = rawText.toLowerCase();
  let topic: SituationContext["topic"] = "unknown";
  if (contains(text, /\b(buy|buying|purchase|procure|vendor|platform|product|contract|copilot)\b/)) topic = "procurement";
  else if (contains(text, /\b(research|researcher|hpc|gpu|scientific)\b/)) topic = "research";
  else if (contains(text, /\b(course|classroom|student learning|assessment|teaching|faculty)\b/)) topic = "teaching_learning";
  else if (contains(text, /\b(policy|guideline|acceptable use|rules?)\b/)) topic = "policy";
  else if (contains(text, /\b(governance|committee|decision rights|oversight)\b/)) topic = "governance";
  else if (contains(text, /\b(infrastructure|compute|cloud|hosting|data center)\b/)) topic = "infrastructure";
  else if (contains(text, /\b(training|literacy|skills?|support desk)\b/)) topic = "skills_support";
  else if (contains(text, /\b(workflow|administrative|automation|operations)\b/)) topic = "operations";
  else if (contains(text, /\b(strategy|strategic|direction|priorit)\b/)) topic = "strategy";

  let institutionType: SituationContext["institutionType"] = "unknown";
  if (contains(text, /\bcommunity college\b/)) institutionType = "community_college";
  else if (contains(text, /\bliberal arts\b/)) institutionType = "liberal_arts";
  else if (contains(text, /\bresearch university\b/)) institutionType = "research_university";
  else if (contains(text, /\buniversity system\b|\bsystem office\b/)) institutionType = "system";
  else if (contains(text, /\bmaster'?s (institution|university)\b/)) institutionType = "masters";

  let institutionScale: SituationContext["institutionScale"] = "unknown";
  if (contains(text, /\bsmall (college|university|institution|campus)\b/)) institutionScale = "small";
  else if (contains(text, /\blarge (college|university|institution|campus|system)\b/)) institutionScale = "large";
  else if (contains(text, /\bmedium(?:-sized)? (college|university|institution|campus)\b/)) institutionScale = "medium";

  let adoption: SituationContext["adoption"] = "unknown";
  if (contains(text, /\b(widespread|across (?:many|multiple|several) (?:units|departments|areas)|everyone is using)\b/)) adoption = "widespread";
  else if (contains(text, /\b(already using|are using|pilot|experimenting|some (?:faculty|staff|students|units))\b/)) adoption = "emerging";
  else if (contains(text, /\b(not using|no one is using|haven't started using)\b/)) adoption = "exploring";

  let governance: SituationContext["governance"] = "unknown";
  if (contains(text, /\b(formal|chartered) (?:ai )?(?:committee|governance|oversight)\b/)) governance = "formal";
  else if (contains(text, /\b(informal|ad hoc) (?:ai )?(?:group|committee|governance|oversight)\b/)) governance = "informal";
  else if (contains(text, /\b(no|don't have|do not have|without) (?:formal )?(?:ai )?(?:governance|committee|owner|oversight)\b/)) governance = "none";

  let policy: SituationContext["policy"] = "unknown";
  if (contains(text, /\b(approved|adopted|formal) (?:ai )?(?:policy|guidelines?)\b/)) policy = "approved";
  else if (contains(text, /\b(draft|informal) (?:ai )?(?:policy|guidelines?)\b/)) policy = "draft";
  else if (contains(text, /\b(no|don't have|do not have|without|lack(?:ing)?) (?:an? )?(?:ai )?(?:policy|guidelines?)\b/)) policy = "none";

  let dataSensitivity: SituationContext["dataSensitivity"] = "unknown";
  if (contains(text, /\b(sensitive|regulated|student records?|ferpa|hipaa|restricted|personal data)\b/)) dataSensitivity = "sensitive";
  else if (contains(text, /\binternal (?:institutional )?data\b/)) dataSensitivity = "internal";
  else if (contains(text, /\b(public|open|non-sensitive) data\b/)) dataSensitivity = "public";

  let procurement: SituationContext["procurement"] = "unknown";
  if (contains(text, /\b(buy|buying|purchase|procure|new vendor|enterprise (?:ai )?platform|select(?:ing)? a platform)\b/)) procurement = "new";
  else if (contains(text, /\b(existing vendor|renewal|embedded (?:ai )?feature)\b/)) procurement = "existing";
  else if (contains(text, /\b(no purchase|not buying|no procurement)\b/)) procurement = "none";

  let peopleImpact: SituationContext["peopleImpact"] = "unknown";
  if (contains(text, /\b(admission|hiring|employment|financial aid|discipline|consequential decision)\b/)) peopleImpact = "yes";
  else if (contains(text, /\b(will not|won't|does not) (?:make|influence) decisions? about people\b/)) peopleImpact = "no";

  const context: SituationContext = { topic, institutionType, institutionScale, adoption, governance, policy, dataSensitivity, procurement, peopleImpact };
  return { version: 1, rawText, context, observations: situationObservations(context), confirmed: false };
}

export function situationObservations(context: SituationContext): string[] {
  const observations: string[] = [];
  if (context.institutionScale !== "unknown") observations.push(`You described a ${context.institutionScale} institution.`);
  if (context.institutionType !== "unknown") observations.push(`Institution type: ${context.institutionType.replaceAll("_", " ")}.`);
  if (context.adoption === "widespread") observations.push("AI use is already occurring across multiple institutional areas.");
  if (context.adoption === "emerging") observations.push("AI use or piloting is already occurring in some institutional areas.");
  if (context.adoption === "exploring") observations.push("You indicated that institutional AI use has not started.");
  if (context.governance === "formal") observations.push("A formal AI governance or oversight structure was described.");
  if (context.governance === "informal") observations.push("AI governance or oversight was described as informal.");
  if (context.governance === "none") observations.push("You indicated that no AI governance owner or structure is in place.");
  if (context.governance === "unknown") observations.push("AI governance ownership was not clear from the description.");
  if (context.policy === "approved") observations.push("An approved AI policy or set of guidelines was described.");
  if (context.policy === "draft") observations.push("AI policy or guidance is still draft or informal.");
  if (context.policy === "none") observations.push("You indicated that no AI policy or guidance is in place.");
  if (context.policy === "unknown") observations.push("AI policy or guidance status was not clear from the description.");
  if (context.procurement === "new") observations.push("You are considering a new AI product, vendor, or institution-wide platform.");
  if (context.procurement === "existing") observations.push("An AI capability is entering through an existing vendor or renewal.");
  if (context.dataSensitivity === "sensitive") observations.push("Sensitive or regulated data is in scope.");
  if (context.dataSensitivity === "internal") observations.push("Internal institutional data is in scope.");
  if (context.dataSensitivity === "public") observations.push("Only public or non-sensitive data was described.");
  if (context.dataSensitivity === "unknown") observations.push("Data sensitivity was not clear from the description.");
  if (context.peopleImpact === "yes") observations.push("The situation may affect consequential decisions about people.");
  if (context.peopleImpact === "unknown") observations.push("Potential impact on consequential decisions about people was not clear.");
  if (context.topic !== "unknown") observations.push(`Primary situation: ${context.topic.replaceAll("_", " ")}.`);
  return observations;
}

export function situationToSession(context: SituationContext): NavigatorSession {
  let intentId: IntentId;
  const answers: IntentAnswers = {};
  switch (context.topic) {
    case "procurement":
      intentId = "evaluate-tool";
      answers.tool_type = "unsure";
      answers.data_access = context.dataSensitivity === "unknown" ? "unsure" : context.dataSensitivity;
      answers.people_decisions = context.peopleImpact === "unknown" ? "unsure" : context.peopleImpact;
      answers.purchase_type = context.procurement === "unknown" || context.procurement === "none" ? "unsure" : context.procurement;
      break;
    case "research":
      intentId = "support-research";
      answers.research_stage = "planning";
      answers.research_data = context.dataSensitivity === "internal" ? "institutional" : context.dataSensitivity === "unknown" ? "unsure" : context.dataSensitivity;
      answers.local_compute = "unsure";
      answers.research_output = "unsure";
      break;
    case "teaching_learning":
      intentId = "teaching-learning";
      answers.ai_use = context.adoption === "unknown" ? "unsure" : context.adoption;
      answers.course_guidance = context.policy === "approved" ? "yes" : context.policy === "none" ? "no" : "unsure";
      answers.governance = context.governance === "formal" ? "yes" : context.governance === "none" ? "no" : "unsure";
      answers.assessment = "unsure";
      answers.accessibility = "unsure";
      break;
    case "policy":
      intentId = "develop-policy";
      answers.audience = "unsure";
      answers.sensitive_data = context.dataSensitivity === "sensitive" ? "yes" : context.dataSensitivity === "public" ? "no" : "unsure";
      answers.consequential = context.peopleImpact === "unknown" ? "unsure" : context.peopleImpact;
      answers.procurement = context.procurement === "new" || context.procurement === "existing" ? "yes" : "unsure";
      break;
    case "governance":
      intentId = "create-governance";
      answers.governance_state = context.governance === "unknown" ? "unsure" : context.governance;
      answers.decentralized = context.adoption === "widespread" || context.adoption === "emerging" ? "yes" : "unsure";
      answers.consequential = context.peopleImpact === "unknown" ? "unsure" : context.peopleImpact;
      answers.deployed = context.adoption === "widespread" || context.adoption === "emerging" ? "yes" : "unsure";
      break;
    case "infrastructure":
      intentId = "infrastructure";
      answers.workload_known = "unsure";
      answers.demand = context.adoption === "widespread" ? "multiple" : "unsure";
      answers.data_access = context.dataSensitivity === "sensitive" ? "yes" : context.dataSensitivity === "public" ? "no" : "unsure";
      answers.local_capacity = "moderate";
      break;
    case "skills_support": intentId = "skills-support"; break;
    case "operations":
      intentId = "administrative-automation";
      answers.process_stage = context.adoption === "widespread" ? "live" : "idea";
      answers.people_decisions = context.peopleImpact === "unknown" ? "unsure" : context.peopleImpact;
      answers.data_access = context.dataSensitivity === "sensitive" ? "yes" : context.dataSensitivity === "public" ? "no" : "unsure";
      answers.human_review = "unsure";
      break;
    default:
      intentId = "set-direction";
      answers.planning_stage = "starting";
      answers.current_use = context.adoption === "widespread" || context.adoption === "emerging" ? "yes" : context.adoption === "exploring" ? "no" : "unsure";
      answers.priority_pressure = "unsure";
  }
  return createNavigatorSession(intentId, answers, "situation");
}

export function parseSituationState(value: string): SituationState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as SituationState;
    return parsed.version === 1 && typeof parsed.rawText === "string" && Boolean(parsed.context) && Array.isArray(parsed.observations) ? parsed : null;
  } catch {
    return null;
  }
}
