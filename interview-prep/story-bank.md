# Interview Story Bank

These stories contain only candidate-confirmed facts. Results marked qualitative must not be converted into invented metrics. Reflections marked as not yet provided should be elicited before using the story as a polished interview answer.

## Augesys: Reframing Multi-Source Collection As A DAG

- **Themes:** System design, backend architecture, extensibility, data pipelines, tradeoffs
- **Situation:** The Microsoft Entra validation workflow had to combine configuration from multiple Microsoft Graph resources, local data, intermediate transformations, and final evidence objects. Source-oriented provider classes would mix fetching, coordination, transformation, and business rules.
- **Task:** Create a reusable collection architecture for the Entra reference implementation that could support future Microsoft 365 product pipelines without hard-coding each product flow.
- **Action:** Designed a YAML manifest that models collection as a directed acyclic graph of source, transform, and final-object steps. Built compilation and execution services to load the manifest, resolve handlers, execute dependencies, track progress, persist normalized artifacts, assemble Rego input, and invoke evaluation.
- **Result:** Established an explicit, repeatable collect-transform-persist-assemble-evaluate workflow with reusable intermediate artifacts and progress reporting. The architecture can be extended with additional product manifests, but broader Microsoft 365 implementations are not yet confirmed.
- **Reflection:** The candidate's published architecture perspective supports the principle that multi-source outputs are dependency-centric and benefit from explicit graphs, while acknowledging the added naming, validation, handler-contract, and debugging overhead.
- **Metrics:** No scale, latency, or time-savings metric has been provided.

## Augesys: Securing A Multi-Tenant Microsoft Entra Flow

- **Themes:** Authentication, authorization, cloud security, multi-tenancy, API reliability
- **Situation:** The platform needed server-side Microsoft Entra authentication and authenticated Microsoft Graph access while preventing unapproved tenants from entering the validation workflow.
- **Task:** Implement the sign-in flow, token lifecycle integration, tenant authorization boundary, and Graph client safeguards.
- **Action:** Implemented OAuth 2.0 Authorization Code and OpenID Connect authentication with MSAL `ConfidentialClientApplication`; handled redirects and code exchange; used MSAL's cache for silent token acquisition; validated the ID token `tid` against an approved-tenant allowlist; rejected unknown tenants; and added missing/expired-token checks and structured Graph failure handling.
- **Result:** Produced a token-aware, tenant-restricted authentication path for the platform and reusable authenticated Graph requests. Do not describe this as direct refresh-token handling.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No tenant count, authentication volume, latency, or incident-reduction metric has been provided.

## Augesys: Building Explainable Policy-As-Code Evaluation

- **Themes:** OPA, Rego, compliance automation, evidence traceability, full-stack delivery
- **Situation:** Raw Microsoft Entra configuration was insufficient for users who needed to understand whether implemented checks passed or failed and what evidence produced each result.
- **Task:** Normalize collected resources, evaluate them against security baselines, preserve evaluation traceability, and present understandable results.
- **Action:** Built product-specific resource mappings and assembled normalized resources into Rego input; integrated OPA as a sidecar; persisted the exact input payload used for evaluation; expanded CISA SCuBA-derived Entra rules; returned structured expected and actual values, candidate and matched policies, and failure reasons; and built React/Vite control, baseline, and policy-detail views with NIST 800-171 mappings.
- **Result:** Delivered evidence-backed, explainable results at both technical-baseline and higher-level NIST 800-171 control views, with persisted latest-result retrieval and collection-progress feedback.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No control count, review-time reduction, user-adoption, or accuracy metric has been provided.

## Augesys: Reconciling Product Permissions Idempotently

- **Themes:** Idempotency, Microsoft Graph permissions, automation, product abstractions
- **Situation:** Product collection workflows required specific Microsoft Graph application roles and a Tenant Configuration Management service principal, while repeated setup runs needed to avoid redundant assignments.
- **Task:** Resolve required access and grant only permissions that were missing.
- **Action:** Mapped product capabilities to required application roles, ensured the service principal existed, inspected existing assignments, calculated the missing set, and granted only missing product-level permissions through a common product abstraction.
- **Result:** Created an idempotent permission-reconciliation workflow suitable for repeated product setup operations.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No setup-time or failure-reduction metric has been provided.

## Boston Liquor License Tracker: Automating Applicant Ingestion

- **Themes:** Automation, data pipelines, civic technology, GitHub Actions, measurable improvement
- **Situation:** Updating the project's applicant dataset from Boston Licensing Board voting minutes required repeatedly locating source documents, downloading PDFs, extracting records, updating repository data, and preparing changes for review.
- **Task:** Make the update process repeatable and substantially reduce the manual time required.
- **Action:** Implemented repository automation that discovers the next unprocessed voting-minutes PDF, downloads it, extracts applicant records with Python and PyMuPDF, updates JSON data and checkpoint state, validates the result, and creates an automated pull request through GitHub Actions.
- **Result:** Reduced licensing-board list update time from 15 minutes to 5 seconds.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** The 15-minute-to-5-second update improvement is confirmed. Document and record volumes are not yet provided.

## Boston Liquor License Tracker: Adapting To Source Changes

- **Themes:** Reliability, debugging, external dependencies, resilient ingestion
- **Situation:** Boston.gov changed page selectors and PDF-hosting patterns, and voting-minutes documents could appear through Boston.gov file-server links or Google Drive.
- **Task:** Keep discovery and download behavior working across the changed source formats and make pipeline execution safer when no new document existed.
- **Action:** Updated voting-minutes link selection and URL handling, added support for Boston.gov and Google Drive sources, separated discovery and processing jobs, passed PDFs through GitHub Actions artifacts, emitted structured workflow output, and added clean no-op behavior plus a test workflow.
- **Result:** Improved the ingestion workflow's resilience to source-link changes and no-new-document runs without claiming uptime or incident-reduction metrics.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No failure-rate, uptime, or recovery-time metric has been provided.

## Boston Liquor License Tracker: Adding Dataset Contract Validation

- **Themes:** Data quality, schema contracts, CI, defensive engineering
- **Situation:** Applicant records persisted in `licenses.json` needed consistent required fields, formats, enum values, and ordering before changes were merged.
- **Task:** Create an executable data contract and enforce it when pull requests changed license data or its schema.
- **Action:** Added JSON Schema and AJV validation for required fields, date formats, ZIP codes, license numbers, enum values, and sequential indexes; implemented a custom `sequentialIndexes` keyword; and added a GitHub Actions workflow that compiles and runs the TypeScript validator.
- **Result:** Established an automated pull-request validation gate for the frontend-consumed JSON dataset.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** It is not yet verified whether this gate caught malformed data in real pull requests.

## Boston Liquor License Tracker: Cleaning Historical Applicant Data

- **Themes:** Data migration, deduplication, deterministic ordering, maintenance
- **Situation:** Historical PDF batch loading could generate duplicate records and leave indexes inconsistent with the dataset's required sequential ordering.
- **Task:** Make historical seeding deterministic and restore dataset consistency.
- **Action:** Added local PDF-batch loading utilities, sorted records by meeting date and entity number, removed duplicates, reindexed the archive, and enforced sequential ordering through validation.
- **Result:** Produced a deduplicated, consistently ordered historical JSON dataset without claiming a specific record count.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No duplicate count, dataset size, or processing-time metric has been provided.

## Sedai Labs: Normalizing Azure Spot Pricing Correctly

- **Themes:** API integration, data normalization, edge cases, testing, cloud pricing
- **Situation:** Azure Retail Prices data contains regional and operating-system-specific meters, legacy Low Priority records, changing effective dates, malformed values, and cases where an on-demand counterpart is unavailable.
- **Task:** Convert public Azure pricing responses into deterministic observations compatible with the platform's shared multi-cloud pricing model.
- **Action:** Implemented regional retrieval and normalization, isolated Linux and Windows meters, paired Spot and on-demand prices when available, preserved valid Spot-only observations, selected records by effective date, propagated `effectiveStartDate`, and rejected zero or invalid values. Added fixture-backed tests for these edge cases.
- **Result:** Produced normalized Azure pricing observations with deterministic meter selection and regression coverage. No production volume, throughput, or user-impact metric is confirmed.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No region count, SKU count, parsing accuracy, latency, or freshness metric has been provided.

## Sedai Labs: Preserving Prices Without Complete Catalog Metadata

- **Themes:** Schema evolution, persistence, incomplete data, backward compatibility, multi-cloud systems
- **Situation:** Valid Azure prices could arrive before subscription-scoped hardware metadata, causing otherwise useful observations to be dropped by catalog requirements.
- **Task:** Preserve pricing while maintaining a path to complete the catalog record later and avoiding regressions for AWS and GCP.
- **Action:** Added pricing-only catalog placeholders with enrichment metadata, made `vcpu` and `ram_gb` nullable, created an Alembic migration with upgrade and downgrade paths, reconciled placeholders when complete SKU data arrived, and added shared-writer tests for creation, normalization, enrichment, and unchanged AWS/GCP behavior.
- **Result:** Enabled valid Azure prices to flow into canonical live-state and TimescaleDB history before complete hardware metadata was available, with a verified later-enrichment path.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No preserved-record count, production migration status, or database-volume metric has been provided.

## Sedai Labs: Integrating Azure Interruption State Safely

- **Themes:** Data integrity, idempotency, canonicalization, shared persistence, ownership boundaries
- **Situation:** Azure eviction observations needed to update operating-system-specific current state and append history without creating nonexistent catalog records or duplicating history for one provider observation.
- **Task:** Integrate normalized interruption observations into the shared persistence layer while preserving canonical SKU identity.
- **Action:** Implemented case-insensitive SKU matching, updated every existing OS-specific live-state row for the matching SKU and region, prevented phantom catalog and state creation, and appended one historical record per provider observation. Added tests for matching, multi-OS updates, no-creation behavior, and history handling.
- **Result:** Established verified persistence semantics for Azure interruption observations without claiming ownership of the Azure Resource Graph fetcher, which another contributor authored.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No observation volume, production execution, or failure-rate metric has been provided.

## Sedai Labs: Building CI And Local Kubernetes Validation

- **Themes:** CI/CD, Docker, Kubernetes, reproducibility, diagnostics
- **Situation:** The shared monorepo needed consistent Python and TypeScript validation, reproducible container inputs, and a way to exercise the core stack in Kubernetes before cloud deployment.
- **Task:** Automate validation and create a repeatable local cluster workflow covering images, database readiness, migrations, and application rollouts.
- **Action:** Added GitHub Actions validation with locked `uv` dependencies, pytest, Ruff, TypeScript, and concurrency cancellation; locally extended image builds across five services; pinned Python and `uv` images by digest; and built a kind workflow that loaded local images, applied Kustomize, verified TimescaleDB, migrations, API/UI rollouts, captured diagnostics, and always cleaned up.
- **Result:** Successfully built five images and completed core kind validation locally. Docker/image-build work remains on a local branch, and the kind workflow remains unstaged without remote GitHub Actions validation.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No CI-duration, developer-time, remote pass-rate, or failure-reduction metric has been provided.

## Sedai Labs: Deploying The Multi-Cloud Stack On GKE

- **Themes:** GCP, Terraform, GKE, Kubernetes, multi-cloud delivery, infrastructure as code
- **Situation:** Spot Intelligence needed a cloud environment for its API, UI, three cloud scrapers, persistent pricing storage, migrations, and scheduled collection workloads.
- **Task:** Provision the required GCP infrastructure, publish application images, deploy the stack, configure workload credentials, and validate it on GKE.
- **Action:** Implemented Terraform-managed APIs, networking, Artifact Registry, IAM, a zonal GKE cluster, and a dedicated node pool; published five application images; applied a GKE-specific Kustomize deployment; configured persistent TimescaleDB and Alembic migration execution; set up GCP Workload Identity and AWS/Azure credentials; and implemented scheduled scraper workloads.
- **Result:** Deployed and validated the GKE application stack. This is candidate-confirmed completed work, but the environment classification, production use, real-data validation scope, repository branch, and pull-request status are unspecified.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No availability, latency, throughput, cloud-cost, database-volume, or user-impact metric has been provided.

## Sedai Labs: Recovering Azure Pricing From Page-Level Throttling

- **Themes:** Reliability, retries, external APIs, root-cause analysis, data pipelines
- **Situation:** Azure Retail Prices ingestion encountered repeated `429 Too Many Requests` and transient server failures. Retrying the complete multi-region scrape repeatedly downloaded pages that had already succeeded and increased API load.
- **Task:** Recover from transient failures at the smallest safe unit while preserving completed work and preventing Kubernetes from restarting the entire scrape.
- **Action:** Added page-level retries for `429` and transient `5xx` responses, honored bounded numeric `Retry-After` values, used bounded exponential fallback delays, resumed the exact failed pagination URL, and set the production Azure pricing Job's Kubernetes retry limit to zero after scraper-level retries were exhausted. Added tests for throttling recovery, server failures, exhaustion, exact-page resumption, and non-retryable client errors.
- **Result:** Preserved completed pages and regions during transient failures and prevented full-scrape retries from amplifying Azure API load.
- **Reflection:** The retry boundary should match the smallest independently recoverable operation; infrastructure retries should not duplicate application-level recovery.
- **Metrics:** No production failure-rate or recovery-time reduction is confirmed.

## Sedai Labs: Securing Multi-Cloud Scraper Authentication

- **Themes:** Cloud identity, least privilege, Kubernetes, secrets, AWS, Azure, GCP
- **Situation:** Production AWS, Azure, and GCP scrapers required different authentication mechanisms without committing credentials or giving every workload access to every secret.
- **Task:** Create provider-specific workload identities and deliver only the credentials required by each scraper.
- **Action:** Configured dedicated Kubernetes service accounts; implemented Azure workload identity federation with projected short-lived tokens instead of a client secret; configured GCP Workload Identity and Secret Manager delivery for the pricing API key; delivered AWS credentials through Google Secret Manager and External Secrets; scoped access to individual secrets; and removed the temporary GitHub credential-seeding permission after migration.
- **Result:** Established provider-specific production authentication with bounded credential exposure and no cloud credential values committed to Git or Terraform state.
- **Reflection:** Identity boundaries should follow workload boundaries, and temporary migration privileges should be removed as soon as their one-time purpose is complete.
- **Metrics:** No incident reduction, audit outcome, or credential-rotation metric is confirmed.

## VisionAnnotator: Unifying Automatic And Manual Annotations

- **Themes:** Full-stack design, data contracts, interactive tooling, computer vision integration
- **Situation:** The application needed to combine model-generated rectangular detections with free-form polygons created or corrected by users.
- **Task:** Give both annotation sources one representation that the canvas, backend, and database could edit and persist consistently.
- **Action:** Rendered detected boxes as editable Konva shapes, supported polygon drawing and label editing, converted model rectangles from `[x1, y1, x2, y2]` into four polygon points, and stored polygon coordinates as JSON through Flask, SQLAlchemy, and PostgreSQL.
- **Result:** Enabled automatic boxes and manually drawn polygons to use one annotation contract across interaction, API handling, and persistence.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No annotation count, user count, correction-rate, or workflow-time metric has been provided.

## VisionAnnotator: Reducing YOLOv8-Large Model Size With ONNX

- **Themes:** Model packaging, inference integration, optimization, serverless constraints
- **Situation:** The YOLOv8-Large model needed to be packaged for a containerized AWS Lambda-compatible inference service.
- **Task:** Reduce the deployable model footprint while retaining the object-detection workflow.
- **Action:** Exported YOLOv8-Large to `yolov8l.onnx`, integrated the ONNX detector into a Python 3.11 service, decoded base64 images with Pillow, ran 640-pixel inference, and returned labeled bounding boxes.
- **Result:** Reduced model size by a confirmed 78%.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** Model-size reduction is confirmed; accuracy, latency, throughput, and cost effects are not measured.

## VisionAnnotator: Reusing The Model In Warm Lambda Containers

- **Themes:** Serverless architecture, initialization lifecycle, inference services
- **Situation:** Loading a large object-detection model inside every request handler invocation would repeat initialization work whenever the execution environment was reused.
- **Task:** Structure the inference service so a warm Lambda-compatible container could retain the loaded detector between requests.
- **Action:** Initialized `YOLOv8("yolov8l.onnx")` at module scope rather than inside the Lambda request handler and packaged the service with the AWS Lambda Runtime Interface Client in Docker.
- **Result:** Allowed warm execution environments to reuse the globally loaded model. This is an architectural behavior, not evidence of measured latency or cost improvement.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No cold-start, warm-start, latency, request-volume, or cost metric has been provided.

## VisionAnnotator: Matching Local And Hosted Inference Contracts

- **Themes:** Local development, service contracts, Docker Compose, Lambda compatibility
- **Situation:** Local development needed to exercise the same Lambda handler and request shape used by the separately hosted model service.
- **Task:** Avoid maintaining a different local inference API while running the web application, database, and model together.
- **Action:** Ran the `yolo-service` through Docker Compose with the AWS Lambda Runtime Interface Emulator and invoked `http://yolo-service:8080/2015-03-31/functions/function/invocations` using the same base64-image and score-threshold JSON payload.
- **Result:** Provided a local end-to-end path using the Lambda-compatible handler and invocation format.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No setup-time, test-duration, parity-defect, or developer-time metric has been provided.

## VisionAnnotator: Packaging And Deploying The Full-Stack Web Application

- **Themes:** Deployment, reverse proxy, containers, CI/CD, application startup
- **Situation:** The React frontend, Flask API, and database migrations needed to run as one Heroku-hosted web application while inference remained a separate service.
- **Task:** Package the frontend and backend, route browser and API traffic correctly, apply migrations, and automate web deployment.
- **Action:** Built React static assets into a combined Docker image with Nginx, Flask, and Gunicorn; applied database migrations during startup; ran Gunicorn on port `8080`; served static files through Nginx; proxied `/api` requests to Flask; and used GitHub Actions for Heroku deployment.
- **Result:** Deployed the web application on Heroku with inference configured separately through `AWS_LAMBDA_URL`.
- **Reflection:** Not yet provided by the candidate.
- **Metrics:** No deployment-frequency, availability, user-adoption, or operational metric has been provided.
