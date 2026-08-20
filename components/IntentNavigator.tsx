"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { intents, intentsById } from "@/lib/intents";
import type { IntentAnswers, IntentId } from "@/lib/types";
import { createNavigatorSession } from "@/lib/session";
import { ProfileForm } from "./ProfileForm";
import { SituationInterpreter } from "./SituationInterpreter";

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
        <section className="intent-intro">
          <p className="eyebrow">An MS-CC decision-support resource</p>
          <h1>How would you like to start?</h1>
          <p className="lede">Choose the way that best matches what you need today. Every path uses the same evidence-traceable decision model.</p>
        </section>
        <section className="entry-modes" aria-label="Choose how to start">
          <article><p className="eyebrow">Guide me</p><h2>Guide me through it</h2><p>I&apos;m not sure where to start. Ask me a few questions about my institution and help me identify the decisions that matter most.</p><button onClick={() => chooseIntent("getting-started")}>Start guided assessment <span aria-hidden="true">→</span></button></article>
          <article><p className="eyebrow">Ask · <span>Experimental</span></p><h2>Ask about my situation</h2><p>I have a specific problem, project, or question. Let me describe it in my own words.</p><button onClick={() => setSelectedMode("situation")}>Describe my situation <span aria-hidden="true">→</span></button></article>
          <article><p className="eyebrow">Explore</p><h2>Explore the decision model</h2><p>I know what I&apos;m looking for. Let me browse institutional AI decisions, dependencies, and evidence.</p><Link href="/explore">Explore decisions <span aria-hidden="true">→</span></Link></article>
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
