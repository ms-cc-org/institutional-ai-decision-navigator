"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Decision, DecisionFeedback, Relationship, RelationshipFeedback, ValidatorProfile } from "@/lib/types";
import { ontology } from "@/lib/ontology";
import {
  buildValidationExport, DECISION_FEEDBACK_KEY, parseFeedbackCollection,
  parseValidatorProfile, PILOT_STORAGE_EVENT, RELATIONSHIP_FEEDBACK_KEY, relationshipFeedbackId,
  saveDecisionFeedback, saveRelationshipFeedback, saveValidatorProfile, VALIDATOR_PROFILE_KEY,
} from "@/lib/validation";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener(PILOT_STORAGE_EVENT, onChange);
  return () => { window.removeEventListener("storage", onChange); window.removeEventListener(PILOT_STORAGE_EVENT, onChange); };
};
const getSnapshot = () => JSON.stringify([localStorage.getItem(VALIDATOR_PROFILE_KEY), localStorage.getItem(DECISION_FEEDBACK_KEY), localStorage.getItem(RELATIONSHIP_FEEDBACK_KEY)]);
const getServerSnapshot = () => "";
const notify = () => window.dispatchEvent(new Event(PILOT_STORAGE_EVENT));
const now = () => new Date().toISOString();

const roles = [["", "Choose a role"], ["cio_it_leadership", "CIO / IT leadership"], ["research_computing", "Research computing / cyberinfrastructure"], ["faculty", "Faculty"], ["research_administration", "Research administration"], ["teaching_learning", "Teaching and learning"], ["library", "Library"], ["privacy_security_compliance", "Privacy / security / compliance"], ["accessibility", "Accessibility"], ["senior_leadership", "Senior institutional leadership"], ["student", "Student"], ["other", "Other"]] as const;

export function WorkingGroupReview({ decision, prerequisiteRelationships }: { decision: Decision; prerequisiteRelationships: Relationship[] }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const state = useMemo(() => {
    const [profileValue, decisionValue, relationshipValue] = snapshot ? JSON.parse(snapshot) as Array<string | null> : [null, null, null];
    return {
      profile: parseValidatorProfile(profileValue),
      decisions: parseFeedbackCollection<DecisionFeedback>(decisionValue).items,
      relationships: parseFeedbackCollection<RelationshipFeedback>(relationshipValue).items,
    };
  }, [snapshot]);
  const feedback = state.decisions[decision.id] ?? { decisionId: decision.id, relevance: "", clarity: "", sequencing: "", comments: "", updatedAt: "" };
  const updateProfile = (key: keyof ValidatorProfile, value: string) => {
    saveValidatorProfile(localStorage, { ...state.profile, [key]: value } as ValidatorProfile); notify();
  };
  const updateDecision = (key: keyof DecisionFeedback, value: string) => {
    saveDecisionFeedback(localStorage, { ...feedback, [key]: value, updatedAt: now() } as DecisionFeedback); notify();
  };
  const updateRelationship = (relationship: Relationship, key: keyof RelationshipFeedback, value: string) => {
    const id = relationshipFeedbackId(relationship.from, relationship.to);
    const current = state.relationships[id] ?? { from: relationship.from, to: relationship.to, response: "", comments: "", updatedAt: "" };
    saveRelationshipFeedback(localStorage, { ...current, [key]: value, updatedAt: now() } as RelationshipFeedback); notify();
  };
  const exportFeedback = () => {
    const data = JSON.stringify(buildValidationExport(state.profile, state.decisions, state.relationships, ontology.version), null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "mscc-working-group-feedback.json"; anchor.style.display = "none";
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  return (
    <details className="working-group-review">
      <summary>Help validate this decision</summary>
      <div className="validation-intro"><p className="eyebrow">MS-CC pilot working-group review</p><h2>Practitioner feedback</h2><p>Your responses are <strong>saved on this device</strong>. They are not centrally submitted. Export the file when you are ready to share it with MS-CC.</p></div>
      <fieldset className="validator-context"><legend>Optional validator context</legend>
        <label>Role<select value={state.profile.role} onChange={(event) => updateProfile("role", event.target.value)}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Institution type<select value={state.profile.institutionType} onChange={(event) => updateProfile("institutionType", event.target.value)}><option value="">Prefer not to say</option><option value="community_college">Community college</option><option value="liberal_arts">Liberal arts college</option><option value="masters">Master’s institution</option><option value="research_university">Research university</option><option value="system">University system</option></select></label>
        <label>Institution size<select value={state.profile.institutionSize} onChange={(event) => updateProfile("institutionSize", event.target.value)}><option value="">Choose a range</option><option value="under_2500">Under 2,500</option><option value="2500_5000">2,500–5,000</option><option value="5000_15000">5,000–15,000</option><option value="over_15000">Over 15,000</option><option value="prefer_not">Prefer not to say</option></select></label>
      </fieldset>
      <div className="decision-validation">
        <label>Is this a decision institutions need to make?<select value={feedback.relevance} onChange={(event) => updateDecision("relevance", event.target.value)}><option value="">Choose</option><option value="yes">Yes</option><option value="depends">Sometimes / depends</option><option value="no">No</option><option value="unsure">Not sure</option></select></label>
        <label>Is this decision framed clearly?<select value={feedback.clarity} onChange={(event) => updateDecision("clarity", event.target.value)}><option value="">Choose</option><option value="yes">Yes</option><option value="mostly">Mostly</option><option value="no">No</option></select></label>
        <label>When should this decision typically be addressed?<select value={feedback.sequencing} onChange={(event) => updateDecision("sequencing", event.target.value)}><option value="">Choose</option><option value="earlier">Earlier</option><option value="about_here">About here</option><option value="later">Later</option><option value="depends">It depends</option></select></label>
        <label>What is missing or needs to change? <span>Optional</span><textarea rows={4} value={feedback.comments} onChange={(event) => updateDecision("comments", event.target.value)} /></label>
      </div>
      {prerequisiteRelationships.length > 0 && <section className="relationship-validation"><h3>Prerequisite relationship review</h3>{prerequisiteRelationships.map((relationship) => {
        const prerequisite = ontology.decisions.find((item) => item.id === relationship.from)!;
        const current = state.relationships[relationshipFeedbackId(relationship.from, relationship.to)] ?? { response: "", comments: "" };
        return <fieldset key={`${relationship.from}-${relationship.to}`}><legend>Should institutions generally resolve “{prerequisite.question}” before “{decision.question}”?</legend><label>Response<select value={current.response} onChange={(event) => updateRelationship(relationship, "response", event.target.value)}><option value="">Choose</option><option value="yes">Yes</option><option value="depends">It depends</option><option value="no">No</option><option value="unsure">Not sure</option></select></label><label>What makes this relationship depend on context? <span>Optional</span><textarea rows={3} value={current.comments} onChange={(event) => updateRelationship(relationship, "comments", event.target.value)} /></label></fieldset>;
      })}</section>}
      <button className="secondary-button" onClick={exportFeedback}>Export working-group feedback (JSON)</button>
    </details>
  );
}
