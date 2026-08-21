import Link from "next/link";
import { sourcesById } from "../lib/ontology";
import {
  corroborationExplanation,
  corroborationLabel,
  sourcePublisher,
  sourceSupportExplanation,
  sourceSupportLabel,
  sourceTitle,
  specificityLabel,
  supportTypeLabel,
  validationStatusLabel,
} from "../lib/evidence-presentation";
import type { Decision } from "../lib/types";
import { CORE_ORIGIN_LABEL } from "../lib/core";

export function EvidenceSummary({ decision }: { decision: Decision }) {
  const profile = decision.evidence_profile;
  return (
    <div className="evidence-summary">
      <dl className="evidence-dimensions compact">
        <div><dt>Source support</dt><dd>{sourceSupportLabel(profile.source_support)}</dd></div>
        <div><dt>Independent corroboration</dt><dd>{corroborationLabel(profile.corroboration)}</dd></div>
        <div><dt>Evidence breadth</dt><dd>{profile.evidence_breadth} source{profile.evidence_breadth === 1 ? "" : "s"}</dd></div>
        <div><dt>Validation status</dt><dd>{validationStatusLabel(profile.validation_status)}</dd></div>
      </dl>
      <p>This decision currently draws on:</p>
      <ul className="evidence-source-summary">
        {decision.evidence_links.map((link, index) => {
          const source = sourcesById.get(link.source_id);
          return (
            <li key={link.source_id}>
              <strong>{sourceTitle(source, index)}</strong>
              <span>{sourcePublisher(source)} · {supportTypeLabel(link.support_type)}</span>
            </li>
          );
        })}
      </ul>
      <p className="provenance-explanation">Source support describes how directly the cited material supports this decision. Corroboration describes whether independent sources also support it. {validationStatusLabel(profile.validation_status)}.</p>
    </div>
  );
}

export function EvidenceDetail({ decision }: { decision: Decision }) {
  const profile = decision.evidence_profile;
  return (
    <section className="evidence-section" aria-labelledby="evidence-heading">
      <div className="evidence-heading-row">
        <div>
          <p className="eyebrow">{CORE_ORIGIN_LABEL} evidence profile</p>
          <h2 id="evidence-heading">Evidence behind this decision</h2>
        </div>
      </div>

      <dl className="evidence-dimensions">
        <div>
          <dt>Source support</dt>
          <dd><strong>{sourceSupportLabel(profile.source_support)}</strong><span>{sourceSupportExplanation(profile.source_support)}</span></dd>
        </div>
        <div>
          <dt>Independent corroboration</dt>
          <dd><strong>{corroborationLabel(profile.corroboration)}</strong><span>{corroborationExplanation(profile.corroboration)}</span></dd>
        </div>
        <div><dt>Evidence breadth</dt><dd><strong>{profile.evidence_breadth} source{profile.evidence_breadth === 1 ? "" : "s"}</strong></dd></div>
        <div><dt>Specificity</dt><dd><strong>{specificityLabel(profile.specificity)}</strong></dd></div>
        <div><dt>Validation status</dt><dd><strong>{validationStatusLabel(profile.validation_status)}</strong></dd></div>
      </dl>
      <p className="evidence-method-note"><strong>Source support</strong> describes how directly the cited material supports this decision. <strong>Corroboration</strong> describes whether independent sources also support the decision. These are separate dimensions, not a combined score.</p>

      <div className="evidence-detail-group">
        <h3>Sources informing this decision</h3>
        <ol className="evidence-source-list">
          {decision.evidence_links.map((link, index) => {
            const source = sourcesById.get(link.source_id);
            return (
              <li key={link.source_id}>
                <div className="source-heading">
                  <h4>{sourceTitle(source, index)}</h4>
                  <span>{supportTypeLabel(link.support_type)}</span>
                </div>
                <p>{sourcePublisher(source)}{source?.year ? ` · ${source.year}` : " · Year unavailable"}</p>
                {source?.source_type && <p>{source.source_type}</p>}
                {source?.url ? <Link href={source.url}>View source ↗</Link> : <p className="metadata-unavailable">Source URL unavailable</p>}
                <dl>
                  <div><dt>Claim represented</dt><dd>{link.claim_supported}</dd></div>
                  <div><dt>Specificity</dt><dd>{specificityLabel(link.specificity)}</dd></div>
                  {link.source_location && <div><dt>Source location</dt><dd>{link.source_location}</dd></div>}
                  {link.notes && <div><dt>Evidence note</dt><dd>{link.notes}</dd></div>}
                </dl>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
