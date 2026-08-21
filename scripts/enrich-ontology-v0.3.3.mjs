import { readFileSync, writeFileSync } from "node:fs";

const ontologyPath = new URL("../data/ontology.json", import.meta.url);
const ontology = JSON.parse(readFileSync(ontologyPath, "utf8"));

const sources = [
  {
    id: "C039",
    title: "Guidance Regarding Methods for De-identification of Protected Health Information in Accordance with the HIPAA Privacy Rule",
    publisher: "U.S. Department of Health and Human Services, Office for Civil Rights",
    year: 2012,
    source_type: "federal_guidance",
    geography: "United States",
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/de-identification/index.html",
    verification: "verified",
    notes: "Authoritative HIPAA guidance defining Safe Harbor and Expert Determination methods and noting that de-identified data retains nonzero re-identification risk.",
  },
  {
    id: "C040",
    title: "Guidance on HIPAA & Cloud Computing",
    publisher: "U.S. Department of Health and Human Services, Office for Civil Rights",
    year: 2016,
    source_type: "federal_guidance",
    geography: "United States",
    url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html",
    verification: "verified",
    notes: "Authoritative guidance on use of cloud service providers for ePHI, including business associate obligations and BAAs.",
  },
  {
    id: "C041",
    title: "Considerations for Patient Privacy of Large Language Models in Health Care: Scoping Review",
    publisher: "Journal of Medical Internet Research",
    year: 2025,
    source_type: "peer_reviewed_scoping_review",
    geography: "International",
    url: "https://pubmed.ncbi.nlm.nih.gov/41269747/",
    verification: "verified",
    notes: "Review of 464 PHI-LLM studies. 38.4% did not report effective PHI protection measures; substantial gaps were found in reporting anonymization and de-identification methods.",
  },
  {
    id: "C042",
    title: "Privacy preserving strategies for electronic health records in the era of large language models",
    publisher: "npj Digital Medicine",
    year: 2025,
    source_type: "peer_reviewed_review",
    geography: "International",
    url: "https://www.nature.com/articles/s41746-025-01429-0",
    verification: "verified",
    notes: "Reviews context-aware privacy strategies for EHR use with LLMs, including de-identification, differential privacy, federated learning, synthetic data, and local deployment.",
  },
  {
    id: "C043",
    title: "Privacy Challenges and Solutions in Retrieval-Augmented Generation-Enhanced LLMs for Healthcare Chatbots: A Review of Applications, Risks, and Future Directions",
    publisher: "arXiv",
    year: 2025,
    source_type: "preprint_review",
    geography: "International",
    url: "https://arxiv.org/abs/2511.11347",
    verification: "verified",
    notes: "Reviews healthcare RAG privacy risks across storage, transmission, retrieval, and generation. Preprint; use as supporting rather than authoritative evidence.",
  },
  {
    id: "C044",
    title: "Uptake of Generative AI Integrated With Electronic Health Records in US Hospitals",
    publisher: "JAMA Network Open",
    year: 2025,
    source_type: "peer_reviewed_empirical_study",
    geography: "United States",
    url: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2842683",
    verification: "verified",
    notes: "Survey of 2,174 U.S. hospitals: 31.5% reported current generative AI use in 2024 and 24.7% planned adoption within one year; adoption and evaluation capabilities varied by institutional characteristics.",
  },
];

const links = {
  "POL-005": [
    ["C039", "direct", "HIPAA distinguishes individually identifiable health information from information formally de-identified through Safe Harbor or Expert Determination.", "Sections 1.1-1.4", "Supports determining whether HIPAA privacy requirements remain applicable based on the information's identifiability."],
    ["C040", "direct", "A cloud provider that creates, receives, maintains, or transmits ePHI for a covered entity or business associate is subject to HIPAA business-associate requirements.", "Introduction and Question 1", "Supports mapping HIPAA obligations when institutional health information is handled by a cloud provider."],
  ],
  "POL-009": [
    ["C040", "direct", "A HIPAA-compliant business associate agreement must govern permitted uses, safeguards, incident reporting, and return or destruction of ePHI handled by a cloud provider.", "Questions 1, 6, 8, and 10", "Supports including health-data-specific contractual protections and responsibilities in AI service agreements."],
  ],
  "DAT-001": [
    ["C039", "direct", "HIPAA provides two formal methods—Safe Harbor and Expert Determination—for classifying health information as de-identified rather than PHI.", "Sections 1.1-1.4", "Supports distinguishing PHI, de-identified health information, and residual re-identification risk in data classification."],
    ["C041", "corroborating", "PHI-LLM studies show material gaps in identifying and reporting effective PHI protection and de-identification measures.", "Results and glossary", "Supports explicitly identifying health-data sensitivity and the privacy controls associated with that classification."],
    ["C042", "corroborating", "Privacy strategies for EHR data vary according to whether data is structured or unstructured, its sensitivity, the LLM task, and the computational environment.", "Privacy-preserving strategies", "Supports a data classification that connects health-data characteristics to handling controls."],
  ],
  "DAT-002": [
    ["C039", "direct", "HIPAA protects individually identifiable health information held or transmitted by covered entities and business associates, and formal de-identification requires Safe Harbor or Expert Determination.", "Sections 1.1-1.4", "Supports distinguishing PHI from properly de-identified health information rather than treating all health-related data equivalently."],
    ["C040", "direct", "Cloud providers that create, receive, maintain, or transmit ePHI on behalf of a covered entity or business associate are subject to HIPAA business-associate requirements.", "HIPAA and Cloud Computing guidance", "Supports requiring approved contractual and technical environments before ePHI is sent to external AI/cloud services."],
    ["C041", "corroborating", "Published PHI-LLM research frequently fails to report effective privacy protections or adequate de-identification procedures.", "Results", "Supports explicit verification of privacy controls rather than assuming PHI handling has been adequately addressed."],
    ["C042", "corroborating", "Appropriate privacy protections for EHR use with LLMs depend on the data type, LLM task, computational infrastructure, and regulatory context.", "Privacy-preserving strategies and conclusion", "Supports context-sensitive architecture decisions rather than a blanket allow/prohibit rule."],
  ],
  "DAT-005": [
    ["C040", "direct", "HIPAA permits ePHI storage outside the United States with a BAA and other safeguards, while requiring geographic risks to be addressed through risk analysis and management.", "Question 9", "Supports explicit decisions about permitted processing locations and the risks attached to those locations."],
    ["C042", "direct", "Privacy risk varies between local, offline, proprietary third-party, and cloud LLM deployment contexts and should be addressed with context-appropriate controls.", "Privacy-preserving strategies and conclusion", "Supports choosing where sensitive health data may be stored and processed based on task and infrastructure context."],
    ["C043", "corroborating", "Healthcare RAG systems expose privacy risks at the data-storage stage as part of a broader storage-to-generation lifecycle.", "Abstract", "Preprint evidence supporting explicit review of storage risks; not treated as authoritative compliance guidance."],
  ],
  "DAT-006": [
    ["C040", "direct", "OCR does not certify particular cloud products; covered entities must understand the service environment, conduct risk analysis, and obtain appropriate contractual assurances.", "Questions 1, 4, and 10", "Supports institution-specific approval criteria for platforms that will maintain ePHI."],
  ],
  "DAT-007": [
    ["C040", "direct", "A BAA generally must require return or destruction of PHI when the service ends where feasible, while other law may require longer retention.", "Question 8", "Supports defining retention and disposition rules for ePHI held by cloud providers."],
  ],
  "DAT-008": [
    ["C040", "direct", "A provider transmitting ePHI in addition to storing or processing it remains a business associate and must apply appropriate safeguards and contractual protections.", "Questions 3 and 7", "Supports approved transfer mechanisms and safeguards when ePHI moves through external services."],
    ["C043", "corroborating", "Healthcare RAG privacy risks occur during transmission as well as storage, retrieval, and generation.", "Abstract", "Preprint evidence supporting explicit transfer-stage privacy review; not treated as authoritative compliance guidance."],
  ],
  "SEC-001": [
    ["C043", "corroborating", "Retrieval-stage access to sensitive healthcare data is a distinct privacy risk within the RAG lifecycle.", "Abstract", "Preprint evidence supporting access-control decisions for retrieval systems; not treated as authoritative compliance guidance."],
  ],
  "SEC-007": [
    ["C041", "corroborating", "PHI-LLM privacy guidance recommends local deployment or strictly regulated environments together with explicit privacy safeguards.", "Considerations in Research Implementation", "Supports considering an isolated or controlled environment when projects use PHI with LLMs."],
    ["C042", "corroborating", "Local or offline LLM deployment can reduce third-party privacy exposure, with the appropriate environment depending on data type and task.", "Privacy-preserving strategies", "Supports context-sensitive selection of controlled environments for sensitive health data."],
  ],
  "TEC-001": [
    ["C043", "contextual", "RAG workloads have distinct privacy exposure across storage, transmission, retrieval, and generation stages.", "Abstract", "Preprint context supporting recognition of RAG as a workload pattern with lifecycle-specific controls; not a new ontology decision."],
  ],
  "TEC-003": [
    ["C040", "contextual", "Cloud deployment involving ePHI requires a BAA, risk analysis, and appropriate administrative, physical, and technical safeguards.", "Introduction and Questions 1 and 9", "Provides authoritative compliance context for comparing cloud with institution-controlled deployment."],
    ["C042", "direct", "Privacy-preserving architecture should account for whether an LLM is local, offline, proprietary third-party, or cloud-based, along with data type and task.", "Privacy-preserving strategies and conclusion", "Directly supports evaluating deployment environment as part of the privacy architecture decision."],
  ],
  "PRO-002": [
    ["C040", "corroborating", "Before using a cloud provider for ePHI, an institution must understand the service environment, conduct risk analysis, obtain a BAA, and assess safeguards or additional assurances.", "Questions 1 and 10", "Supports health-data-specific due diligence for AI vendors and embedded services."],
  ],
  "STR-002": [
    ["C044", "corroborating", "Among 2,174 responding U.S. hospitals, 31.5% reported current generative AI use in 2024 and 24.7% planned adoption within one year.", "Key Points and Results", "Supports inventorying current and planned institutional generative AI use rather than assuming adoption is absent or uniform."],
  ],
  "EVA-002": [
    ["C044", "contextual", "Hospitals reported differing local evaluation practices for predictive AI, including accuracy, bias, and postdeployment evaluation, alongside differing generative AI adoption patterns.", "Methods and Results", "Provides empirical context for including explicit local evaluation practices before scaling; it does not prescribe a complete pilot standard."],
  ],
};

const corroboration = {
  "POL-005": "multiple_independent_sources",
  "POL-009": "multiple_independent_sources",
  "DAT-001": "multiple_independent_sources",
  "DAT-002": "multiple_independent_sources",
  "DAT-005": "multiple_independent_sources",
  "DAT-006": "partial",
  "DAT-007": "partial",
  "DAT-008": "multiple_independent_sources",
  "SEC-001": "partial",
  "SEC-007": "multiple_independent_sources",
  "TEC-001": "partial",
  "TEC-003": "multiple_independent_sources",
  "PRO-002": "multiple_independent_sources",
  "STR-002": "multiple_independent_sources",
  "EVA-002": "multiple_independent_sources",
};

ontology.version = "0.3.3";
ontology.description = "Institutional AI decision ontology v0.3.3: health-data, privacy, and compliance evidence enrichment with source registry, evidence profiles, assertion-level evidence links, and relationship provenance.";
ontology.sources = [...ontology.sources.filter((source) => !sources.some((candidate) => candidate.id === source.id)), ...sources];

for (const [decisionId, candidates] of Object.entries(links)) {
  const decision = ontology.decisions.find((item) => item.id === decisionId);
  if (!decision) throw new Error(`Unknown decision ${decisionId}`);
  const existingValidation = decision.evidence_profile.validation_status;
  for (const [sourceId, supportType, claimSupported, sourceLocation, notes] of candidates) {
    const link = {
      source_id: sourceId,
      support_type: supportType,
      specificity: "specific",
      claim_supported: claimSupported,
      source_location: sourceLocation,
      notes,
    };
    const index = decision.evidence_links.findIndex((candidate) => candidate.source_id === sourceId);
    if (index === -1) decision.evidence_links.push(link);
    else decision.evidence_links[index] = link;
  }
  decision.source_ids = decision.evidence_links.map((link) => link.source_id).join(";");
  decision.evidence_profile.evidence_breadth = decision.evidence_links.length;
  decision.evidence_profile.corroboration = corroboration[decisionId];
  if (decision.evidence_profile.validation_status !== existingValidation || existingValidation !== "not_validated") {
    throw new Error(`Unexpected validation-status change for ${decisionId}`);
  }
}

ontology.provenance_audit = {
  version: "0.3.3",
  date: "2026-08-20",
  scope: "All 99 decisions and 202 relationships",
  status: "provisional",
  summary: {
    decisions: 99,
    relationships: 202,
    registered_sources: 33,
    used_sources: 33,
    evidence_links: 270,
    evidence_links_with_source_location: 26,
    evidence_links_missing_source_location: 244,
    dominant_source_usage: { C035: 51, C036: 75 },
    source_support: { direct: 79, synthesized: 17, contextual: 3 },
    corroboration: { multiple_independent_sources: 34, partial: 37, none: 28 },
    validation_status: { not_validated: 99 },
    relationships_researcher_inferred: 202,
  },
  limitations: [
    "This is evidence enrichment, not practitioner validation.",
    "Twenty-seven decisions remain supported only by C035 and/or C036.",
    "All relationship edges remain researcher-inferred and not practitioner validated.",
    "A later audit should attach passage-level support statements to the 244 evidence links that still lack source locations and assess contradictory or qualifying evidence.",
  ],
};

writeFileSync(ontologyPath, `${JSON.stringify(ontology, null, 2)}\n`);
