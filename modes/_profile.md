# User Profile Context -- career-ops

This file contains candidate-specific targeting rules. Candidate claims must remain grounded in `cv.md`, `config/profile.yml`, and other approved user-layer sources.

## Target Roles

Prioritize entry-to-mid-level roles in this order without assuming senior-level experience:

| Archetype | Thematic axes | Candidate value |
|-----------|---------------|-----------------|
| **Backend / Platform Engineer** | Python, FastAPI, Flask, REST APIs, manifest-driven workflows, Microsoft Graph, Azure pricing ingestion, asynchronous processing, policy evaluation, data persistence | Builds service and processing layers from API and collection through normalization, evaluation, and persistence |
| **Cloud / DevOps Engineer** | AWS, AWS Lambda, Azure, GCP, Terraform, GKE, Docker, Kubernetes, Kustomize, GitHub Actions | Automates cloud infrastructure, delivery, and deployment validation |
| **Full-Stack Software Engineer** | Python or Node.js backends, React/Vite/Konva interfaces, workflow state, cloud deployment | Works across backend services and interactive user interfaces |

Do not target senior, staff, management, product-management, or solutions-architect roles unless the user explicitly expands the target.

## Adaptive Framing

| If the role is... | Emphasize | Approved proof-point sources |
|-------------------|-----------|------------------------------|
| Backend / Platform | FastAPI and Flask services, image-processing APIs, manifest-driven DAG execution, Microsoft Graph collection, Azure pricing normalization, OPA/Rego evaluation, async pipelines, SQLAlchemy/SQLModel/PostgreSQL/TimescaleDB, RabbitMQ | `cv.md` + `article-digest.md` |
| Cloud / DevOps | Terraform, GKE/Kubernetes, Docker, AWS Lambda-compatible inference, Heroku, Nginx/Gunicorn, GitHub Actions, workflow artifacts, automated pull requests, AWS/GCP infrastructure | `cv.md` + `article-digest.md` |
| Full-Stack | Python or Node.js services paired with React/Vite/Konva interfaces, interactive workflow state, persisted results, and operational or policy-detail views | `cv.md` + `article-digest.md` |

## Professional Narrative

Use the headline and confirmed facts in `config/profile.yml`. Do not manufacture an exit story. Frame transitions only when the candidate provides the reason directly.

## Cross-Cutting Advantage

The candidate's chosen primary differentiator is **end-to-end cloud delivery**. Frame the candidate as an engineer who can connect backend implementation, cloud infrastructure, CI/CD, Kubernetes, deployment validation, policy engines, and user-facing operational interfaces. Use only details present in approved user-layer sources.

The candidate also confirms daily use of AI coding agents across planning, implementation, testing, code review, and refactoring. For AI-native software roles, pair this workflow with source-grounded evidence of specification-driven architecture, test validation, debugging, and ownership of final code quality. Do not name a specific coding-agent product unless the candidate confirms using that product directly.

## Sedai Labs Tailoring

- For backend and data roles, prioritize Azure Retail Prices ingestion, Linux/Windows meter isolation, deterministic effective-date selection, invalid-data rejection, normalized observations, SQLModel writers, PostgreSQL/TimescaleDB, and Alembic migrations.
- For platform roles, prioritize canonical multi-cloud models, pricing-only placeholders, later catalog enrichment, live-state/history semantics, provider-neutral shared writers, and AWS/GCP regression protection.
- For cloud and DevOps roles, prioritize locked GitHub Actions validation, Docker image builds, Terraform, GKE, Artifact Registry, Workload Identity, Kustomize, persistent TimescaleDB storage, migration execution, multi-cloud credentials, and scheduled workloads.
- For reliability roles, prioritize fixture-backed edge-case tests, no-phantom-record behavior, one-history-record semantics, rollout checks, diagnostics, deterministic cleanup, and source-data validation.
- Keep evidence status explicit: Docker and five-image build changes are local-branch work; the kind workflow is unstaged and locally validated; the GKE implementation, deployment, and validation are candidate-confirmed completed work with unspecified branch and environment classification.
- Do not claim production use, customer-facing operation, scale, uptime, latency, throughput, database volume, cloud-cost improvement, or quantitative user impact.
- Do not claim ownership of the Azure Resource Graph fetcher, entire platform, API/UI, MCP, AI/agentic systems, direct React or FastAPI work, NoSQL, or cybersecurity architecture.

## Salesforce And CRM Tailoring

- For Salesforce, CRM, customer-service platform, and enterprise-operations roles, prioritize the Salesforce CRM proof points in `article-digest.md`: Apex controllers, Lightning Web Components, SOQL/SOSL, Queueable and Batchable automation, Big Objects, data deduplication, sharing logic, Workspace API navigation, agent workflows, dashboard alerts, Named Credentials, and secure document delivery.
- For Salesforce data-quality roles, lead with the 43% storage reduction from Big Object archival and the separately documented 21% redundancy reduction across more than 1M customer account records. Do not combine these with the 30K+ user workflow scope.
- For FedEx/customer-operations roles, prioritize the 10+ Lightning components, secure shipment-document delivery, Workspace API integration, and confirmed 38% issue-resolution improvement.
- For Salesforce integration roles, lead with the Farmers home-screen LWC and Apex controller using a Named Credential for external news, then connect platform work to REST/SOAP APIs, Python, TypeScript, JavaScript, SQL, RabbitMQ, PostgreSQL, and access/permissions management only when relevant to the JD.
- For Salesforce CI/CD and quality roles, state that the candidate integrated SonarQube analysis into an existing GitHub Actions pull-request pipeline and worked with Apex tests. Do not claim ownership of the pipeline's existing Apex-test job or scratch-org deployment workflow.
- Do not claim ownership of the complete Salesforce implementations, certification dates or IDs, Salesforce platform scale, the FedEx Apex wrapper/API layer, trigger/async test suites, or unmeasured Apex-test/production metrics.

## Augesys Tailoring

- For backend and platform roles, prioritize the FastAPI product APIs, manifest-driven DAG engine, reusable handlers, Microsoft Graph fan-out collection, normalized artifacts, and structured failure handling.
- For identity, cloud-security, or compliance-platform roles, prioritize OAuth/OIDC with MSAL, `tid` allowlisting, token-aware Graph access, permission reconciliation, OPA/Rego, evidence traceability, and explainable policy results.
- For full-stack roles, pair backend orchestration with the React/Vite validation workflow, progress polling, persisted latest-result retrieval, NIST 800-171 control views, and policy-level explanations.
- For DevOps-oriented roles, Augesys supports Docker Compose, sidecar integration, environment-based configuration, health endpoints, and structured runtime logging. Use Sedai for Kubernetes, Terraform, GKE, and cloud delivery evidence.
- Do not turn Augesys roadmap work into implementation claims. OSCAL exports, audit-grade runs, broader Microsoft 365 support, and production scale remain unverified or future-facing.

## VisionAnnotator Tailoring

- For full-stack roles, prioritize the React/TypeScript/Vite/Konva annotation canvas, Flask APIs, SQLAlchemy/PostgreSQL persistence, unified polygon contract, and hosted web deployment.
- For backend roles, prioritize base64 image handling, service-to-service inference requests, bounding-box conversion, annotation persistence and export, and the shared JSON coordinate representation.
- For cloud and DevOps roles, prioritize Docker Compose, AWS Lambda Runtime Interface tooling, Lambda-compatible model packaging, Heroku, Nginx/Gunicorn, startup migrations, and GitHub Actions deployment of the web application.
- For AI-adjacent roles, prioritize YOLOv8-Large integration, ONNX conversion with the confirmed 78% model-size reduction, Pillow preprocessing, 640-pixel inference, labeled bounding-box output, and warm-container model reuse.
- For product-engineering roles, emphasize combining automatic detection with user correction, polygon drawing, label management, persistence, and export.
- Do not claim model training or research, detection accuracy, latency, throughput, annotation volume, users, adoption, retraining outcomes, or cost savings.
- GitHub Actions automated the Heroku web deployment only. Do not claim automated ECR publishing, Lambda updates, or Lambda permission, memory, and timeout configuration.

## Boston Liquor License Tracker Tailoring

- For backend and data-pipeline roles, prioritize Python/PyMuPDF extraction, TypeScript orchestration, parsing and normalization, incremental checkpoint state, JSON contracts, deduplication, and deterministic reindexing.
- For DevOps and automation roles, prioritize GitHub Actions job separation, artifacts, scheduled/manual/reusable triggers, repository-scoped permissions, automated pull requests, and the confirmed 15-minute-to-5-second improvement.
- For reliability roles, prioritize clean no-op behavior, adaptation to Boston.gov and Google Drive source changes, schema validation, duplicate cleanup, and sequential-index enforcement.
- For open-source and collaboration signals, cite 13 merged pull requests, iteration on maintainer feedback, peer review, and documented workflow decisions.
- For civic-tech roles, connect the work to public access to structured Boston liquor-license activity without claiming broader user-adoption metrics.
- Do not frame this project as a backend API, database-backed application, AI/LLM system, security platform, or ownership of the broader React/Vite frontend.
- Do not claim production deployment, live-user scale, document or record volume, extraction accuracy, uptime, or impact beyond the confirmed update-time improvement.

## Work Preferences

Prioritize work involving:

- Cloud infrastructure
- Backend systems
- Full-stack product ownership
- AI automation

Deprioritize roles dominated by:

- Sales or quota-carrying responsibilities
- Frontend styling with little systems or product engineering
- Repetitive manual operations with limited automation

These are ranking preferences, not hard blockers unless the user explicitly says otherwise.

## Lead Achievement

Lead interview framing with the Boston Liquor License Tracker automation when relevant: the confirmed result reduced licensing board list updates from 15 minutes to 5 seconds. Use only implementation details documented in `cv.md`, `article-digest.md`, and `interview-prep/story-bank.md`.

## Portfolio

The confirmed portfolio is the candidate's GitHub profile in `config/profile.yml`. Never attribute authorship of an unlisted repository or project to the candidate.

## Compensation

- Confirmed target range: `$60K-$200K USD` total compensation.
- Confirmed minimum: `$60K USD`.
- Treat the broad range as flexibility, not evidence that every offer within it is competitive.
- Compare each offer against current market data for its exact role, level, and location.

## Location And Work Authorization

- Current location: San Jose, CA, in the Pacific time zone.
- Open to relocation.
- Currently has temporary US work authorization and will require employer sponsorship in the future.
- Flag roles that explicitly do not offer sponsorship.
- Do not claim permanent work authorization or specify a visa category unless the user supplies it.
