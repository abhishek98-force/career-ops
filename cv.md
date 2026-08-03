# Abhishek Gopalakrishnan Unnithan, MS

San Jose, CA (open to relocation)  
(857) 350-2419 | abhishekunnithan@gmail.com  
[github.com/abhishek98-force](https://github.com/abhishek98-force)

## Summary

Software engineer experienced in backend services, cloud infrastructure, asynchronous processing, compliance automation, and web applications. Builds systems with Python, FastAPI, TypeScript, React, AWS, GCP, Azure APIs, Docker, Terraform, Kubernetes, and CI/CD workflows.

## Skills

- **Languages:** Python, TypeScript, JavaScript, Java, SQL, HTML5, CSS3
- **Frameworks and systems:** FastAPI, Flask, Gunicorn, Node.js, React, Vite, Konva, REST APIs, microservices, asynchronous processing, RabbitMQ, Axios, Cheerio, pytest, Ruff, uv
- **Cloud and infrastructure:** AWS, AWS Lambda, Azure, GCP, GKE, Artifact Registry, Workload Identity, Docker, Docker Compose, Kubernetes, kind, kubectl, Terraform, Kustomize, GitHub Actions, Nginx, Heroku, serverless, Linux
- **Data, security, and AI:** PostgreSQL, TimescaleDB, SQLAlchemy, SQLModel, Alembic, JSON Schema, AJV, PyMuPDF, Microsoft Graph, Microsoft Entra ID, MSAL, OAuth 2.0, OpenID Connect, OPA, Rego, NIST 800-171, CISA SCuBA, LLMs, multi-agent systems, YOLOv8, ONNX, Pillow, OCR, Salesforce

## Experience

### Software Engineering Intern, Sedai Labs - Spot Intelligence

July 2026 - Present

- Developed Azure Spot pricing ingestion using the Azure Retail Prices REST API, normalizing regional SKU, Linux/Windows, Spot, on-demand, and effective-date data while rejecting invalid pricing records.
- Extended SQLModel and PostgreSQL/TimescaleDB persistence with Alembic migrations and pricing-only catalog placeholders, preserving incomplete Azure prices for later hardware-metadata enrichment.
- Integrated Azure eviction observations with canonical live-state and historical storage using case-insensitive SKU matching, multi-OS updates, and safeguards against phantom records or duplicate history.
- Added fixture-backed pytest coverage and GitHub Actions validation for locked Python dependencies, Ruff, tests, and TypeScript across the shared monorepo.
- Built and locally validated a kind-based Kubernetes workflow that loaded five images, applied Kustomize manifests, verified TimescaleDB migrations and API/UI rollouts, captured diagnostics, and cleaned up the ephemeral cluster.
- Deployed and validated five Dockerized API, UI, and cloud-scraper services on GKE using Terraform, Artifact Registry, Kustomize, persistent TimescaleDB storage, Workload Identity, multi-cloud credentials, and scheduled scraper workloads.

### Software Development Engineer, Augesys

March 2026 - Present

- Built and evolved a full-stack Compliance-as-a-Service platform with FastAPI, React, Microsoft Graph, OPA, and Rego to automate Microsoft Entra security-baseline validation and explain why checks passed or failed.
- Designed a YAML manifest-driven workflow engine that models tenant-data collection as a DAG of source, transform, and final-object steps, making the pattern reusable for future Microsoft 365 product pipelines.
- Implemented server-side OAuth 2.0 Authorization Code and OpenID Connect authentication with MSAL, including tenant allowlisting, authorization-code exchange, cached silent token acquisition, and token-expiry validation.
- Built reusable Microsoft Graph clients, fan-out collection handlers, and normalization steps covering conditional access, authentication and authorization policies, application management, domains, privileged access, risky permissions, and service plans.
- Integrated OPA as a sidecar policy engine, persisted exact evaluation inputs for traceability, expanded CISA SCuBA-derived Rego checks, and returned structured results with expected and actual values, matched policies, and failure reasons.
- Developed a React/Vite validation interface with collection-progress polling, persisted latest results, policy-level explanations, and NIST 800-171 control and technical-baseline views.
- Added idempotent product-permission reconciliation, `structlog`-based operational events and external-call timing, and a Docker Compose runtime for the FastAPI and OPA services.

### Software Development Intern, IpserLabs

January 2025 - May 2025

- Developed an automated PR review system in Python using AST parsing for code structure extraction and OpenAI APIs for context-aware suggestions, improving developer productivity across teams.
- Led the architecture and development of an asynchronous document-processing pipeline using Python, RabbitMQ, and S3 to decouple OCR (Tesseract) and LLM-based extraction, generating validated outputs stored in SQLite for a web application.
- Reduced ingestion failures by 23% by validating LLM-created JSON outputs using AJV and enforcing strict schema contracts.
- Initialized a React codebase with a modular component architecture and standardized styling using Tailwind and MUI, improving development speed and maintainability for the team.

### Software Engineer, Wipro

July 2021 - August 2023

- Reduced customer-support issue resolution time by 38% for FedEx by designing 10+ HTML5/CSS3 cargo-tracking components for shipment progress, package details, delivery timelines, and disruption indicators.
- Built FedEx's end-to-end shipping-document workflow with browser-native PDF previews and automated email delivery; improved release quality through Agile/Scrum delivery, debugging, CI checks, and automated tests.
- Improved Farmers Insurance Salesforce CRM data integration and reduced redundancy by 21% by merging duplicate data across 1M+ customer account records.
- Expanded Farmers Insurance alert workflows for 30K+ users with homepage counters, contextual alerts, threaded discussion, and search to support collaboration and auditability.

## Open Source Contributions

### Core Contributor, [Boston Liquor License Tracker](https://github.com/codeforboston/boston-liquor-license-tracker)

- Reduced licensing-board update time from 15 minutes to 5 seconds by automating PDF discovery, applicant extraction, JSON updates, validation, and pull-request creation with GitHub Actions.
- Built a Python/PyMuPDF parser that converted Boston Licensing Board voting minutes into structured business, address, license, status, date, and source-document records.
- Hardened incremental processing with checkpoint state, separate discovery and processing jobs, workflow artifacts, clean no-op runs, and support for changing Boston.gov and Google Drive PDF sources.
- Added AJV and JSON Schema validation for required fields, dates, ZIP codes, license numbers, enums, and sequential indexes, plus historical deduplication and reindexing utilities.
- Merged 13 pull requests, incorporated maintainer feedback, and reviewed contributions from other project members.

## Projects

### Visual Objects (VisionAnnotator)

- Built and deployed a full-stack image-annotation system using React, TypeScript, Vite, Konva, Flask, and PostgreSQL, combining automatic detections with editable bounding boxes and free-form polygons.
- Implemented Flask APIs and SQLAlchemy models for image processing, detection requests, annotation persistence, manually created annotations, and exports using a unified JSON polygon representation.
- Converted YOLOv8-Large to ONNX, reducing model size by 78%, and packaged inference in an AWS Lambda-compatible Docker container with global model loading for warm-container reuse.
- Deployed the React/Flask application on Heroku with Nginx, Gunicorn, database migrations, and GitHub Actions; used Docker Compose and the Lambda Runtime Interface Emulator for local end-to-end development.

### Native Cloud Application

- Designed and deployed a GCP backend using Terraform with custom VPCs and HTTPS load balancing.
- Built a Node.js REST API with Sequelize for persistent data access.
- Automated user data ingestion and publishing using Pub/Sub and GitHub Actions.

## Writing

### [Data Collection With a DAG](https://medium.com/@abhishekunnithan/data-collection-with-a-dag-120d1171a9ee)

June 20, 2026

- Explained a dependency-centric architecture for multi-source data collection using source, transform, and final-object nodes.
- Discussed explicit execution ordering, reusable intermediate data, result traceability, contract boundaries, and the tradeoffs of graph-based orchestration.

## Education

### Master of Science in Software Engineering Systems, Northeastern University

September 2023 - December 2025

### Bachelor of Technology in Electrical/Electronics Engineering, College of Engineering Trivandrum

September 2017 - May 2021
