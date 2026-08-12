"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { InstitutionProfile } from "@/lib/types";

const initial: InstitutionProfile = { institutionType:"masters", institutionScale:"medium", researchIntensity:"moderate", itCapacity:"moderate", researchComputingCapacity:"moderate", aiGovernanceMaturity:"informal", dataGovernanceMaturity:"developing", securityMaturity:"developing", aiAdoptionLevel:"emerging", primaryObjectives:["teaching_learning"], regulatedDataUsage:true, budgetFlexibility:"moderate", aiExpertise:"moderate", accessibilityMaturity:"developing" };
const fields = [
  ["institutionType","Institution type",[["community_college","Community college"],["liberal_arts","Liberal arts college"],["masters","Master’s institution"],["research_university","Research university"],["system","University system"]]],
  ["researchIntensity","Research intensity",[["low","Low / teaching focused"],["moderate","Moderate"],["high","High"]]],
  ["aiAdoptionLevel","Current AI adoption",[["exploring","Exploring"],["emerging","Emerging across some units"],["widespread","Widespread"]]],
  ["aiGovernanceMaturity","AI governance",[["none","No formal governance"],["informal","Informal / forming"],["formal","Formal and operating"]]],
  ["dataGovernanceMaturity","Data governance",[["weak","Weak / inconsistent"],["developing","Developing"],["strong","Strong"]]],
  ["researchComputingCapacity","Research computing / AI capacity",[["limited","Limited"],["moderate","Moderate"],["strong","Strong"]]],
] as const;
const objectives = [["teaching_learning","Teaching & learning"],["research","Research"],["student_services","Student services"],["administration","Administration"],["workforce","Workforce productivity"]] as const;
export function ProfileForm() {
  const [profile,setProfile] = useState(initial); const router=useRouter();
  const submit=(e:FormEvent)=>{e.preventDefault(); if(profile.primaryObjectives.length===0)return; localStorage.setItem("institution-profile",JSON.stringify(profile)); localStorage.setItem("navigator-session",JSON.stringify({intentId:"getting-started",answers:{}})); router.push("/roadmap");};
  return <form onSubmit={submit}><div className="question-grid">{fields.map(([key,label,options],index)=><label className="field" key={key}><span><b>{String(index+1).padStart(2,"0")}</b>{label}</span><select value={String(profile[key])} onChange={(e)=>setProfile({...profile,[key]:e.target.value})}>{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>)}
  <fieldset className="field"><legend><b>07</b>Sensitive or regulated data</legend><div className="segmented"><label><input type="radio" checked={profile.regulatedDataUsage} onChange={()=>setProfile({...profile,regulatedDataUsage:true})}/> Yes</label><label><input type="radio" checked={!profile.regulatedDataUsage} onChange={()=>setProfile({...profile,regulatedDataUsage:false})}/> No</label></div></fieldset>
  <fieldset className="field wide"><legend><b>08</b>Primary AI objectives <small>Select one or more</small></legend><div className="checks">{objectives.map(([value,label])=><label key={value}><input type="checkbox" checked={profile.primaryObjectives.includes(value)} onChange={(e)=>setProfile({...profile,primaryObjectives:e.target.checked?[...profile.primaryObjectives,value]:profile.primaryObjectives.filter((x)=>x!==value)})}/><span>{label}</span></label>)}</div>{profile.primaryObjectives.length===0&&<p className="field-error" role="alert">Select at least one objective.</p>}</fieldset></div><div className="submit-row"><p>Results are deterministic and show the evidence and synthesis behind each decision.</p><button type="submit">Build my roadmap <span>→</span></button></div></form>;
}
