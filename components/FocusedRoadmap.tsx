"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { evaluateIntent } from "@/lib/intent-engine";
import { intentsById } from "@/lib/intents";
import { decisionsById, ontology } from "@/lib/ontology";
import { parseDiagnosticState } from "@/lib/diagnostics";
import { buildRoadmapMarkdown, restartNavigator } from "@/lib/roadmap-export";
import type { InstitutionProfile, IntentAnswers, IntentId, IntentRecommendation } from "@/lib/types";
import { EvidenceSummary } from "./EvidenceDisclosure";
import { FollowUpSection } from "./FollowUpSection";
import { RelationshipProvenanceNote } from "./RelationshipProvenanceNote";

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const getSession = () => localStorage.getItem("navigator-session") ?? "";
const getProfile = () => localStorage.getItem("institution-profile") ?? "";
const getDiagnostics = () => localStorage.getItem("diagnostic-state") ?? "";
const getServerValue = () => undefined;

function RecommendationBlock({ item, number }: { item: IntentRecommendation; number: number }) {
  const decision = decisionsById.get(item.decisionId)!;
  return (
    <article className="priority-item">
      <div className="priority-number">{String(number).padStart(2, "0")}</div>
      <div>
        <h2>{item.plainLanguageTitle}</h2>
        <p className="reason">{item.reason}</p>
        <div className="action-callout"><span>Start with</span><p>{item.recommendedAction}</p></div>
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
        <Link className="detail-link" href={`/decisions/${item.decisionId}`}>Explore this decision →</Link>
      </div>
    </article>
  );
}

export function FocusedRoadmap() {
  const rawSession = useSyncExternalStore(subscribeToStorage, getSession, getServerValue);
  const rawProfile = useSyncExternalStore(subscribeToStorage, getProfile, getServerValue);
  const rawDiagnostics = useSyncExternalStore(subscribeToStorage, getDiagnostics, getServerValue);
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const router = useRouter();
  const parsed = useMemo(() => {
    if (rawSession === undefined) return undefined;
    try {
      const session = JSON.parse(rawSession) as { intentId: IntentId; answers: IntentAnswers };
      const diagnostics = rawDiagnostics ? parseDiagnosticState(rawDiagnostics) : null;
      const profile = diagnostics?.profile ?? (rawProfile ? JSON.parse(rawProfile) as InstitutionProfile : undefined);
      return { session, profile, diagnostics, roadmap: evaluateIntent(session.intentId, session.answers ?? {}, profile) };
    } catch {
      return null;
    }
  }, [rawSession, rawProfile, rawDiagnostics]);

  if (parsed === undefined) return <section className="empty" aria-live="polite"><p>Preparing your priorities…</p></section>;
  if (!parsed) return <section className="empty"><p className="eyebrow">No current path</p><h1>Choose what you’re trying to figure out.</h1><Link className="button-link" href="/">Choose a goal →</Link></section>;

  const { session, roadmap, diagnostics } = parsed;
  const intent = intentsById.get(session.intentId)!;
  const restart = () => {
    restartNavigator(true, localStorage);
    router.push("/");
  };
  const markdown = buildRoadmapMarkdown({ roadmap, observations: diagnostics?.observations ?? [] });
  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyStatus("Summary copied.");
    } catch {
      setCopyStatus("Copy failed. Use Export as Markdown instead.");
    }
  };
  const exportMarkdown = () => {
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "institutional-ai-decision-roadmap.md";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <>
      <section className="results-head">
        <div className="current-path"><span>Current path</span><strong>{intent.title}</strong></div>
        <h1>{session.intentId === "getting-started" ? "Your starting point" : "Based on what you’ve told us, resolve these decisions first."}</h1>
        <p>{roadmap.primary.length} focused priorit{roadmap.primary.length === 1 ? "y" : "ies"}, sequenced from your answers and the decision dependencies behind them.</p>
        <nav className="result-actions" aria-label="Roadmap actions">
          <Link href={`/?intent=${session.intentId}`}>Change an answer</Link>
          <Link href="/">Change goal</Link>
          <button onClick={copySummary}>Copy summary</button>
          <button onClick={exportMarkdown}>Export as Markdown</button>
          {!confirmingRestart ? <button onClick={() => setConfirmingRestart(true)}>Restart</button> : (
            <span className="restart-confirmation">
              <span>Clear saved answers and roadmap?</span>
              <button onClick={restart}>Clear and restart</button>
              <button onClick={() => setConfirmingRestart(false)}>Keep roadmap</button>
            </span>
          )}
        </nav>
        <p className="action-status" aria-live="polite">{copyStatus}</p>
      </section>

      {session.intentId === "getting-started" && diagnostics?.observations.length ? (
        <section className="heard-summary" aria-labelledby="heard-heading">
          <p className="eyebrow">Context</p>
          <h2 id="heard-heading">What we heard</h2>
          <ul>{diagnostics.observations.map((observation) => <li key={observation}>{observation}</li>)}</ul>
        </section>
      ) : null}

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
    </>
  );
}
