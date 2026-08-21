import Link from "next/link";
import { institutionConfig } from "../config/institution";
import type { LocalGuidanceItem } from "../lib/local-guidance";

export function LocalGuidanceSection({ items }: { items: LocalGuidanceItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="local-guidance-section" aria-labelledby="local-guidance-heading">
      <p className="eyebrow">Institution local</p>
      <h2 id="local-guidance-heading">Your institution&apos;s guidance</h2>
      <p>These policies and annotations were added by {institutionConfig.institutionName}. They are separate from the MS-CC core evidence shown above.</p>
      <div className="local-guidance-list">
        {items.map((item) => (
          <article key={item.id}>
            <div className="local-guidance-heading"><div><span>{item.guidance_type.replaceAll("_", " ")}</span><h3>{item.title}</h3></div><b>Institution local</b></div>
            <p>{item.publisher}</p>
            {item.url ? <Link href={item.url}>View local guidance ↗</Link> : <p className="metadata-unavailable">Local guidance URL unavailable</p>}
            <dl>
              {item.notes && <div><dt>Guidance note</dt><dd>{item.notes}</dd></div>}
              {item.localNotes && <div><dt>Local annotation</dt><dd>{item.localNotes}</dd></div>}
              {item.localAction && <div><dt>Local action</dt><dd>{item.localAction}</dd></div>}
              {item.localOwner && <div><dt>Local owner</dt><dd>{item.localOwner}</dd></div>}
              {item.localContact && <div><dt>Local contact</dt><dd>{item.localContact}</dd></div>}
            </dl>
            {item.localPolicyReferences?.length ? <ul>{item.localPolicyReferences.map((reference) => <li key={reference.url}><Link href={reference.url}>{reference.label} ↗</Link></li>)}</ul> : null}
            <p className="local-origin">Origin: <code>{item.origin}</code>. This content is not part of the MS-CC core evidence base.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
