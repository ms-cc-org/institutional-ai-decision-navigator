import type { InstitutionContextState, InstitutionProfile, IntentAnswers, IntentId, NavigatorSession } from "./types";

const intentIds = new Set<IntentId>([
  "set-direction", "create-governance", "develop-policy", "evaluate-tool",
  "support-research", "infrastructure", "teaching-learning", "skills-support",
  "administrative-automation", "getting-started",
]);

export function createNavigatorSession(
  intentId: IntentId,
  answers: IntentAnswers,
  entryMode: NavigatorSession["entryMode"],
): NavigatorSession {
  return { version: 1, intentId, answers, entryMode };
}

export function parseNavigatorSession(value: string): NavigatorSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<NavigatorSession> & { intentId?: string };
    if (!parsed.intentId || !intentIds.has(parsed.intentId as IntentId)) return null;
    if (parsed.answers && (typeof parsed.answers !== "object" || Array.isArray(parsed.answers))) return null;
    return {
      version: 1,
      intentId: parsed.intentId as IntentId,
      answers: parsed.answers ?? {},
      entryMode: parsed.entryMode ?? "shortcut",
    };
  } catch {
    return null;
  }
}

export function createInstitutionContext(profile: InstitutionProfile): InstitutionContextState {
  return { version: 1, profile };
}

export function parseInstitutionProfile(value: string): InstitutionProfile | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as InstitutionContextState | InstitutionProfile;
    if ("version" in parsed && parsed.version === 1 && "profile" in parsed) return parsed.profile;
    return "institutionType" in parsed && "aiGovernanceMaturity" in parsed ? parsed as InstitutionProfile : null;
  } catch { return null; }
}
