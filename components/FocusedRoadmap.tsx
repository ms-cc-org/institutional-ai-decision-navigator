"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { evaluateIntent } from "@/lib/intent-engine";
import { intentsById } from "@/lib/intents";
import { decisionsById } from "@/lib/ontology";
import type { InstitutionProfile, IntentAnswers, IntentId, IntentRecommendation } from "@/lib/types";

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const getSession = () => localStorage.getItem("navigator-session") ?? "";
const getProfile = () => localStorage.getItem("institution-profile") ?? "";
const getServerValue = () => undefined;

function RecommendationBlock({ item, number }: { item: IntentRecommendation; number: number }) {
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
            <p>The ontology cites {item.evidenceSourceIds.length} supporting source{item.evidenceSourceIds.length === 1 ? "" : "s"}.</p>
            <p className="technical-line">Source references: {item.evidenceSourceIds.join(" · ")}</p>
          </details>
          <details>
            <summary>How this connects</summary>
            {item.prerequisites.length ? (
              <ul>{item.prerequisites.map((id) => <li key={id}><Link href={`/decisions/${id}`}>{decisionsById.get(id)?.question}</Link></li>)}</ul>
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
  const router = useRouter();
  const parsed = useMemo(() => {
    if (rawSession === undefined) return undefined;
    try {
      const session = JSON.parse(rawSession) as { intentId: IntentId; answers: IntentAnswers };
      const profile = rawProfile ? JSON.parse(rawProfile) as InstitutionProfile : undefined;
      return { session, profile, roadmap: evaluateIntent(session.intentId, session.answers ?? {}, profile) };
    } catch {
      return null;
    }
  }, [rawSession, rawProfile]);

  if (parsed === undefined) return <section className="empty" aria-live="polite"><p>Preparing your priorities…</p></section>;
  if (!parsed) return <section className="empty"><p className="eyebrow">No current path</p><h1>Choose what you’re trying to figure out.</h1><Link className="button-link" href="/">Choose a goal →</Link></section>;

  const { session, roadmap } = parsed;
  const intent = intentsById.get(session.intentId)!;
  const restart = () => {
    localStorage.removeItem("navigator-session");
    localStorage.removeItem("institution-profile");
    router.push("/");
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
          <button onClick={restart}>Restart</button>
        </nav>
      </section>

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

      {(roadmap.next.length > 0 || roadmap.conditional.length > 0) && (
        <section className="then-consider">
          <p className="eyebrow">Then consider</p>
          <div>{[...roadmap.next, ...roadmap.conditional].slice(0, 4).map((item) => (
            <Link key={item.decisionId} href={`/decisions/${item.decisionId}`}><strong>{item.plainLanguageTitle}</strong><span>{item.status === "CONDITIONAL" ? "If the related condition applies" : item.reason}</span><b>→</b></Link>
          ))}</div>
        </section>
      )}
    </>
  );
}
