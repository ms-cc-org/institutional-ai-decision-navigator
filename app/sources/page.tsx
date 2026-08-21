import Link from "next/link";
import { ontology, splitField } from "@/lib/ontology";

export default function SourcesPage() {
  return (
    <main className="sources-page">
      <header>
        <p className="eyebrow">Source registry</p>
        <h1>Sources represented in the ontology.</h1>
        <p className="lede">These {ontology.sources.length} records are the source metadata supplied by ontology v{ontology.version}. A source association is traceability metadata; its evidence link describes whether support is direct, corroborating, contextual, or researcher synthesis.</p>
      </header>
      <section className="source-registry" aria-label="Ontology source registry">
        {ontology.sources.map((source) => {
          const decisions = ontology.decisions.filter((decision) => splitField(decision.source_ids).includes(source.id));
          return (
            <article key={source.id}>
              <div className="source-registry-heading">
                <div>
                  <p>{source.source_type}</p>
                  <h2>{source.title}</h2>
                  <p>{source.publisher}{source.year ? ` · ${source.year}` : " · Year unavailable"} · {source.geography}</p>
                </div>
                <span>{decisions.length} decision{decisions.length === 1 ? "" : "s"}</span>
              </div>
              {source.url ? <Link href={source.url}>View source ↗</Link> : <p className="metadata-unavailable">Source URL unavailable</p>}
              {source.notes && <p>{source.notes}</p>}
              <details>
                <summary>Decisions citing this source</summary>
                <ul>{decisions.map((decision) => <li key={decision.id}><Link href={`/decisions/${decision.id}`}>{decision.question}</Link></li>)}</ul>
              </details>
            </article>
          );
        })}
      </section>
    </main>
  );
}
