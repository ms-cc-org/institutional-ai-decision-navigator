"use client";

import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { createDiagnosticState, diagnosticIndicators, parseDiagnosticState } from "@/lib/diagnostics";
import type { DiagnosticAnswers } from "@/lib/types";
import { createInstitutionContext, createNavigatorSession } from "@/lib/session";

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const getStoredDiagnostics = () => localStorage.getItem("diagnostic-state") ?? "";
const getServerDiagnostics = () => "";

export function ProfileForm() {
  const storedDiagnostics = useSyncExternalStore(subscribeToStorage, getStoredDiagnostics, getServerDiagnostics);
  const savedAnswers = useMemo(
    () => parseDiagnosticState(storedDiagnostics)?.answers ?? {},
    [storedDiagnostics],
  );
  const [draftAnswers, setDraftAnswers] = useState<DiagnosticAnswers>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const router = useRouter();
  const answers = { ...savedAnswers, ...draftAnswers };
  const indicator = diagnosticIndicators[questionIndex];
  const selectedValue = answers[indicator.id];
  const atLastQuestion = questionIndex === diagnosticIndicators.length - 1;
  const helpId = `${indicator.id}-help`;

  const continueAssessment = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedValue) return;
    if (!atLastQuestion) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    const diagnosticState = createDiagnosticState(answers);
    localStorage.setItem("diagnostic-state", JSON.stringify(diagnosticState));
    localStorage.setItem("institution-profile", JSON.stringify(createInstitutionContext(diagnosticState.profile)));
    localStorage.setItem("navigator-session", JSON.stringify(createNavigatorSession("getting-started", {}, "guided")));
    router.push("/roadmap");
  };

  return (
    <form onSubmit={continueAssessment} className="diagnostic-form">
      <div
        className="progress"
        role="progressbar"
        aria-label="General assessment progress"
        aria-valuemin={1}
        aria-valuemax={diagnosticIndicators.length}
        aria-valuenow={questionIndex + 1}
        aria-valuetext={`Question ${questionIndex + 1} of ${diagnosticIndicators.length}`}
      >
        <span>Question {questionIndex + 1} of {diagnosticIndicators.length}</span>
        <div aria-hidden="true"><i style={{ width: `${((questionIndex + 1) / diagnosticIndicators.length) * 100}%` }} /></div>
      </div>
      <fieldset aria-describedby={helpId}>
        <legend>{indicator.question}</legend>
        <p id={helpId}>{indicator.helpText}</p>
        <div className="answer-list">
          {indicator.responseOptions.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name={indicator.id}
                value={option.value}
                checked={selectedValue === option.value}
                onChange={() => setDraftAnswers((current) => ({ ...current, [indicator.id]: option.value }))}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="question-actions">
        <button type="button" className="secondary-button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((current) => current - 1)}>Back</button>
        <button type="submit" className="primary-button" disabled={!selectedValue}>{atLastQuestion ? "Show my priorities" : "Continue"} →</button>
      </div>
    </form>
  );
}
