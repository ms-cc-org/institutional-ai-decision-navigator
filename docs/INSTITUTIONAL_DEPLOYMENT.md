# Institutional Deployment Guide

The Institutional AI Decision Navigator is designed so a college or university can maintain a branded internal deployment without rewriting the MS-CC core decision model.

## Reuse model

Keep these layers distinct:

| Layer | Purpose | Primary files |
|---|---|---|
| MS-CC core | Decisions, sources, evidence links, relationships, deterministic engines, shared methodology | `data/ontology.json`, `lib/ontology.ts`, `lib/engine.ts`, `lib/intent-engine.ts` |
| Application applicability | Conservative routing metadata describing when a core decision may matter | `lib/applicability-contexts.ts` |
| Institution configuration | Local identity, logos, contact information, homepage, deployment mode, and attribution choice | `config/institution.ts` |
| Institution-local guidance | Local policies, procedures, annotations, owners, actions, and contacts mapped to existing decision IDs | `data/local/institution-guidance.json` |

Local guidance is additive. It is displayed separately and is never counted as MS-CC evidence. Do not edit core decision wording to express a local policy.

## 1. Fork and clone

On GitHub, fork `ms-cc-org/institutional-ai-decision-navigator` into your institution's organization. Then clone your fork:

```bash
git clone https://github.com/YOUR-ORGANIZATION/institutional-ai-decision-navigator.git
cd institutional-ai-decision-navigator
git remote add upstream https://github.com/ms-cc-org/institutional-ai-decision-navigator.git
git remote -v
```

The expected remotes are:

```text
origin    https://github.com/YOUR-ORGANIZATION/institutional-ai-decision-navigator.git
upstream  https://github.com/ms-cc-org/institutional-ai-decision-navigator.git
```

## 2. Install and run locally

Install a current Node.js LTS release, then:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## 3. Configure institutional identity

Review the fictional template in `config/institution.example.ts`, then edit the active `config/institution.ts`.

Set:

- `institutionName`, `shortName`, and the product-name lines;
- local logo paths and their display dimensions;
- `homepageUrl` for metadata and exports;
- `contactLabel` and `contactUrl`;
- a concise `aboutText`;
- `deploymentMode: "institution_fork"`;
- `showMsccAttribution` deliberately.

Copy local logo files into `public/brand/` and match the configured paths. Do not put secrets, API keys, private contacts, or credentials in this public configuration.

`showMsccAttribution: true` renders the MS-CC/Internet2/NSF funding statement used by the reference implementation. Set it to `false` when displaying that funding statement would be inaccurate for the local deployment. This setting does not remove the MS-CC core provenance labels or the MIT license obligations.

## 4. Add institution-local guidance

The active registry is `data/local/institution-guidance.json`. A new fork can leave `items` empty.

Use `data/local/example-institution-guidance.json` as a fictional example. Each item must:

- have a unique local ID;
- use `origin: "institution_local"`;
- reference one or more existing core decision IDs;
- identify its local publisher and guidance type;
- provide a URL or `null`;
- optionally provide local notes, action, owner, contact, or policy references.

Example:

```json
{
  "id": "LOCAL-001",
  "origin": "institution_local",
  "decision_ids": ["DAT-002"],
  "title": "University Data Classification Policy",
  "publisher": "Example Institution",
  "url": "https://example.edu/policies/data",
  "guidance_type": "local_policy",
  "notes": "Apply the restricted-data standard before approving external AI use.",
  "localOwner": "Information Security"
}
```

The build fails when a local item references an unknown core decision. On a matching detail page, local material appears under **Your institution's guidance**, after the separately labeled **MS-CC core evidence** section.

Do not add local policies to the core source registry. Do not silently replace a core decision through configuration. True decision override/versioning is intentionally unsupported.

## 5. Test and build

Run the complete checks before publishing:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

The static site is written to `out/`.

## 6. Deploy with GitHub Pages

The included `.github/workflows/deploy-pages.yml` runs the checks, configures the correct repository base path, builds the static export, and publishes it after a push to `main`.

In the fork:

1. Open **Settings → Pages**.
2. Set the source to **GitHub Actions**.
3. Push the configured deployment to `main`.
4. Open **Actions** and verify the Pages workflow succeeds.
5. Update `homepageUrl` in `config/institution.ts` to the final Pages URL.

The default project-site pattern is:

```text
https://YOUR-ORGANIZATION.github.io/institutional-ai-decision-navigator/
```

### Custom domain

Configure the domain under **Settings → Pages → Custom domain**, add the DNS records GitHub specifies, enable HTTPS after verification, and update `homepageUrl`. The workflow's Pages configuration supplies the build base path; verify links and assets after the domain becomes active.

## 7. Keep local work separate from MS-CC core

Prefer small local commits limited to:

- `config/institution.ts`;
- `public/brand/` local assets;
- `data/local/institution-guidance.json`;
- institution-owned deployment documentation, if needed.

Avoid editing `data/ontology.json`, core evidence, or decision engines for local policy differences. This reduces merge conflicts and preserves provenance.

## 8. Pull future MS-CC updates

Start from a clean working tree and review updates on a branch:

```bash
git switch main
git pull --ff-only origin main
git fetch upstream
git switch -c maintenance/mscc-core-update
git merge upstream/main
```

Resolve conflicts without discarding `config/institution.ts`, local brand assets, or `data/local/institution-guidance.json`. Then run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
git status
```

Review changes to the ontology version, methodology, application schema, and decision IDs before merging the maintenance branch into your local `main` and pushing to `origin`.

There is no automatic core-update or merge engine. Institutions remain responsible for reviewing upstream changes and local policy mappings.

## Version and provenance checks

The footer reports:

- MS-CC core ontology version;
- application package version;
- institution-config version.

Local guidance records carry `origin: institution_local`. Core evidence remains identified as MS-CC core. Together these answer which core release a deployment is based on without pretending local policy is part of the shared evidence base.

## License note

The repository currently uses the MIT License. Its text permits use, copying, modification, distribution, sublicensing, and sale provided the copyright and permission notice are retained. This appears compatible with institutional forks and internal deployments, but it is not legal advice. Ask institutional counsel to review attribution or ownership questions when needed; do not edit the repository license without authorization.
