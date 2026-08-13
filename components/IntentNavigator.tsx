"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { intents, intentsById } from "@/lib/intents";
import type { IntentAnswers, IntentId } from "@/lib/types";
import { ProfileForm } from "./ProfileForm";

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
const getLocationIntent = () => new URLSearchParams(window.location.search).get("intent") ?? "";
const getServerLocationIntent = () => "";

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
  const locationIntent = useSyncExternalStore(subscribeToLocation, getLocationIntent, getServerLocationIntent);
  const [selectedIntentId, setSelectedIntentId] = useState<IntentId | null>(null);
  const locationIntentId = intentsById.has(locationIntent as IntentId) ? locationIntent as IntentId : null;
  const intentId = selectedIntentId ?? locationIntentId;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [draftAnswers, setDraftAnswers] = useState<IntentAnswers>({});
  const savedSession = useSyncExternalStore(subscribeToStorage, getStoredSession, getServerSession);
  const savedAnswers = useMemo(() => readSavedAnswers(savedSession, intentId), [savedSession, intentId]);
  const answers = { ...savedAnswers, ...draftAnswers };
  const router = useRouter();
  const intent = intentId ? intentsById.get(intentId) : undefined;

  const chooseIntent = (nextIntentId: IntentId) => {
    setSelectedIntentId(nextIntentId);
    setQuestionIndex(0);
    setDraftAnswers({});
  };

  const changeGoal = () => {
    window.history.replaceState({}, "", window.location.pathname);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setSelectedIntentId(null);
    setQuestionIndex(0);
    setDraftAnswers({});
  };

  if (!intent) {
    return (
      <main className="intent-home">
        <section className="intent-intro">
          <p className="eyebrow">Institutional AI Decision Navigator</p>
          <h1>What are you trying to figure out?</h1>
          <p className="lede">Choose the question closest to the work in front of you. We’ll ask only for the context needed to identify your next decisions.</p>
        </section>
        <section className="intent-list" aria-label="Choose your goal">
          {intents.map((item, index) => (
            <button key={item.id} onClick={() => chooseIntent(item.id)} className={item.id === "getting-started" ? "intent-option general" : "intent-option"}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
              <b aria-hidden="true">→</b>
            </button>
          ))}
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
    localStorage.setItem("navigator-session", JSON.stringify({ intentId: intent.id, answers }));
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
