"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { intents, intentsById } from "@/lib/intents";
import type { IntentAnswers, IntentId } from "@/lib/types";
import { createNavigatorSession } from "@/lib/session";
import { decisionsById } from "@/lib/ontology";
import { landingExampleDecisions, landingStats } from "@/lib/landing";
import { ProfileForm } from "./ProfileForm";
import { SituationInterpreter } from "./SituationInterpreter";
import { institutionConfig } from "@/config/institution";

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const getStoredSession = () => localStorage.getItem("navigator-session") ?? "";
const getServerSession = () => "";
const subscribeToLocation = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};
const getLocationSearch = () => window.location.search;
const getServerLocationSearch = () => "";

function readSavedAnswers(value: string, intentId: IntentId | null): IntentAnswers {
  if (!value || !intentId) return {};
  try {
    const parsed = JSON.parse(value) as { intentId?: string; answers?: IntentAnswers };
    return parsed.intentId === intentId ? parsed.answers ?? {} : {};
  } catch {
    return {};
  }
}

export function IntentNavigator() {
  const locationSearch = useSyncExternalStore(subscribeToLocation, getLocationSearch, getServerLocationSearch);
  const [selectedIntentId, setSelectedIntentId] = useState<IntentId | null>(null);
  const [selectedMode, setSelectedMode] = useState<"situation" | null>(null);
  const searchParams = new URLSearchParams(locationSearch);
  const locationIntent = searchParams.get("intent") ?? "";
  const locationIntentId = intentsById.has(locationIntent as IntentId) ? locationIntent as IntentId : null;
  const exploredDecision = decisionsById.get(searchParams.get("fromDecision") ?? "");
  const intentId = selectedIntentId ?? locationIntentId;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [draftAnswers, setDraftAnswers] = useState<IntentAnswers>({});
  const savedSession = useSyncExternalStore(subscribeToStorage, getStoredSession, getServerSession);
  const savedAnswers = readSavedAnswers(savedSession, intentId);
  const answers = { ...savedAnswers, ...draftAnswers };
  const router = useRouter();
  const intent = intentId ? intentsById.get(intentId) : undefined;

  const chooseIntent = (nextIntentId: IntentId) => {
    setSelectedMode(null);
    setSelectedIntentId(nextIntentId);
    setQuestionIndex(0);
    setDraftAnswers({});
  };

  const changeGoal = () => {
    window.history.replaceState({}, "", window.location.pathname);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setSelectedIntentId(null);
    setSelectedMode(null);
    setQuestionIndex(0);
    setDraftAnswers({});
  };

  if (selectedMode === "situation" || searchParams.get("mode") === "ask") {
    return <SituationInterpreter onBack={changeGoal} />;
  }

  if (!intent) {
    return (
      <main className="intent-home">
        <section className="landing-hero">
          <p className="eyebrow">From AI guidance to institutional action</p>
          <h1>Know which AI decisions matter for your institution.</h1>
          <div className="landing-introduction">
            <p>There is already extensive guidance on responsible and effective AI adoption. The harder problem is knowing what applies to your institution and what to address first.</p>
            <p>{institutionConfig.productName} synthesizes that guidance into a structured decision model. Use it to identify the decisions that matter for your situation, understand which should receive attention first, and inspect the evidence behind each recommendation.</p>
          </div>
          <p className="trust-calibration">The Navigator supports institutional judgment rather than replacing it. Its recommendations follow defined decision rules—not open-ended AI generation—and their reasoning and evidence can be inspected.</p>
        </section>
        <dl className="credibility-strip" aria-label="Navigator scope">
          <div><dt>{landingStats.decisions}</dt><dd>Institutional AI decisions</dd></div>
          <div><dt>{landingStats.domains}</dt><dd>Decision domains</dd></div>
          <div><dt>{landingStats.sources}</dt><dd>Registered evidence sources</dd></div>
          <div><dt>Inspectable</dt><dd>Evidence and reasoning</dd></div>
        </dl>
        <header className="landing-section-heading">
          <p className="eyebrow">Start with what you need</p>
          <h2>Choose the path that fits your question.</h2>
        </header>
        <section className="entry-modes" aria-label="Choose how to start">
          <article><p className="eyebrow">Guide me</p><h2>Build my roadmap</h2><p>Not sure where to start? Answer a few questions about your institution and its goals. The Navigator will identify and prioritize the decisions that deserve attention.</p><button onClick={() => chooseIntent("getting-started")}>Build my roadmap <span aria-hidden="true">→</span></button></article>
          <article><p className="eyebrow">Ask · <span>Experimental</span></p><h2>Ask about my situation</h2><p>Have a specific challenge? Describe it in plain language. The Navigator identifies possible context for you to confirm before it surfaces relevant decisions.</p><button onClick={() => setSelectedMode("situation")}>Describe my situation <span aria-hidden="true">→</span></button></article>
          <article><p className="eyebrow">Explore</p><h2>Explore a topic</h2><p>Search and filter the decision model by topic, applicability, and evidence, or open a decision to inspect how it connects to others.</p><Link href="/explore">Browse topics <span aria-hidden="true">→</span></Link></article>
        </section>
        <details className="intent-shortcuts">
          <summary>I already know my goal</summary>
          <div className="intent-list" aria-label="Specific decision pathways">
            {intents.filter((item) => item.id !== "getting-started").map((item, index) => (
              <button key={item.id} onClick={() => chooseIntent(item.id)} className="intent-option">
                <span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>{item.description}</small><b aria-hidden="true">→</b>
              </button>
            ))}
          </div>
        </details>

        <section className="landing-explainer" aria-labelledby="guidance-decisions-heading">
          <div className="landing-section-heading">
            <p className="eyebrow">How it works</p>
            <h2 id="guidance-decisions-heading">From guidance to decisions</h2>
            <p>Most AI readiness resources help institutions understand what they should consider. The Navigator goes a step further by organizing guidance into specific institutional decisions and the relationships between them.</p>
          </div>
          <ol className="decision-flow">
            <li>Your situation</li>
            <li>Decisions that may apply</li>
            <li>What to address first</li>
            <li>Evidence behind the recommendation</li>
          </ol>
          <p className="flow-note">The path is generated deterministically from the structured ontology, institutional context, applicability rules, and documented relationships. The result is a prioritized roadmap for human review, not a determination of a single objectively correct answer.</p>
        </section>

        <section className="landing-questions" aria-labelledby="example-questions-heading">
          <div className="landing-section-heading">
            <p className="eyebrow">Recognizable institutional problems</p>
            <h2 id="example-questions-heading">Questions the Navigator can help you work through</h2>
          </div>
          <div className="question-links">
            {landingExampleDecisions.map((decision, index) => (
              <Link href={`/decisions/${decision.id}`} key={decision.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{decision.question}</strong>
                <b aria-hidden="true">→</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-difference" aria-labelledby="difference-heading">
          <div className="landing-section-heading">
            <p className="eyebrow">Why this is different</p>
            <h2 id="difference-heading">Built for decisions, not another maturity score.</h2>
            <p>Rather than assigning your institution a single readiness level, the Navigator identifies the specific decisions that may matter in your situation and helps clarify which deserve attention first.</p>
          </div>
          <div className="difference-grid">
            <article><p className="eyebrow">Synthesized</p><h3>Guidance becomes decisions.</h3><p>Published guidance and documented practice are normalized into an institutional decision model. Not every decision appears verbatim in a source, so researcher synthesis remains visible.</p></article>
            <article><p className="eyebrow">Contextual</p><h3>Your situation changes the path.</h3><p>Institutional goals, user context, applicability rules, and decision dependencies affect which decisions surface and how they are prioritized.</p></article>
            <article><p className="eyebrow">Traceable</p><h3>The evidence remains inspectable.</h3><p>Decision detail pages distinguish recorded support as direct, corroborating, contextual, or researcher synthesis, alongside corroboration and validation status.</p></article>
          </div>
          <p className="pilot-note"><strong>{institutionConfig.deploymentMode === "mscc_reference" ? `This is an ${institutionConfig.shortName} pilot.` : `${institutionConfig.institutionName} has configured this deployment from the MS-CC core.`}</strong> Practitioner validation of the core decision model and sequencing is ongoing. Decision detail pages expose supporting evidence and documented synthesis where available, so users can inspect the model&apos;s reasoning rather than rely on an opaque score.</p>
        </section>
      </main>
    );
  }

  if (intent.id === "getting-started") {
    return (
      <main>
        <section className="path-head">
          <button className="text-button" onClick={changeGoal}>← Change goal</button>
          <p className="eyebrow">Your path</p>
          <h1>{intent.title}</h1>
          {exploredDecision && <p><strong>You&apos;re exploring:</strong> {exploredDecision.question}</p>}
          <p className="lede">Fourteen short questions about observable institutional conditions will identify three strategic starting points.</p>
        </section>
        <section className="form-shell"><ProfileForm /></section>
      </main>
    );
  }

  const question = intent.contextQuestions[questionIndex];
  const selectedValue = answers[question.id];
  const atLastQuestion = questionIndex === intent.contextQuestions.length - 1;
  const continuePath = () => {
    if (!selectedValue) return;
    if (!atLastQuestion) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    localStorage.setItem("navigator-session", JSON.stringify(createNavigatorSession(intent.id, answers, "shortcut")));
    router.push("/roadmap");
  };

  return (
    <main className="question-page">
      <section className="path-head compact">
        <button className="text-button" onClick={changeGoal}>← Change goal</button>
        <p className="eyebrow">Your path</p>
        <h1>{intent.title}</h1>
        {exploredDecision && <p><strong>You&apos;re exploring:</strong> {exploredDecision.question}</p>}
        <p>{intent.description}</p>
      </section>
      <section className="question-panel">
        <div className="progress" role="progressbar" aria-label="Pathway progress" aria-valuemin={1} aria-valuemax={intent.contextQuestions.length} aria-valuenow={questionIndex + 1} aria-valuetext={`Question ${questionIndex + 1} of ${intent.contextQuestions.length}`}>
          <span>Question {questionIndex + 1} of {intent.contextQuestions.length}</span>
          <div aria-hidden="true"><i style={{ width: `${((questionIndex + 1) / intent.contextQuestions.length) * 100}%` }} /></div>
        </div>
        <fieldset>
          <legend>{question.prompt}</legend>
          {question.helpText && <p>{question.helpText}</p>}
          <div className="answer-list">
            {question.options.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={selectedValue === option.value}
                  onChange={() => setDraftAnswers((current) => ({ ...current, [question.id]: option.value }))}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="question-actions">
          <button className="secondary-button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((current) => current - 1)}>Back</button>
          <button className="primary-button" disabled={!selectedValue} onClick={continuePath}>{atLastQuestion ? "Show my priorities" : "Continue"} →</button>
        </div>
      </section>
    </main>
  );
}
