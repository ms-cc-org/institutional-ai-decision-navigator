import type { Intent, IntentId } from "./types";

const yesNoUnsure = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

export const intents: Intent[] = [
  {
    id: "set-direction",
    title: "Set AI direction",
    description: "Clarify institutional goals, priorities, and the scope of AI work.",
    relevantDomains: ["Strategy & Portfolio", "Governance & Accountability"],
    seedDecisionIds: ["STR-001", "STR-002", "STR-003", "STR-004"],
    contextQuestions: [
      { id: "planning_stage", prompt: "Where are you in the planning process?", options: [{value:"starting",label:"Just starting"},{value:"resetting",label:"Resetting an existing approach"},{value:"scaling",label:"Scaling active work"},{value:"unsure",label:"Not sure"}] },
      { id: "current_use", prompt: "Is AI already being used across multiple units?", options: yesNoUnsure },
      { id: "priority_pressure", prompt: "Are there more proposed uses than your institution can support?", options: yesNoUnsure },
    ],
  },
  {
    id: "create-governance",
    title: "Create AI governance",
    description: "Establish ownership, representation, and decision rights.",
    relevantDomains: ["Governance & Accountability", "Strategy & Portfolio"],
    seedDecisionIds: ["GOV-001", "GOV-002", "GOV-003", "GOV-004", "GOV-007"],
    contextQuestions: [
      { id: "governance_state", prompt: "How are AI decisions governed today?", options: [{value:"none",label:"No established approach"},{value:"informal",label:"Informal coordination"},{value:"formal",label:"A formal body exists"},{value:"unsure",label:"Not sure"}] },
      { id: "decentralized", prompt: "Are units adopting AI independently?", options: yesNoUnsure },
      { id: "consequential", prompt: "Could AI influence consequential decisions about people?", options: yesNoUnsure },
      { id: "deployed", prompt: "Are any AI systems already approved or deployed?", options: yesNoUnsure },
    ],
  },
  {
    id: "develop-policy",
    title: "Develop AI policy",
    description: "Set practical rules for acceptable use, risk, data, and compliance.",
    relevantDomains: ["Policy, Compliance & Risk", "Data Governance & Privacy"],
    seedDecisionIds: ["POL-001", "POL-003", "POL-005", "DAT-002", "POL-009"],
    contextQuestions: [
      { id: "audience", prompt: "Who needs guidance first?", options: [{value:"all",label:"The whole institution"},{value:"students",label:"Students and faculty"},{value:"staff",label:"Staff and administrators"},{value:"researchers",label:"Researchers"},{value:"unsure",label:"Not sure"}] },
      { id: "sensitive_data", prompt: "Will AI use include sensitive or regulated data?", options: yesNoUnsure },
      { id: "consequential", prompt: "Could AI influence consequential decisions about people?", options: yesNoUnsure },
      { id: "procurement", prompt: "Will the policy guide AI purchasing or renewals?", options: yesNoUnsure },
    ],
  },
  {
    id: "evaluate-tool",
    title: "Evaluate an AI tool",
    description: "Review a product or feature before purchase, renewal, or use.",
    relevantDomains: ["Procurement & Vendor Management", "Data Governance & Privacy", "Policy, Compliance & Risk", "Accessibility, Equity & Community"],
    seedDecisionIds: ["PRO-002", "DAT-001", "POL-009", "PRO-005"],
    contextQuestions: [
      { id: "tool_type", prompt: "What kind of tool are you considering?", options: [{value:"productivity",label:"General productivity AI"},{value:"teaching",label:"Teaching or learning tool"},{value:"research",label:"Research tool"},{value:"administrative",label:"Administrative system"},{value:"student",label:"Student-facing tool"},{value:"unsure",label:"Not sure"}] },
      { id: "data_access", prompt: "What data will it access?", options: [{value:"public",label:"Public or non-sensitive data"},{value:"internal",label:"Internal institutional data"},{value:"sensitive",label:"Sensitive or regulated data"},{value:"unsure",label:"Not sure"}] },
      { id: "people_decisions", prompt: "Will it make or materially influence decisions about people?", options: yesNoUnsure },
      { id: "purchase_type", prompt: "How is the tool entering the institution?", options: [{value:"new",label:"New product or vendor"},{value:"existing",label:"AI feature in an existing product"},{value:"unsure",label:"Not sure"}] },
    ],
  },
  {
    id: "support-research",
    title: "Support research AI",
    description: "Plan a feasible, secure, and reproducible research AI project.",
    relevantDomains: ["Research & Research Computing", "Technology & Infrastructure", "Security, Identity & Access"],
    seedDecisionIds: ["RES-002", "RES-003", "SEC-007", "RES-011", "RES-008"],
    contextQuestions: [
      { id: "research_stage", prompt: "Where is the research project?", options: [{value:"idea",label:"Early idea or proposal"},{value:"planning",label:"Planning or budgeting"},{value:"active",label:"Active development"},{value:"publishing",label:"Preparing to publish or share"}] },
      { id: "research_data", prompt: "What kind of data is involved?", options: [{value:"public",label:"Public or open data"},{value:"institutional",label:"Institutional or collaborator data"},{value:"sensitive",label:"Restricted, regulated, or sensitive data"},{value:"unsure",label:"Not sure"}] },
      { id: "local_compute", prompt: "Can local computing resources support the expected workload?", options: [{value:"limited",label:"No or probably not"},{value:"adequate",label:"Yes"},{value:"unsure",label:"Not sure"}] },
      { id: "research_output", prompt: "Will results be published, shared, or revisited?", options: yesNoUnsure },
    ],
  },
  {
    id: "infrastructure",
    title: "Make infrastructure decisions",
    description: "Choose compute, hosting, scaling, and service operating models.",
    relevantDomains: ["Technology & Infrastructure", "Research & Research Computing"],
    seedDecisionIds: ["TEC-001", "TEC-002", "TEC-003", "TEC-004", "TEC-010"],
    contextQuestions: [
      { id: "workload_known", prompt: "Is the AI workload clearly defined?", options: yesNoUnsure },
      { id: "demand", prompt: "How consistent is demand for compute?", options: [{value:"one-off",label:"One project or experiment"},{value:"recurring",label:"Recurring demand"},{value:"multiple",label:"Multiple teams need it"},{value:"unsure",label:"Not sure"}] },
      { id: "data_access", prompt: "Will infrastructure handle sensitive or regulated data?", options: yesNoUnsure },
      { id: "local_capacity", prompt: "How strong is current local capacity?", options: [{value:"limited",label:"Limited"},{value:"moderate",label:"Moderate"},{value:"strong",label:"Strong"}] },
    ],
  },
  {
    id: "teaching-learning",
    title: "Address teaching & learning",
    description: "Set course guidance, redesign assessment, and build student AI literacy.",
    relevantDomains: ["Teaching, Learning & Student Experience", "Workforce, Training & Support", "Accessibility, Equity & Community"],
    seedDecisionIds: ["TL-001", "TL-002", "TL-006", "PEO-001", "ACC-001"],
    contextQuestions: [
      { id: "ai_use", prompt: "How common is student AI use today?", options: [{value:"exploring",label:"Limited or exploratory"},{value:"emerging",label:"Emerging across courses"},{value:"widespread",label:"Widespread"},{value:"unsure",label:"Not sure"}] },
      { id: "course_guidance", prompt: "Do courses have clear AI-use guidance?", options: yesNoUnsure },
      { id: "governance", prompt: "Is there a formal institutional AI governance process?", options: yesNoUnsure },
      { id: "assessment", prompt: "Are existing assessments being disrupted by generative AI?", options: yesNoUnsure },
      { id: "accessibility", prompt: "Have accessibility requirements for AI tools been defined?", options: yesNoUnsure },
    ],
  },
  {
    id: "skills-support",
    title: "Build AI skills and support",
    description: "Prioritize literacy, training, support, and shared expertise.",
    relevantDomains: ["Workforce, Training & Support"],
    seedDecisionIds: ["PEO-001", "PEO-002", "PEO-003", "PEO-004", "PEO-006"],
    contextQuestions: [
      { id: "audience", prompt: "Who needs support most urgently?", options: [{value:"all",label:"The whole institution"},{value:"faculty",label:"Faculty"},{value:"staff",label:"Staff"},{value:"students",label:"Students"},{value:"researchers",label:"Researchers"}] },
      { id: "expertise", prompt: "How much internal AI expertise is available?", options: [{value:"limited",label:"Limited"},{value:"distributed",label:"Some, but distributed"},{value:"strong",label:"Strong"}] },
      { id: "demand", prompt: "Does training demand exceed current capacity?", options: yesNoUnsure },
      { id: "support", prompt: "Is there a clear place for users to get AI help?", options: yesNoUnsure },
    ],
  },
  {
    id: "administrative-automation",
    title: "Automate an administrative process",
    description: "Assess an operational workflow, accountability, and monitoring needs.",
    relevantDomains: ["Administrative & Operational AI", "Governance & Accountability", "Evaluation, Monitoring & Lifecycle"],
    seedDecisionIds: ["OPS-001", "OPS-003", "OPS-002", "GOV-007", "EVA-001"],
    contextQuestions: [
      { id: "process_stage", prompt: "Where is the automation idea today?", options: [{value:"idea",label:"Early idea"},{value:"pilot",label:"Pilot or prototype"},{value:"live",label:"Already live"}] },
      { id: "people_decisions", prompt: "Could it influence admissions, employment, aid, discipline, or similar decisions?", options: yesNoUnsure },
      { id: "data_access", prompt: "Will it use sensitive or regulated data?", options: yesNoUnsure },
      { id: "human_review", prompt: "Will a person review important outputs before action?", options: yesNoUnsure },
    ],
  },
  {
    id: "getting-started",
    title: "I don’t know where to start",
    description: "Use a short institutional assessment to identify three strategic priorities.",
    relevantDomains: [],
    seedDecisionIds: ["GOV-001", "DAT-001", "POL-001"],
    contextQuestions: [],
  },
];

export const intentsById = new Map<IntentId, Intent>(intents.map((intent) => [intent.id, intent]));
