"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { evaluateIntent } from "@/lib/intent-engine";
import { intentsById } from "@/lib/intents";
import { decisionsById, ontology } from "@/lib/ontology";
import { parseDiagnosticState } from "@/lib/diagnostics";
import {
  buildRoadmapMarkdown,
  formatRoadmapDate,
  printRoadmap,
  ROADMAP_EXPORT_TITLE,
  restartNavigator,
  roadmapMarkdownFilename,
} from "@/lib/roadmap-export";
import { NSF_ATTRIBUTION } from "@/lib/attribution";
import { parseInstitutionProfile, parseNavigatorSession } from "@/lib/session";
import { parseSituationState } from "@/lib/situation-interpreter";
import type { IntentRecommendation } from "@/lib/types";
import { EvidenceSummary } from "./EvidenceDisclosure";
import { FollowUpSection } from "./FollowUpSection";
import { RelationshipProvenanceNote } from "./RelationshipProvenanceNote";
import { RoadmapExportActions } from "./RoadmapExportActions";
import { institutionConfig } from "@/config/institution";

const basePath = process.env.PAGES_BASE_PATH ?? "";
const printLogoUrl = institutionConfig.logoHorizontal.startsWith("http")
  ? institutionConfig.logoHorizontal
  : `${basePath}${institutionConfig.logoHorizontal}`;

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const getSession = () => localStorage.getItem("navigator-session") ?? "";
const getProfile = () => localStorage.getItem("institution-profile") ?? "";
const getDiagnostics = () => localStorage.getItem("diagnostic-state") ?? "";
const getSituation = () => localStorage.getItem("situation-state") ?? "";
const getServerValue = () => undefined;

function RecommendationBlock({ item, number }: { item: IntentRecommendation; number: number }) {
  const decision = decisionsById.get(item.decisionId)!;
  const unlocks = ontology.relationships
    .filter((relationship) => relationship.relationship === "prerequisite_for" && relationship.from === item.decisionId)
    .slice(0, 3)
    .map((relationship) => decisionsById.get(relationship.to))
    .filter(Boolean);
  return (
    <article className="priority-item">
      <div className="priority-number">{String(number).padStart(2, "0")}</div>
      <div>
        <h2>{item.plainLanguageTitle}</h2>
        <p className="reason">{item.reason}</p>
        <div className="action-callout"><span>Start with</span><p>{item.recommendedAction}</p></div>
        {unlocks.length > 0 && <div className="unlocks"><span>What this helps unlock</span><ul>{unlocks.map((unlocked) => <li key={unlocked!.id}>{unlocked!.question}</li>)}</ul></div>}
        <div className="disclosures">
          <details>
            <summary>Evidence behind this recommendation</summary>
            <EvidenceSummary decision={decision} />
          </details>
          <details>
            <summary>How this connects</summary>
            {item.prerequisites.length ? (
              <ul>{item.prerequisites.map((id) => {
                const relationship = ontology.relationships.find((candidate) =>
                  candidate.relationship === "prerequisite_for"
                  && candidate.from === id
                  && candidate.to === item.decisionId);
                return (
                  <li key={id}>
                    <Link href={`/decisions/${id}`}>{decisionsById.get(id)?.question}</Link>
                    {relationship && <RelationshipProvenanceNote relationship={relationship} />}
                  </li>
                );
              })}</ul>
            ) : <p>No prerequisite decision is defined for this item.</p>}
          </details>
        </div>
        <div className="print-only print-evidence-summary" aria-label="Concise evidence summary">
          <h3>Evidence summary</h3>
          <EvidenceSummary decision={decision} />
        </div>
        <Link className="detail-link" href={`/decisions/${item.decisionId}`}>Explore this decision →</Link>
      </div>
    </article>
  );
}

export function FocusedRoadmap() {
  const rawSession = useSyncExternalStore(subscribeToStorage, getSession, getServerValue);
  const rawProfile = useSyncExternalStore(subscribeToStorage, getProfile, getServerValue);
  const rawDiagnostics = useSyncExternalStore(subscribeToStorage, getDiagnostics, getServerValue);
  const rawSituation = useSyncExternalStore(subscribeToStorage, getSituation, getServerValue);
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [generatedAt] = useState(() => new Date());
  const router = useRouter();
  const parsed = useMemo(() => {
    if (rawSession === undefined) return undefined;
    try {
      const session = parseNavigatorSession(rawSession);
      if (!session) return null;
      const diagnostics = rawDiagnostics ? parseDiagnosticState(rawDiagnostics) : null;
      const situation = rawSituation ? parseSituationState(rawSituation) : null;
      const profile = diagnostics?.profile ?? (rawProfile ? parseInstitutionProfile(rawProfile) : null) ?? undefined;
      return { session, profile, diagnostics, situation, roadmap: evaluateIntent(session.intentId, session.answers ?? {}, profile) };
    } catch {
      return null;
    }
  }, [rawSession, rawProfile, rawDiagnostics, rawSituation]);

  if (parsed === undefined) return <section className="empty" aria-live="polite"><p>Preparing your priorities…</p></section>;
  if (!parsed) return <section className="empty"><p className="eyebrow">No current path</p><h1>Choose what you’re trying to figure out.</h1><Link className="button-link" href="/">Choose a goal →</Link></section>;

  const { session, roadmap, diagnostics, situation } = parsed;
  const intent = intentsById.get(session.intentId)!;
  const restart = () => {
    restartNavigator(true, localStorage);
    router.push("/");
  };
  const observations = session.entryMode === "situation" ? situation?.observations ?? [] : diagnostics?.observations ?? [];
  const markdown = buildRoadmapMarkdown({ roadmap, observations, generatedAt });
  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyStatus("Summary copied.");
    } catch {
      setCopyStatus("Copy failed. Use Download Markdown instead.");
    }
  };
  const exportMarkdown = () => {
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = roadmapMarkdownFilename(generatedAt);
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <>
      <section className="print-only print-roadmap-header" aria-label="Printed roadmap heading">
        <Image src={printLogoUrl} alt={institutionConfig.institutionName} width={institutionConfig.logoHorizontalWidth} height={institutionConfig.logoHorizontalHeight} unoptimized />
        <h1>{ROADMAP_EXPORT_TITLE}</h1>
        <p>Generated {formatRoadmapDate(generatedAt)}</p>
      </section>
      <section className="results-head">
        <div className="current-path"><span>Current path</span><strong>{intent.title}</strong></div>
        <h1>{session.intentId === "getting-started" ? "Your starting point" : session.entryMode === "situation" ? "Based on what you described, resolve these decisions first." : "Based on what you’ve told us, resolve these decisions first."}</h1>
        <p>{roadmap.primary.length} focused priorit{roadmap.primary.length === 1 ? "y" : "ies"}, sequenced from your answers and the decision dependencies behind them.</p>
        <div className="result-actions screen-only">
          <nav className="roadmap-edit-actions" aria-label="Edit roadmap">
            <Link href={session.entryMode === "situation" ? "/?mode=ask" : `/?intent=${session.intentId}`}>{session.entryMode === "situation" ? "Revise description" : "Change an answer"}</Link>
            <Link href="/">Change goal</Link>
            {!confirmingRestart ? <button onClick={() => setConfirmingRestart(true)}>Restart</button> : (
              <span className="restart-confirmation">
                <span>Clear saved answers and roadmap?</span>
                <button onClick={restart}>Clear and restart</button>
                <button onClick={() => setConfirmingRestart(false)}>Keep roadmap</button>
              </span>
            )}
          </nav>
          <RoadmapExportActions onCopy={copySummary} onDownload={exportMarkdown} onPrint={() => printRoadmap(window)} />
        </div>
        <p className="action-status screen-only" aria-live="polite">{copyStatus}</p>
      </section>

      {observations.length ? (
        <section className="heard-summary" aria-labelledby="heard-heading">
          <p className="eyebrow">Context</p>
          <h2 id="heard-heading">What we heard</h2>
          <ul>{observations.map((observation) => <li key={observation}>{observation}</li>)}</ul>
        </section>
      ) : (
        <section className="heard-summary print-only" aria-labelledby="heard-heading-empty">
          <p className="eyebrow">Institutional context</p>
          <h2 id="heard-heading-empty">What we heard</h2>
          <p>No diagnostic context was saved for this pathway.</p>
        </section>
      )}

      <h2 className="print-only print-section-heading">Primary priorities</h2>
      <section className="priority-list" aria-label="Priority decisions">
        {roadmap.primary.map((item, index) => <RecommendationBlock key={item.decisionId} item={item} number={index + 1} />)}
      </section>

      {roadmap.timeline && (
        <section className="timeline-section">
          <p className="eyebrow">Your next 90 days</p>
          <div className="timeline">{roadmap.timeline.map((step) => {
            const item = roadmap.primary.find((candidate) => candidate.decisionId === step.decisionId)!;
            return <div key={step.period}><span>{step.period}</span><strong>{item.plainLanguageTitle}</strong><p>{item.recommendedAction}</p></div>;
          })}</div>
        </section>
      )}

      <FollowUpSection heading="Coming up next" items={roadmap.next} />
      <FollowUpSection heading="Only if this applies" items={roadmap.conditional} conditional />

      <section className="print-only print-attribution" aria-label="Required attribution">
        {NSF_ATTRIBUTION.map((line) => <p key={line}>{line}</p>)}
      </section>
    </>
  );
}
