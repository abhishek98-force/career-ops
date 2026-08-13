# Portfolio And Writing Digest

This file records source-grounded proof points that career-ops may use in applications and interview preparation. Do not extend these claims beyond what the linked source or `cv.md` supports.

## Sedai Labs - Spot Intelligence

- **Role:** Software Engineering Intern
- **Dates:** July 2026 - Present
- **Domain:** Multi-cloud Spot pricing, cloud infrastructure intelligence, data ingestion, persistence, testing, and platform delivery
- **Contribution record:** 73 directly authored non-merge commits and 23 merge commits attributed to the listed Git identities on the audited `main` branch through merged PR #156. Merge authorship records integration activity and does not establish sole authorship of every merged change.
- **Git identities:** Abhishek `<gopalakrishnanunni.a@northeastern.edu>`, Abhishek Unnithan `<abhishek.unnithan@sedailabs.io>`, and Abhishek Unnithan `<gopalakrishnanunni.a@northeastern.edu>`. These addresses are for contribution attribution only and must not replace the candidate's contact email.

### Azure Pricing Ingestion

- Developed Python ingestion against the public Azure Retail Prices REST API and normalized regional records into the platform's shared pricing model.
- Isolated Linux and Windows meters, paired Spot and on-demand prices when both existed, and preserved valid Spot-only observations.
- Selected deterministic pricing records using effective dates and propagated Azure `effectiveStartDate` into canonical observations.
- Rejected zero and invalid values and handled legacy Low Priority meters, malformed records, and Spot-above-on-demand cases.
- Added page-level retries for Azure Retail Prices API throttling and transient server failures, honoring bounded `Retry-After` values while preserving already completed pages and regions.
- Prevented Kubernetes from restarting the entire pricing scrape after page-level retries were exhausted and added tests for throttling recovery, exponential backoff, retry exhaustion, exact-page resumption, and non-retryable client errors.
- Added recorded fixtures and parser tests for OS isolation, Low Priority filtering, malformed data, missing on-demand prices, zero-price rejection, and effective-date ordering.
- Traceability: commits `572771c`, `6a366b0`, `99a3cb3`, `5835223`, `a448181`, and `4126dcb`; merged PR #151 / merge commit `b15d2bc`; `scrapers/azure/src/spotintel_azure/pricing.py`; `scrapers/azure/src/spotintel_azure/retail_prices.py`; and their pricing tests.
- The endpoint was public; do not infer ownership of production authentication.

### Azure Catalog And Pricing Persistence

- Extended shared SQLModel writers so valid Azure prices were retained when subscription-scoped hardware catalog metadata was unavailable.
- Added pricing-only catalog placeholders carrying enrichment metadata, with later reconciliation when complete Azure Resource SKU data became available.
- Made `vcpu` and `ram_gb` nullable and added an Alembic migration with upgrade and downgrade operations.
- Persisted normalized observations through shared PostgreSQL catalog and live-state tables and TimescaleDB pricing history.
- Added tests for placeholder creation, whitespace normalization, later enrichment, and unchanged AWS/GCP writer behavior.
- Traceability: commits `b9a94ea`, `7548376`, `52e13aa`, `4b05d8b`, and merge commit `82ba169` for PR #94; common writer, model, test, and migration files.
- Repository code and migrations are verified; production migration execution and row volume are not.

### Azure Interruption Persistence

- Integrated normalized Azure eviction observations with canonical current live-state and historical interruption storage.
- Implemented case-insensitive Azure SKU matching while preserving canonical catalog names.
- Updated all matching operating-system-specific live-state rows for a SKU and region while appending one historical record per provider observation.
- Prevented interruption observations from creating phantom catalog or live-state records.
- Added tests for case-insensitive matching, multi-OS updates, no-creation behavior, and historical-record handling.
- Traceability: commits `a4d21e7`, `b1f3588`, `10f279d`, and `526841a`; shared writer tests; and `scrapers/azure/EVICTIONS.md`.
- Ownership is limited to persistence integration, testing, and documentation. Another contributor authored the Azure Resource Graph fetch implementation.

### Azure Placement And Pricing Integration

- Integrated Azure placement observations with shared persistence so one provider signal updates every existing Linux and Windows live-state row for the matching SKU and region.
- Appended placement history while preserving operating-system-specific live state and clearing stale placement bands when Azure returned no current category.
- Prevented placement observations from creating catalog or live-state records when no priced Azure state existed.
- Added writer and parser coverage for multi-OS updates, catalog-only no-creation behavior, Windows-only state preservation, and real-response parsing.
- Refined Azure SKU eligibility and excluded Dedicated Host rows from Retail Prices ingestion.
- Added production safeguards that constrain placement requests to configured SKUs, stop safely after throttling or other Azure HTTP failures, preserve missing results as unscored, and prevent Kubernetes retries from amplifying API load.
- Traceability: candidate-authored integration commits `1222fee`, `eb20ec4`, `b10151a`, and `8c4a987`, merged through PR #93 / merge commit `1920f7d`; production safeguard commit `ee2ed99`, merged through PR #145 / merge commit `142392f`; shared writers, writer tests, Azure placement parser tests, and `retail_prices.py`.
- PR #93 included an original placement implementation from another contributor; ownership here is limited to the candidate-authored integration, persistence, filtering, cleanup, and test changes.

### Automated Testing And CI

- Created GitHub Actions validation for pull requests to `main` using Python 3.12 and a locked `uv` workspace installation.
- Added concurrency cancellation, Python tests, Ruff, and TypeScript validation with Node.js 22 and `npm ci`.
- Pinned CI's `uv` setup to version 0.10.9.
- Replaced floating Python and `uv` container sources with Python 3.12.13 and `uv` 0.10.9 images pinned by SHA-256 digest across the API and three cloud-scraper Dockerfiles.
- Added a dependent container gate that builds the API, UI, AWS scraper, Azure scraper, and GCP scraper images and deploys them to an ephemeral kind cluster.
- Waited for TimescaleDB, Alembic migration completion, API and UI readiness, and four seeded scraper Jobs before accepting the container gate.
- Added workload, Pod, Job, and event diagnostics on failure and unconditional kind-cluster cleanup.
- Traceability: merged PR #132, merge commit `8a354fe`; `.github/workflows/ci.yml`; service Dockerfiles; `scripts/dev-up.sh`; `scripts/build-images.sh`; and the Kustomize resources under `deployment/`.
- The container gate proves image construction, workload boot, readiness, migration completion, and seeded scraper exit-zero execution in dummy mode. It does not establish data correctness, real-cloud scraper completion, or production reliability.

### Azure Dummy Pricing And Signal Fidelity

- Built an Azure-specific dummy scenario covering five VM SKUs across East US, West US 2, West Europe, and Japan East.
- Generated separate Linux and Windows Spot and on-demand observations for each supported SKU-region pair, with region-specific effective dates and reproducible identity-specific Spot-price drift.
- Modeled Azure eviction-rate bands as normalized interruption percentages and Low/Medium/High risk categories.
- Replaced generic numeric placement data with Azure-style categorical placement results, including explicit unavailable cases.
- Switched Azure pricing, eviction, and placement dummy paths to the provider-specific model while retaining shared fleet specifications.
- Traceability: merged PR #138, authored commit `61988da`, merge commit `84e5f24`; `scrapers/azure/src/spotintel_azure/dummy_data.py`; and the Azure pricing, eviction, and placement scrapers.
- Existing lint, Python-test, Terraform-validation, image-build, and kind jobs passed for the PR, but no dedicated assertions verify every scenario value, drift calculation, or band mapping.

### Artifact Registry And Keyless Image Delivery

- Added Terraform for a Google Artifact Registry Docker repository and a repository-scoped publishing service account.
- Configured GitHub Actions authentication through OIDC and Workload Identity Federation instead of persistent service-account keys, restricted by immutable repository and owner identifiers and the `main` branch.
- Added Terraform formatting, locked-provider initialization, and static validation to pull-request CI.
- Implemented a release workflow that builds and publishes the API, UI, and three cloud-scraper images with full commit-SHA tags and separate Artifact Registry-backed build caches.
- Kept image-publishing and GKE-deployment identities separate so publishing credentials do not also grant deployment access.
- Traceability: merged PRs #135 and #136; merge commits `e152832` and `c870864`; `terraform/infrastructure/`; and `.github/workflows/release.yml`.

### GKE Infrastructure And Deployment Path

- Added Terraform-managed infrastructure for a regional GKE Autopilot cluster with Workload Identity Federation, deletion protection, a dedicated node service account, and repository-scoped image-pull access.
- Added a protected GCS Terraform-state bucket with versioning, uniform bucket-level access, enforced public-access prevention, soft deletion, noncurrent-version cleanup, `force_destroy = false`, and Terraform deletion protection.
- Separated infrastructure and cluster-bootstrap state under independent remote-state prefixes.
- Created separate GitHub publisher and deployer identities plus a dedicated GKE node identity, with repository-scoped Artifact Registry writer/reader access and project-level `container.clusterViewer` for deployment discovery.
- Added namespace-scoped Kubernetes deployment RBAC without direct Secret-reading or namespace-creation permissions.
- Installed the pinned External Secrets Operator through a separate Terraform bootstrap root and restricted its token-request permission to the dedicated `spotintel-secrets` service account.
- Integrated Google Secret Manager with a namespaced `SecretStore` and `ExternalSecret` for database credentials while keeping secret values outside Terraform state and Git.
- Added a production Kustomize overlay with unreleased placeholder images that cannot produce runnable workloads before CI substitution.
- Implemented a manually dispatched deployment job using the GitHub environment named `production`; it validates the full lowercase 40-hex image-tag format, authenticates through OIDC, substitutes commit-SHA-tagged images, synchronizes database credentials, recreates the migration Job, applies workloads, and waits for database, migration, API, and UI readiness.
- Successfully published all five images for merge commit `43d0ecd` and completed the post-merge GKE deployment workflow, including secret synchronization and readiness gates.
- Authored operational documentation for separate Terraform roots, remote-state initialization, plan/apply review, External Secrets verification, secret-version handling, manual deployment, failure recovery, and state safety.
- Traceability: merged PR #140, merge commit `43d0ecd`; `terraform/infrastructure/`; `terraform/bootstrap/`; `deployment/overlays/production/`; `.github/workflows/release.yml`; [publication run 30771529963](https://github.com/SedaiEngineering/sedailabs-spotintelligence/actions/runs/30771529963); and [deployment run 30771905568](https://github.com/SedaiEngineering/sedailabs-spotintelligence/actions/runs/30771905568).
- The verified deployment used dummy-mode scraper configuration. A successful deployment run does not establish sustained production operation, real-cloud data collection, customer use, or a human approval event.

### Secure Multi-Cloud Production Authentication

- Configured provider-specific Kubernetes service accounts and production credential delivery for AWS, Azure, and GCP scrapers.
- Implemented Azure workload identity federation with projected, short-lived Kubernetes tokens instead of a client secret.
- Configured GCP Workload Identity for scraper access and delivered the Billing Catalog API key through Google Secret Manager and External Secrets Operator.
- Delivered AWS credentials from Google Secret Manager through External Secrets, then removed the temporary GitHub credential-seeding path and its Secret Manager write permission after migration.
- Scoped Secret Manager access to individual secrets and limited credential injection to the workloads that require it.
- Traceability: merged PRs #146 and #147; merge commits `d602d2c` and `d696e0e`; `.github/workflows/release.yml`; `terraform/infrastructure/`; `terraform/bootstrap/`; and the production Kustomize overlay.

### Real-Data Rollout And Scraper Reliability

- Transitioned the production overlay from dummy data to controlled real-cloud collection while retaining dummy mode for local and base deployments.
- Validated one-off scraper execution across AWS, Azure, and GCP before enabling production schedules; the final configuration kept Azure placement suspended while the other 11 scraper schedules were enabled.
- Tuned AWS pricing runtime and cadence after an initial seed wrote 16,855 records and a subsequent run exceeded the original deadline.
- Deployed the validated real-mode schedule configuration through the GKE workflow with credential synchronization and database, migration, API, and UI readiness gates.
- Traceability: merged PRs #148, #150, #151, and #153; merge commits `d049bc4`, `67d57d2`, `b15d2bc`, and `b8638f5`; and [deployment run 31083888977](https://github.com/SedaiEngineering/sedailabs-spotintelligence/actions/runs/31083888977).
- One-off validation and deployment readiness do not establish sustained scheduled execution, long-term data quality, or production reliability.

### GKE Ingress And Managed TLS

- Replaced the production UI's direct external LoadBalancer service with a GCE Ingress using a Terraform-managed global static IP and container-native network endpoint groups.
- Added a Google-managed certificate for `spotintel.sedailabs.io` and a `BackendConfig` with explicit HTTP health-check behavior.
- Restricted the public Nginx API surface to `GET`, `HEAD`, and `OPTIONS`, rejecting mutation methods with HTTP 403.
- Extended namespace-scoped deployer RBAC for Ingress, BackendConfig, ManagedCertificate, and FrontendConfig resources.
- Published all five commit-SHA-tagged images and successfully completed the post-merge GKE deployment workflow for the ingress release.
- Traceability: merged PR #156, authored commits `b7dc551`, `6abfc67`, and `434e67a`, merge commit `d0b07c9`; [publication run 31434839846](https://github.com/SedaiEngineering/sedailabs-spotintelligence/actions/runs/31434839846); and [deployment run 31435547249](https://github.com/SedaiEngineering/sedailabs-spotintelligence/actions/runs/31435547249).
- The successful workflow verifies deployment and existing readiness gates; it does not independently prove DNS propagation, managed-certificate activation, public endpoint availability, uptime, or sustained operation.

### Collaboration And Shared-Code Safety

- Contributed across a shared monorepo containing scraper, common persistence, database, API, UI, and deployment packages.
- Delivered authored work through PRs #68, #72, #75, #81, #94, #96, #132, #135, #136, #138, #140, #146, #147, #148, #150, #151, #153, and #156, plus candidate-authored integration changes merged through PR #93.
- Resolved persistence integration issues, test failures, lint findings, and merge conflicts affecting shared components.
- Protected provider-neutral writer behavior with AWS and GCP regression coverage alongside Azure-specific tests.

### Tailoring Angles

- **Backend and data roles:** Azure API parsing, deterministic normalization, effective-date selection, incomplete-record preservation, placement and interruption persistence, SQLModel writers, PostgreSQL/TimescaleDB, and Alembic migrations.
- **Platform roles:** Shared canonical models, provider-neutral persistence behavior, placeholder enrichment, live-state/history semantics, and regression testing across AWS, Azure, and GCP.
- **Cloud and DevOps roles:** GitHub Actions, locked dependencies, five-image builds, Docker digest pinning, Terraform, protected remote state, regional GKE Autopilot, Artifact Registry, GCE Ingress, managed TLS, OIDC, Azure workload identity federation, GCP Workload Identity, provider-specific Kubernetes identities, scoped IAM/RBAC, External Secrets Operator, Secret Manager, Kustomize, commit-SHA image delivery, stateful TimescaleDB deployment, and deployment readiness gates.
- **Reliability roles:** Invalid-data rejection, fixture-backed edge-case coverage, page-level retry and throttling recovery, exact-page resumption, API-load safeguards, no-phantom-record safeguards, one-history-record semantics, dummy-signal fidelity, controlled real-data rollout, diagnostics, migration and rollout checks, failure cleanup, protected state, and unreleased-image guards.
- **Collaboration roles:** Shared-monorepo integration, merged pull requests, conflict resolution, lint/test remediation, and cross-provider regression protection.

### Truth Boundaries And Missing Evidence

- Do not claim ownership of the entire Azure catalog scraper, Azure Resource Graph fetcher, platform, API/UI, or MCP implementation.
- Do not claim AI or agentic systems, direct React UI work, FastAPI route ownership, FastMCP tools, NoSQL systems, or cybersecurity architecture for this role.
- Do not claim sustained or customer-facing production operation, production scale, customer use, uptime, throughput, latency, database volume, cloud-cost savings, or quantified user impact.
- Docker pinning, five-image builds, kind boot validation, Terraform, Artifact Registry publishing, regional GKE Autopilot infrastructure, multi-cloud workload authentication, External Secrets integration, GCE Ingress, managed TLS configuration, and the deployment workflow are merged repository work.
- Successful post-merge GKE workflows support completed deployments with migration, secret, database, API, and UI readiness gates; they do not prove sustained production operation or human approval.
- Do not claim that PR #139's cross-cloud QA harness was authored by the candidate. Its implementation commits are attributed to other contributors.
- Do not describe GKE as customer-facing or operated with production reliability practices until environment use and operating history are verified.
- One-off real-cloud scraper validation and deployment of 11 enabled schedules are supported; sustained scheduled completion and long-term data quality remain unverified. API/UI multi-cloud data display, persistence across Pod recreation, monitoring, alerting, backup, disaster recovery, active managed-certificate status, public endpoint availability, and network policies also remain unverified.

## Salesforce CRM Engineering - Wipro

- **Role:** Salesforce Developer
- **Dates:** July 2021 - August 2023
- **Farmers Insurance:** July 2021 - February 2023
- **FedEx:** February 2023 - August 2023
- **Domain:** Salesforce platform engineering, CRM data quality, Lightning user interfaces, workflow automation, shipment and policy operations, access and sharing logic, and enterprise delivery.

### Salesforce Certifications

- Salesforce Certified Platform Developer I.
- Salesforce Certified Administrator.
- Salesforce Certified JavaScript Developer I.

### Farmers Insurance

- Built a scheduled chained Queueable process that selected soft-deleted Accounts through a flag field, copied most Account fields into Salesforce Big Objects, and deleted the source Accounts after archival.
- Observed a 43% Salesforce-storage reduction for the archival work through the organization's Salesforce storage settings.
- Co-developed a Batchable duplicate-account process across custom matching, master-record selection, sharing logic, batch orchestration, testing, and debugging. Matching used Account Contact Relationship data and a master-status field.
- The canonical CV separately records a 21% redundancy reduction across more than 1M customer account records. Keep that outcome separate from the 30K+ user workflow scope because the calculation method is not currently documented.
- Built agent-dashboard alert-management features with homepage counters, contextual policy-level alerts, backend controllers, configuration logic, and dynamic UI components.
- Built a home-screen Lightning Web Component and Apex controller that used a Named Credential to retrieve and display external news relevant to Farmers Insurance.

### FedEx

- Built a Lightning Web Components document-delivery feature with an Apex controller that enabled agents to securely email shipment documents to clients.
- Built more than 10 Lightning Web Components for shipment progress, package detail, delivery timelines, and disruption indicators, reducing issue-resolution time by 38%.
- The shipment UI consumed data from an existing Apex wrapper that called the FedEx API and normalized its responses into UI-specific objects; do not claim ownership of that wrapper or the API integration layer.
- Integrated the Salesforce Workspace API into Global Navigation for navigation across Lightning tabs.
- Trained developers on Chrome DevTools and Apex Debugger. A 20% productivity figure was a sprint-retrospective estimate and is not approved as a resume metric.

### Salesforce Technical Evidence

- Platform development: Apex controllers for Lightning Web Components, async jobs, trigger-handler bug fixes, Lightning Web Components, SOQL/SOSL, Apex Test Framework, Flows, Process Builder, Custom Objects, Validation Rules, Page Layouts, Record Types, Profiles and Permission Sets, Reports and Dashboards, Salesforce DX, and Workbench.
- Testing: wrote and validated Apex tests for controller changes; validated trigger behavior through record operations that fired existing triggers. Do not claim ownership of trigger or asynchronous-job test suites unless further evidence is supplied.
- Delivery: integrated SonarQube analysis into an existing GitHub Actions pull-request pipeline. Apex tests ran in the pipeline, while the scratch-org deployment workflow already existed and was not candidate-authored.
- Integration and systems context: REST/SOAP APIs, asynchronous processing, RabbitMQ, PostgreSQL, Python, TypeScript, JavaScript, SQL, cloud delivery, and access and permissions management.

### Tailoring Angles

- **Salesforce / CRM roles:** Lead with Apex/LWC, CRM data integrity, Big Objects, Queueable/Batchable processing, Salesforce sharing logic, Workspace API, agent workflows, dashboard alerts, and enterprise delivery.
- **Salesforce platform / integration roles:** Lead with REST/SOAP APIs, data migration and deduplication, access management, reporting, external-system integration, and JavaScript/Python backend context.
- **Customer-service / operations roles:** Lead with FedEx shipment workflows, secure document delivery, agent navigation, issue-resolution impact, and Farmers policy-level alert workflows.

### Truth Boundaries And Missing Evidence

- Do not claim Salesforce certification dates, certification IDs, Salesforce platform scale, workflow execution volume, Apex-test coverage, or production availability unless additional evidence is supplied.
- Do not claim ownership of the entire Farmers Insurance or FedEx Salesforce implementation.
- Do not combine the 43% storage reduction, 21% redundancy reduction, 1M+ account-record scope, and 30K+ user scope into a single metric or causal claim.
- Do not claim ownership of the FedEx Apex wrapper/API integration layer, the existing scratch-org deployment workflow, the GitHub Actions Apex-test job, or trigger/async test suites.

## Augesys - Microsoft Entra Compliance-as-a-Service Platform

- **Role:** Software Development Engineer
- **Dates:** March 2026 - Present
- **Domain:** Microsoft cloud security validation, policy-as-code, and compliance evidence automation
- **Product scope:** Full-stack platform that collects Microsoft tenant configuration, normalizes it into structured JSON artifacts, evaluates implemented checks against configured security baselines, and presents evidence-backed pass/fail explanations.
- **Architecture goal:** Microsoft Entra ID is the reference implementation for a product model intended to support additional Microsoft 365 validation pipelines. Broader product support remains future architecture unless explicitly identified below as implemented.

### Backend And API Orchestration

- Built and expanded a Python/FastAPI backend that coordinates authentication, tenant validation, collection, evaluation, persistence, and result retrieval.
- Implemented routes for sign-in and callbacks, tenant validation, collection and evaluation execution, collection status, latest-result retrieval, health checks, and product-specific workflows.
- Product-oriented routes include `/products/{product}/collect`, `/products/{product}/evaluate`, `/products/{product}/collect/status`, and `/products/{product}/evaluate/latest`.
- Persisted timestamped evaluation results so clients can retrieve the latest state without rerunning an evaluation. The persistence technology and retention policy are not yet documented.
- Added structured handling for missing or expired tokens, Microsoft Graph failures, OPA failures, invalid responses, and missing persisted results.

### Authentication And Tenant Isolation

- Implemented a server-side OAuth 2.0 Authorization Code flow with OpenID Connect using MSAL `ConfidentialClientApplication`.
- Handled sign-in redirects, authorization-code exchange, and silent token acquisition through MSAL's token cache; do not claim direct refresh-token handling.
- Captured the signed-in tenant ID and validated the ID token's `tid` claim against an approved-tenant allowlist, rejecting unknown tenants during callback handling.
- Built a Bearer-token-aware Microsoft Graph client with pre-request checks for missing or expired cached tokens.

### Microsoft Graph Collection

- Built reusable authenticated Graph request handling with request method, path, response status, and duration logging.
- Implemented direct Graph requests, fan-out requests driven by identifiers in initial responses, local JSON reads, transformations, and final JSON persistence.
- Collected and normalized conditional access policies, authentication methods policy, authorization policy, app management policies, directory settings, domains, the default app management policy, risky delegated permission classifications, privileged roles and users, and subscribed service plans.
- Added specialized transformations to produce the data structures expected by downstream Rego policies.

### Manifest-Driven DAG Workflow

- Replaced hard-coded product collection with a declarative YAML manifest for Microsoft Entra workflows.
- Modeled the collection process as a directed acyclic graph of source, transform, and final-object steps.
- Built compilation and execution services that load manifests, resolve handlers, execute dependencies, track progress, and persist normalized artifacts.
- Established a repeatable flow: collect raw state, transform it, persist normalized output, assemble Rego input, and evaluate policy.
- Made the workflow pattern reusable for future Microsoft 365 product pipelines; this is extensibility architecture, not evidence that those additional products are already implemented.

### OPA And Rego Evaluation

- Created a product-specific input-assembly layer that combines normalized Entra resources into the single document expected by Rego.
- Integrated Open Policy Agent as a sidecar and built an evaluation service that submits assembled tenant state to product-specific query paths, beginning with `aad`.
- Persisted the exact OPA input used for evaluation to support traceability and debugging.
- Handled unreachable OPA services, HTTP errors, invalid responses, and missing result fields.
- Expanded CISA SCuBA-derived Microsoft Entra checks, including privileged-access and application/permission-related checks.
- Produced structured results with policy identifiers, rule names, statuses, summaries, candidate and matched policies, expected and actual values, and failure reasons.

### Permissions And Tenant Configuration

- Resolved the Microsoft Graph application roles needed for each product's collection workflow.
- Ensured the Tenant Configuration Management service principal exists, compared assigned roles against requirements, and granted only missing product-level permissions.
- Supported Graph-backed and Tenant Configuration Management-backed resources through a common product abstraction.
- Implemented snapshot tracking and cleanup behavior for Tenant Configuration Management paths. The broader snapshot workflow is only partially scaffolded and documented.

### Frontend And Compliance Mapping

- Built and improved a React/Vite interface for running Microsoft Entra collection and evaluation and exploring results.
- Added collection-progress polling, latest-result loading, and explicit success, loading, and error states.
- Built policy-detail views showing pass/fail explanations, matched and candidate policies, failure reasons, expected values, and actual values when available.
- Added NIST 800-171 control-oriented and technical-baseline-oriented views, including control grouping, baseline tables, status presentation, and links to detailed policy analysis.
- Implemented Microsoft Entra baseline-to-NIST 800-171 mappings. NIST 800-53, CMMC, broader CISA SCuBA mapping, and OSCAL reporting remain architecture or roadmap items unless further evidence is supplied.

### Operability And Runtime

- Added `structlog`-based events for authentication, workflow compilation and completion, Graph calls, OPA evaluations, external-call durations, and failures.
- Replaced print-style debugging with structured operational events across key backend flows.
- Maintained a local/containerized development runtime using Docker Compose for FastAPI and the OPA sidecar, with repository-loaded Rego policies and environment-based service configuration.
- Docker Compose is local runtime evidence and must not be framed as production Kubernetes ownership for this Augesys project.

### Documentation And Architecture Direction

- Added discoverable architecture documentation describing the current Microsoft 365 validation architecture and Entra's role as the reference implementation.
- Documented future source adapters for Microsoft Graph, Tenant Configuration Management snapshots, product REST APIs, and external collectors.
- Authored OSCAL/OPA planning material, a funding roadmap, and a path toward run isolation, evidence manifests, durable persistence, typed OPA decisions, validated OSCAL observations, and audit-grade assessment runs.
- These roadmap items demonstrate architecture planning, not completed implementation.

### Tailoring Angles

- **Backend/platform roles:** FastAPI orchestration, product APIs, handler abstraction, normalized artifacts, persistence boundaries, structured failure handling.
- **Cloud/security roles:** Microsoft Entra, Microsoft Graph, OAuth/OIDC, tenant allowlisting, permission reconciliation, policy-as-code, evidence traceability.
- **Workflow/data roles:** Manifest-driven DAG compilation and execution, fan-out requests, transformations, reusable intermediate artifacts, progress tracking.
- **Full-stack roles:** FastAPI plus React/Vite workflows, progress polling, persisted result retrieval, explainable policy-detail views.
- **DevOps/operability roles:** OPA sidecar integration, Docker Compose, environment-based configuration, structured logging, external-call timing, health endpoints.
- **Technical-writing/architecture roles:** Current-state and target-state architecture documentation, explicit implementation gaps, incremental roadmap planning.

### Truth Boundaries And Missing Evidence

- Do not claim certification, audit approval, or complete compliance with NIST, CISA SCuBA, CMMC, or any other framework.
- Do not claim customer adoption, production deployment, tenant or policy counts, throughput, latency, uptime, or time savings until measured evidence is supplied.
- Do not claim completed OSCAL exports, evidence manifests, audit-grade runs, durable persistence, or broader Microsoft 365 product support.
- Do not claim direct refresh-token handling; MSAL manages refresh behavior internally through its token cache.
- Do not claim healthcare privacy, HIPAA, threat intelligence, or ownership of a general-purpose identity platform.
- Test coverage, CI/CD, release ownership, monitoring destinations, alerting, tracing, retries, concurrency, and production support remain unspecified.

## Data Collection With a DAG

- **Author:** Abhishek Unnithan
- **Published:** June 20, 2026
- **URL:** https://medium.com/@abhishekunnithan/data-collection-with-a-dag-120d1171a9ee
- **Type:** Technical writing and architecture perspective
- **Topics:** Software architecture, dependency graphs, data collection, data normalization, design patterns, compliance evidence
- **Core idea:** Reframes multi-source data collection as a dependency-centric problem rather than assigning each final output to a source-specific provider class.
- **Architecture described:** Source nodes fetch raw API or configuration data, transform nodes derive reusable intermediate data, and final-object nodes produce downstream contracts.
- **Illustrative example:** An MFA compliance evidence flow combines users, role assignments, group memberships, MFA methods, and exception configuration through declared dependencies.
- **Benefits discussed:** Explicit execution order, reuse of intermediate data, traceability from results to inputs, and contracts located at the correct processing layer.
- **Tradeoff acknowledged:** A DAG adds naming, handler-contract, dependency-validation, and debugging overhead and may be excessive for simple one-source outputs.
- **Safe framing:** Evidence of technical communication and architectural reasoning. Do not describe the illustrative DAG as a deployed production system unless another approved source confirms that implementation.

## Boston Liquor License Tracker

- **Role:** Core contributor
- **Project type:** Open-source civic data project
- **Repository:** https://github.com/codeforboston/boston-liquor-license-tracker
- **Contribution history:** https://github.com/codeforboston/boston-liquor-license-tracker/pulls?q=is%3Apr+is%3Aclosed+author%3Aabhishek98-force
- **Contribution identity:** Abhishek / Abhishek Unnithan `<gopalakrishnanunni.a@northeastern.edu>`. This address is for commit attribution only and must not replace the candidate's contact email.
- **Confirmed contribution count:** 13 merged pull requests.
- **Confirmed result:** Reduced licensing-board list updates from 15 minutes to 5 seconds.

### Product And Contribution Scope

- Contributed to a civic-data project that makes Boston liquor-license activity more transparent through public applicant, address, ZIP code, license type, application date, status, and source-document data extracted from Licensing Board voting minutes.
- Focused authored work on applicant-data ingestion, PDF parsing, workflow automation, JSON dataset validation, historical cleanup, and minor frontend-adjacent changes.
- Designed and implemented a repeatable flow that identifies new voting minutes, downloads the source PDF, extracts applicant records, updates JSON data and checkpoint state, validates the dataset, and opens an automated pull request.
- Incorporated maintainer feedback on authored pull requests and reviewed changes from other contributors.

### Architecture And Persistence

- Used Python and TypeScript scripts rather than a traditional backend API server.
- Used JSON files as the persistence layer: `client/src/data/licenses.json` for applicant and license records and `client/src/data/last_processed_date.json` for incremental-processing state.
- Defined record validation in `client/src/data/schema/license-schema.json`.
- Used Axios to fetch Boston.gov pages and PDFs, Cheerio to parse HTML, and PyMuPDF/`fitz` to extract PDF text.
- Supported source documents hosted on Boston.gov and Google Drive.
- Centralized script paths and external URLs through environment-backed configuration in `scripts/paths.ts`.

### PDF Discovery And Extraction

- Built or contributed to `scripts/getVotingMinutes.ts` to scrape Boston Licensing Board pages, locate the next unprocessed voting-minutes PDF, compare meeting dates with checkpoint state, and download eligible documents.
- Added handling for Boston.gov file-server links and Google Drive-hosted PDFs and updated selectors after source-page and hosting changes.
- Emitted structured `::JSON_OUTPUT::` values for downstream GitHub Actions steps and supported a clean no-op when no new PDF existed.
- Built or contributed to `scripts/extract_entity.py`, which locates the Transactional Hearing section, stops around Non-Hearing Transactions, and splits text into applicant blocks using numbered headings.
- Extracted hearing and expiration dates, entity number, business and DBA names, address, ZIP code, license number, alcohol type, status, minutes date, and source file.
- Classified supported All Alcoholic Beverages and Wines and Malt Beverages license types, supplied default statuses and sequential indexes, and appended records to the JSON dataset.

### Incremental GitHub Actions Pipeline

- Implemented repository automation that detects new voting minutes, downloads PDFs, runs extraction, updates `licenses.json` and `last_processed_date.json`, and creates pull requests with `peter-evans/create-pull-request`.
- Split discovery and processing into separate jobs and passed PDFs between them with GitHub Actions artifacts.
- Supported scheduled, manual, and reusable `workflow_call` triggers and added a test workflow for safer pipeline invocation.
- Used repository-scoped GitHub Actions permissions for file updates and pull-request creation.
- Improved resilience for no-new-document runs and changing source-link formats.

### Validation And Historical Cleanup

- Added AJV and JSON Schema validation in `scripts/validateLicenseData.ts` for required fields, dates, ZIP codes, license numbers, enum values, and sequential indexes.
- Added the custom AJV keyword `sequentialIndexes`.
- Added `.github/workflows/validate-license-data.yml` to compile and run TypeScript validation when pull requests modify license data or schema files.
- Built historical seeding support in `scripts/archive/load_data.py` for local PDF batches.
- Sorted historical records by meeting date and entity number, removed duplicates, and reindexed records to maintain sequential ordering.

### Frontend-Adjacent Scope

- Updated JSON data and schema files consumed by the React/Vite frontend.
- Made minor presentation changes including a footer-logo update and application-copy updates.
- Do not frame this work as ownership of the broader React frontend, database page, map, routing, localization, or dashboard.

### Contribution Traceability

- PR #128, `Parse applicants`: applicant extraction scripts and initial structured applicant data.
- PR #153, `Applicant pipeline`: GitHub Actions workflow, `getVotingMinutes.ts`, `updateLastProcessedDate.ts`, and Node package setup.
- PR #170, `Applicant pipeline fix`: split discovery and processing jobs.
- PR #262, `Add CI validation for license data`: AJV validation, JSON Schema, and validation workflow.
- PR #273, `Removed duplicates generated during data load`: duplicate cleanup, archive reindexing, and sequential-index validation.
- PR #296, `Fix PDF Source Change + Add Test Workflow`: revised PDF handling and workflow test support.
- PR #323, `Fix url pdfs`: updated link selection and Boston file-server URL handling.

### Tailoring Angles

- **Backend and data roles:** Python extraction, TypeScript orchestration, parsing, normalization, checkpoint state, JSON contracts, and historical data cleanup.
- **DevOps and automation roles:** GitHub Actions job separation, artifacts, scheduled/manual/reusable triggers, automated pull requests, and repository-scoped permissions.
- **Reliability roles:** Clean no-op behavior, source-format adaptation, schema validation, duplicate removal, and sequential-index enforcement.
- **Open-source roles:** 13 merged pull requests, maintainer-feedback iteration, peer review, and documented workflow decisions.
- **Civic-tech roles:** Public-data transparency and structured extraction from municipal source documents.

### Truth Boundaries And Missing Evidence

- Do not claim ownership of the entire project or its broader frontend.
- Do not claim a backend API, database-backed persistence, AI/LLM implementation, authentication, RBAC, or security-compliance functionality.
- Describe persistence as JSON-file based and monitoring as GitHub Actions logs and validation, not formal application observability.
- Describe the workflow as repository automation; production status and live-user adoption are not verified.
- Do not claim document volume, record volume, extraction accuracy, uptime, workflow frequency, or user impact beyond the confirmed 15-minute-to-5-second improvement.
- Exact parser test coverage and whether validation caught malformed data in real pull requests remain unverified.

## VisionAnnotator

- **Project type:** Full-stack image annotation and object-detection system
- **Previous CV name:** Visual Objects
- **Confirmed result:** Converting YOLOv8-Large to ONNX reduced model size by 78%.
- **Product scope:** Users can upload images, generate object detections, edit detected annotations, draw free-form polygons, assign labels, add or remove annotations, and save completed annotations for review or model retraining.

### Frontend And Interactive Canvas

- Built the frontend with React, TypeScript, Vite, and Konva.
- Displayed uploaded images and rendered model-generated bounding boxes as editable canvas shapes.
- Supported moving and resizing detected boxes, drawing free-form polygons, editing labels, and adding or removing annotations.
- Serialized the Konva canvas with `Stage.toDataURL()`, removed the data URL prefix, and sent the resulting base64 image to the Flask backend.
- Traceability: `imgdet-frtend/src/App.tsx`, `components/Polygon.tsx`, `components/PolygonDrawLayer.tsx`, and `services/updateDB.ts`.

### Flask Backend And Annotation Contract

- Built the backend with Python, Flask, Gunicorn, and SQLAlchemy.
- Implemented `POST /api/images` to receive base64 images, invoke object detection, convert returned boxes, persist images and annotations, and return annotations to the frontend.
- Supported manually created annotations and annotation exports.
- Sent model requests as JSON containing the base64 image and a score threshold such as `0.5`.
- Added configuration and Gunicorn runtime support through `image-det-backend/app.py`, `models.py`, `config.py`, and `gunicorn_config.py`.

### Unified Bounding-Box And Polygon Representation

- Converted model output from rectangle coordinates `[x1, y1, x2, y2]` into four polygon points.
- Used the same polygon representation for automatic rectangular detections and free-form manual annotations.
- This unified representation allowed frontend editing and database persistence to operate against one annotation contract.

### YOLOv8-Large ONNX Inference

- Implemented the model service with YOLOv8-Large, ONNX, Python 3.11, Pillow, Docker, and AWS Lambda Runtime Interface tooling.
- Converted the YOLOv8-Large model to `yolov8l.onnx`, reducing model size by 78%.
- Loaded the detector globally rather than inside the request handler so warm Lambda containers could reuse the loaded model.
- Decoded base64 input, converted images with Pillow, ran inference using a 640-pixel input size, and returned bounding-box coordinates with object labels.
- Traceability: `yolo-service/app.py`, `Dockerfile`, `entry_script.sh`, and `requirements.txt`.
- Global loading supports warm-container reuse; it is not evidence of measured latency improvement.

### PostgreSQL Persistence

- Used PostgreSQL with SQLAlchemy object-relational mapping.
- Stored image identifiers, base64 image data, and creation timestamps.
- Stored polygon identifiers, image relationships, labels, JSON coordinates, and creation timestamps.
- JSON polygon coordinates allowed rectangular detections and free-form annotations to share one persistence model.

### Local Runtime

- Used Docker Compose to run the web application, PostgreSQL, and a `yolo-service` model container locally.
- Invoked the model through the AWS Lambda Runtime Interface Emulator at `http://yolo-service:8080/2015-03-31/functions/function/invocations`.
- Reused the Lambda handler and request format during local development rather than maintaining a separate local inference API contract.

### Hosted Deployment

- Packaged compiled React assets, Nginx, Flask, Gunicorn, and database migrations into a combined web-application image.
- Applied database migrations at startup, ran Gunicorn on port `8080`, served React static assets through Nginx, and proxied `/api` requests to Gunicorn.
- Hosted the web application on Heroku.
- Hosted model inference separately through an AWS Lambda-compatible container configured via `AWS_LAMBDA_URL`.

### CI/CD Scope

- Used GitHub Actions to automate deployment of the Heroku web application.
- Complete model deployment was not automated by the repository workflow.
- Amazon ECR image publication, Lambda function updates, and Lambda permission, memory, and timeout configuration were managed separately.

### Tailoring Angles

- **Full-stack roles:** React/TypeScript/Vite/Konva interaction design paired with Flask APIs, SQLAlchemy, PostgreSQL, and hosted deployment.
- **Backend roles:** Base64 image handling, service-to-service inference requests, annotation persistence, exports, and a unified polygon data contract.
- **Cloud and DevOps roles:** Docker Compose, Lambda Runtime Interface Emulator, AWS Lambda-compatible containers, Heroku, Nginx, Gunicorn, migrations, and web-application CI/CD.
- **AI-adjacent roles:** YOLOv8-Large integration, ONNX conversion, image preprocessing, 640-pixel inference, bounding-box conversion, and warm-container model reuse.
- **Product-engineering roles:** Combined automatic suggestions with user correction, manual annotation, labeling, persistence, and export workflows.

### Truth Boundaries And Missing Evidence

- Do not claim training or fine-tuning YOLOv8-Large, creating the YOLO architecture, or owning model research.
- Do not claim accuracy, precision, recall, inference latency, throughput, request volume, annotation volume, user adoption, or retraining outcomes.
- The 78% model-size reduction is confirmed; `minimal latency` and other unmeasured performance claims are not approved.
- Do not claim that GitHub Actions automated the complete model deployment. Its verified deployment scope is the Heroku web application.
- Do not claim automated ECR publication, Lambda updates, or Lambda resource and permission configuration.
- Do not describe Lambda-compatible packaging or warm-container reuse as proof of scale, availability, or cost reduction.
