import Link from "next/link";
import type { IntentRecommendation } from "../lib/types";

export function FollowUpSection({ heading, items, conditional = false }: { heading: string; items: IntentRecommendation[]; conditional?: boolean }) {
  if (items.length === 0) return null;
  const headingId = conditional ? "conditional-heading" : "next-heading";
  return (
    <section className={`then-consider${conditional ? " conditional-consider" : ""}`} aria-labelledby={headingId}>
      <p className="eyebrow" id={headingId}>{heading}</p>
      <div>{items.slice(0, 4).map((item) => (
        <Link key={item.decisionId} href={`/decisions/${item.decisionId}`}><strong>{item.plainLanguageTitle}</strong><span>{item.reason}</span><b aria-hidden="true">→</b></Link>
      ))}</div>
    </section>
  );
}
