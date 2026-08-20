import { corroborationLabel, sourceSupportLabel, validationStatusLabel } from "./evidence-presentation";
import { decisionsById, ontology, sourcesById } from "./ontology";
import type { IntentRoadmap } from "./types";
import { NSF_ATTRIBUTION } from "./attribution";
import { CANONICAL_SITE_URL } from "./site";

export interface RoadmapExportContext {
  roadmap: IntentRoadmap;
  observations: string[];
  generatedAt?: Date;
}

const recommendationLines = (items: IntentRoadmap["primary"]) => items.flatMap((item, index) => {
  const decision = decisionsById.get(item.decisionId)!;
  const profile = decision.evidence_profile;
  const sourceNames = decision.evidence_links.map((link) => sourcesById.get(link.source_id)?.title).filter(Boolean);
  const unlocks = ontology.relationships
    .filter((relationship) => relationship.relationship === "prerequisite_for" && relationship.from === item.decisionId)
    .slice(0, 3)
    .map((relationship) => decisionsById.get(relationship.to)?.question)
    .filter(Boolean);
  return [
    `${index + 1}. ${item.plainLanguageTitle}`,
    `   - Why it surfaced: ${item.reason}`,
    `   - Recommended action: ${item.recommendedAction}`,
    ...(unlocks.length ? [`   - What it unlocks: ${unlocks.join("; ")}`] : []),
    `   - Evidence summary: ${profile.evidence_breadth} source${profile.evidence_breadth === 1 ? "" : "s"}${sourceNames.length ? ` — ${sourceNames.join("; ")}` : ""}`,
    `   - Source support: ${sourceSupportLabel(profile.source_support)}`,
    `   - Independent corroboration: ${corroborationLabel(profile.corroboration)}`,
    `   - Validation status: ${validationStatusLabel(profile.validation_status)}`,
  ];
});

const secondaryLines = (heading: string, items: IntentRoadmap["next"]) => [
  `## ${heading}`,
  "",
  ...(items.length
    ? items.flatMap((item) => [`- **${item.plainLanguageTitle}** — ${item.reason}`])
    : ["- None identified from the current answers."]),
  "",
];

export function buildRoadmapMarkdown({ roadmap, observations, generatedAt = new Date() }: RoadmapExportContext) {
  const lines = [
    "# MS-CC Institutional AI Decision Navigator",
    "",
    `Resource: ${CANONICAL_SITE_URL}`,
    "",
    `Generated: ${new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(generatedAt)}`,
    "",
    "## Institutional context / What we heard",
    "",
    ...(observations.length ? observations.map((observation) => `- ${observation}`) : ["- No diagnostic context was saved for this pathway."]),
    "",
    "## Primary priorities",
    "",
    ...recommendationLines(roadmap.primary),
    "",
    ...secondaryLines("Coming up next", roadmap.next),
    ...secondaryLines("Only if this applies", roadmap.conditional),
  ];

  if (roadmap.timeline?.length) {
    lines.push("## Your next 90 days", "");
    for (const step of roadmap.timeline) {
      const item = roadmap.primary.find((candidate) => candidate.decisionId === step.decisionId);
      if (item) lines.push(`- **${step.period}:** ${item.plainLanguageTitle} — ${item.recommendedAction}`);
    }
    lines.push("");
  }
  lines.push(...NSF_ATTRIBUTION, "");
  return `${lines.join("\n")}\n`;
}

export const NAVIGATOR_STORAGE_KEYS = [
  "navigator-session",
  "institution-profile",
  "diagnostic-state",
  "situation-state",
] as const;

export function clearNavigatorStorage(storage: Pick<Storage, "removeItem">) {
  NAVIGATOR_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
}

export function restartNavigator(confirmed: boolean, storage: Pick<Storage, "removeItem">) {
  if (!confirmed) return false;
  clearNavigatorStorage(storage);
  return true;
}
