"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { interpretSituation, situationObservations, situationToSession } from "@/lib/situation-interpreter";
import type { SituationContext, SituationState } from "@/lib/types";

const fieldOptions: Array<{
  key: keyof SituationContext;
  label: string;
  options: Array<[string, string]>;
}> = [
  { key: "topic", label: "Primary situation", options: [["unknown", "Not clear"], ["strategy", "Strategy or direction"], ["governance", "Governance"], ["policy", "Policy or guidance"], ["procurement", "Product or vendor decision"], ["research", "Research AI"], ["infrastructure", "Infrastructure or compute"], ["teaching_learning", "Teaching and learning"], ["skills_support", "Skills and support"], ["operations", "Administrative operations"]] },
  { key: "institutionType", label: "Institution type", options: [["unknown", "Not mentioned"], ["community_college", "Community college"], ["liberal_arts", "Liberal arts college"], ["masters", "Master’s institution"], ["research_university", "Research university"], ["system", "University system"]] },
  { key: "institutionScale", label: "Institution scale", options: [["unknown", "Not mentioned"], ["small", "Small"], ["medium", "Medium"], ["large", "Large"]] },
  { key: "adoption", label: "Current AI use", options: [["unknown", "Not mentioned"], ["exploring", "Not yet in use"], ["emerging", "Some use or pilots"], ["widespread", "Use across multiple areas"]] },
  { key: "governance", label: "AI governance", options: [["unknown", "Not mentioned"], ["none", "No owner or structure"], ["informal", "Informal coordination"], ["formal", "Formal owner or body"]] },
  { key: "policy", label: "AI policy or guidance", options: [["unknown", "Not mentioned"], ["none", "None"], ["draft", "Draft or informal"], ["approved", "Approved"]] },
  { key: "dataSensitivity", label: "Data involved", options: [["unknown", "Not clear"], ["public", "Public or non-sensitive"], ["internal", "Internal institutional"], ["sensitive", "Sensitive or regulated"]] },
  { key: "procurement", label: "Procurement status", options: [["unknown", "Not clear"], ["none", "No purchase involved"], ["new", "New product or vendor"], ["existing", "Existing vendor or renewal"]] },
  { key: "peopleImpact", label: "Consequential decisions about people", options: [["unknown", "Not clear"], ["yes", "Yes or possibly"], ["no", "No"]] },
];

export function SituationInterpreter({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState("");
  const [interpreted, setInterpreted] = useState<SituationState | null>(null);
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  const interpret = (event: FormEvent) => {
    event.preventDefault();
    if (text.trim().length < 20) return;
    setInterpreted(interpretSituation(text.trim()));
    setEditing(false);
  };
  const updateContext = (key: keyof SituationContext, value: string) => {
    setInterpreted((current) => current ? {
      ...current,
      context: { ...current.context, [key]: value },
      observations: situationObservations({ ...current.context, [key]: value } as SituationContext),
    } : current);
  };
  const confirm = () => {
    if (!interpreted) return;
    const confirmed = { ...interpreted, confirmed: true };
    localStorage.setItem("situation-state", JSON.stringify(confirmed));
    localStorage.setItem("navigator-session", JSON.stringify(situationToSession(confirmed.context)));
    router.push("/roadmap");
  };
  const startOver = () => {
    setText("");
    setInterpreted(null);
    setEditing(false);
    localStorage.removeItem("situation-state");
  };

  if (!interpreted) {
    return (
      <main className="situation-page">
        <section className="path-head compact">
          <button className="text-button" onClick={onBack}>← Back to start options</button>
          <p className="eyebrow">Experimental · Context interpreter</p>
          <h1>Describe your situation.</h1>
          <p className="lede">Tell us about the problem, project, or question in front of you. Do not include names or other personal information.</p>
        </section>
        <form className="situation-form" onSubmit={interpret}>
          <label htmlFor="situation-description">What is happening at your institution?</label>
          <textarea id="situation-description" value={text} onChange={(event) => setText(event.target.value)} rows={8} placeholder="For example: Faculty are already using several AI tools, we do not have an AI policy yet, and we are considering an enterprise platform." />
          <p>This prototype uses deterministic phrase matching. It does not send your description to an AI service.</p>
          <button className="primary-button" type="submit" disabled={text.trim().length < 20}>Interpret my situation →</button>
        </form>
      </main>
    );
  }

  return (
    <main className="situation-page">
      <section className="path-head compact">
        <p className="eyebrow">Review before recommendations</p>
        <h1>Here&apos;s what I understood</h1>
        <p>Unknown information stays unknown. Review or correct this interpretation before it enters the deterministic decision engine.</p>
      </section>
      <section className="interpretation-review" aria-labelledby="interpretation-heading">
        <h2 id="interpretation-heading">Interpreted context</h2>
        {interpreted.observations.length ? <ul>{interpreted.observations.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No structured conditions were identified. Edit the interpretation or add more detail.</p>}
        {editing && <div className="interpretation-fields">{fieldOptions.map((field) => (
          <label key={field.key}>{field.label}
            <select value={interpreted.context[field.key]} onChange={(event) => updateContext(field.key, event.target.value)}>
              {field.options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
        ))}</div>}
        <div className="review-actions">
          <button className="primary-button" onClick={confirm}>That&apos;s right — show decisions</button>
          <button className="secondary-button" onClick={() => setEditing((current) => !current)}>{editing ? "Finish editing" : "Edit this"}</button>
          <button className="text-button" onClick={startOver}>Start over</button>
        </div>
      </section>
    </main>
  );
}
