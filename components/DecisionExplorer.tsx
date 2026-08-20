"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { corroborationLabel, sourceSupportLabel, validationStatusLabel } from "@/lib/evidence-presentation";
import { emptyExplorerFilters, filterDecisions } from "@/lib/explorer";
import { ontology } from "@/lib/ontology";

const topicLabels: Record<string, string> = {
  "Accessibility, Equity & Community": "Accessibility & equity",
  "Administrative & Operational AI": "Administrative AI",
  "Data Governance & Privacy": "Data & privacy",
  "Evaluation, Monitoring & Lifecycle": "Evaluation & lifecycle",
  "Governance & Accountability": "Governance & accountability",
  "Policy, Compliance & Risk": "Policy & risk",
  "Procurement & Vendor Management": "Procurement & vendors",
  "Research & Research Computing": "Research & research computing",
  "Security, Identity & Access": "Security & access",
  "Strategy & Portfolio": "Strategy & priorities",
  "Teaching, Learning & Student Experience": "Teaching & learning",
  "Technology & Infrastructure": "Technology & infrastructure",
  "Workforce, Training & Support": "Workforce & training",
};
const topics = [...new Set(ontology.decisions.map((decision) => decision.domain))]
  .map((value) => ({ value, label: topicLabels[value] ?? value }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function DecisionExplorer() {
  const [filters, setFilters] = useState(emptyExplorerFilters);
  const decisions = useMemo(() => filterDecisions(ontology.decisions, filters), [filters]);
  const setFilter = (key: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  return (
    <main className="explorer-page">
      <header>
        <p className="eyebrow">Browse by topic</p>
        <h1>Explore institutional AI decisions</h1>
        <p className="lede">Choose a topic or search for something your institution is working through.</p>
      </header>
      <section className="explorer-controls" aria-label="Search and filter decisions">
        <label className="search-field">Search decisions or recommended actions
          <input type="search" value={filters.query} onChange={(event) => setFilter("query", event.target.value)} placeholder={'Try "AI policy," "student data," "GPUs," or "vendor review"'} />
        </label>
        <label>Topic<select value={filters.domain} onChange={(event) => setFilter("domain", event.target.value)}><option value="all">All topics</option>{topics.map((topic) => <option value={topic.value} key={topic.value}>{topic.label}</option>)}</select></label>
        <label>Source support<select value={filters.sourceSupport} onChange={(event) => setFilter("sourceSupport", event.target.value)}><option value="all">All levels</option><option value="direct">Direct</option><option value="synthesized">Synthesized</option><option value="contextual">Contextual</option></select></label>
        <label>Independent corroboration<select value={filters.corroboration} onChange={(event) => setFilter("corroboration", event.target.value)}><option value="all">All levels</option><option value="multiple_independent_sources">Multiple independent sources</option><option value="partial">Partial</option><option value="none">None</option></select></label>
        <label>Validation status<select value={filters.validationStatus} onChange={(event) => setFilter("validationStatus", event.target.value)}><option value="all">All statuses</option><option value="not_validated">Not yet practitioner validated</option><option value="practitioner_supported">Practitioner supported</option><option value="mixed">Mixed</option><option value="challenged">Challenged</option></select></label>
        <button className="secondary-button" onClick={() => setFilters(emptyExplorerFilters)}>Clear filters</button>
      </section>
      <p className="explorer-count" aria-live="polite">{decisions.length} decision{decisions.length === 1 ? "" : "s"}</p>
      <section className="explorer-results" aria-label="Guidance results">
        {decisions.map((decision) => (
          <article key={decision.id}>
            <p className="domain">{topicLabels[decision.domain] ?? decision.domain}</p>
            <h2><Link href={`/decisions/${decision.id}`}>{decision.question}</Link></h2>
            <p><strong>Recommended action:</strong> {decision.decision_output}</p>
            <dl>
              <div><dt>Source support</dt><dd>{sourceSupportLabel(decision.evidence_profile.source_support)}</dd></div>
              <div><dt>Corroboration</dt><dd>{corroborationLabel(decision.evidence_profile.corroboration)}</dd></div>
              <div><dt>Validation</dt><dd>{validationStatusLabel(decision.evidence_profile.validation_status)}</dd></div>
            </dl>
            <Link className="detail-link" href={`/decisions/${decision.id}`}>View decision guidance →</Link>
          </article>
        ))}
        {decisions.length === 0 && <p>No guidance matches your current search and topic filters.</p>}
      </section>
    </main>
  );
}
