"use client";
import Link from "next/link";
import { useMemo,useState,useSyncExternalStore } from "react";
import { evaluateProfile } from "@/lib/engine";
import { decisionsById, ontology } from "@/lib/ontology";
import type { InstitutionProfile, Priority } from "@/lib/types";
import { EvidenceSummary } from "./EvidenceDisclosure";

const labels:Record<Priority,string>={DO_NOW:"Do now",DO_NEXT:"Do next",LATER:"Later",NOT_CURRENTLY_RELEVANT:"Not currently relevant"};
const order:Priority[]=["DO_NOW","DO_NEXT","LATER","NOT_CURRENTLY_RELEVANT"];
const subscribeToStorage=(onStoreChange:()=>void)=>{window.addEventListener("storage",onStoreChange);return()=>window.removeEventListener("storage",onStoreChange)};
const getStoredProfile=()=>localStorage.getItem("institution-profile")??"";
const getServerProfile=()=>undefined;
export function Roadmap(){
 const savedProfile=useSyncExternalStore(subscribeToStorage,getStoredProfile,getServerProfile); const [domain,setDomain]=useState("All domains");
 const profile=useMemo(()=>{if(savedProfile===undefined)return undefined;if(!savedProfile)return null;try{return JSON.parse(savedProfile) as InstitutionProfile}catch{return null}},[savedProfile]);
 const recs=useMemo(()=>profile?evaluateProfile(profile):[],[profile]); const domains=["All domains",...Array.from(new Set(ontology.decisions.map(d=>d.domain)))];
 if(profile===undefined)return <section className="empty" aria-live="polite"><p>Loading your roadmap…</p></section>;
 if(!profile)return <section className="empty"><p className="eyebrow">No profile found</p><h1>Build a profile first.</h1><Link className="button-link" href="/">Start questionnaire →</Link></section>;
 return <><section className="roadmap-head"><div><p className="eyebrow">Your decision roadmap</p><h1>A sequenced path from foundations to scale.</h1><p>Each placement is produced by documented rules, your profile, and ontology prerequisites.</p></div><Link href="/" className="text-link">← Edit profile</Link></section>
 <div className="roadmap-tools"><div className="summary">{order.slice(0,3).map(p=><div key={p}><strong>{recs.filter(r=>r.priority===p).length}</strong><span>{labels[p]}</span></div>)}</div><label>Filter by domain<select value={domain} onChange={e=>setDomain(e.target.value)}>{domains.map(d=><option key={d}>{d}</option>)}</select></label></div>
 {order.map(priority=>{const items=recs.filter(r=>r.priority===priority&&(domain==="All domains"||decisionsById.get(r.decisionId)?.domain===domain)); return <section className={`lane ${priority.toLowerCase()}`} key={priority}><div className="lane-title"><h2>{labels[priority]}</h2><span>{items.length}</span></div>{items.length===0?<p className="no-results">No decisions in this category match the current domain filter.</p>:<div className="cards">{items.map(rec=>{const d=decisionsById.get(rec.decisionId)!;return <article className="decision-card" key={d.id}><div className="card-meta"><span>{d.id}</span><span>{d.maturity_stage}</span></div><p className="domain">{d.domain}</p><h3><Link href={`/decisions/${d.id}`}>{d.question}</Link></h3><div className="why"><h4>Why this is here</h4><ul>{rec.reasons.map(r=><li key={r}>{r}</li>)}</ul></div><dl><div><dt>Expected output</dt><dd>{d.decision_output}</dd></div>{rec.prerequisites.length>0&&<div><dt>Prerequisites</dt><dd className="prerequisite-links">{rec.prerequisites.map(id=><Link key={id} href={`/decisions/${id}`}>{id}: {decisionsById.get(id)?.question}</Link>)}</dd></div>}</dl><details className="card-evidence"><summary>Evidence behind this recommendation</summary><EvidenceSummary decision={d} /></details><Link className="detail-link" href={`/decisions/${d.id}`}>View decision detail →</Link></article>})}</div>}</section>})}</>;
}
