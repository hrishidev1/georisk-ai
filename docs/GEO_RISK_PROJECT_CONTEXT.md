# GeoRisk AI — Project Context

> Canonical operational context for all AI coding agents and developers.
>
> Master strategic plan:
> `GeoRisk_AI_Master_Project_Plan_Production_AI_GIS.docx`
>
> This document describes the current implementation state, architectural
> principles, roadmap, constraints, and immediate development priority.

---

# 1. Project Identity

GeoRisk AI is a production-oriented geospatial intelligence platform.

The system combines:

- Backend engineering
- Geospatial processing
- Interactive GIS
- Computer vision
- Uncertainty quantification
- Hazard/risk analysis
- LLM intelligence
- MLOps
- Cloud infrastructure
- Data engineering
- Analytics
- DevOps and observability

The final system should be treated as a platform rather than a collection
of independent scripts or ML demos.

---

# 2. Canonical Architecture

The target architecture is:

Next.js
    ↓
FastAPI
    ↓
Application Services
    ↓
Repositories
    ↓
PostgreSQL + PostGIS
    ↓
Storage / Queue abstractions
    ↓
Processing and Inference Workers

The major logical components are:

Frontend
    ↓
FastAPI API
    ↓
Project Service
Raster Service
Processing Service
Report / LLM Service
    ↓
Domain / Repository Layer
    ↓
PostgreSQL + PostGIS
Object Storage
Queue
    ↓
Raster Workers
SegFormer Workers
TerraWatch Workers
LLM Inference

---

# 3. Core Architecture Principles

These principles are non-negotiable.

## 3.1 Infrastructure Independence

Business logic must not depend directly on:

- Celery
- Redis
- Pub/Sub
- GCS
- S3
- Cloud Run
- BigQuery
- Other infrastructure-specific implementations

Infrastructure must be accessed through appropriate abstractions.

Examples:

StorageService
    ├── LocalStorage
    ├── GCSStorage
    └── S3Storage

QueueService
    ├── Local implementation
    └── Pub/Sub / Celery / Arq implementation when justified

The domain and application layers must remain independent of the
infrastructure implementation.

---

## 3.2 Incremental Development

GeoRisk AI must be implemented incrementally.

Rules:

1. Implement one capability at a time.
2. Make one isolated change.
3. Compile/test the change.
4. Verify behavior.
5. Only then continue to the next capability.

Do not implement several unrelated features in one step.

Do not provide or execute a large roadmap implementation when the current
step is not complete.

---

## 3.3 Do Not Build Infrastructure Prematurely

A technology appearing in the roadmap does not mean it should be introduced
immediately.

Examples:

- Do not introduce Spark before distributed ETL is required.
- Do not introduce Celery before distributed processing is required.
- Do not introduce Pub/Sub before cloud queueing is required.
- Do not introduce Redis caching without a demonstrated performance need.
- Do not introduce LoRA/QLoRA without evaluation showing a domain gap.
- Do not introduce cloud infrastructure before the local architecture is
  stable.

Prefer the simplest implementation that preserves the required abstraction.

---

## 3.4 Provenance

Every generated raster must have clear provenance.

Generated artifacts must preserve:

- Parent raster
- Processor
- Processor version
- Processing parameters
- Metadata
- File path
- Processing relationship

AI artifacts must additionally preserve:

- Model version
- Model configuration
- Input artifacts
- Preprocessing configuration
- UQ configuration where applicable
- Pipeline/job dependency

AI results must be reproducible from their model version, input artifacts,
and configuration.

---

## 3.5 Processing Reliability

Processing is asynchronous, observable and cancellable.

Jobs must support:

- queued
- running
- completed
- failed
- cancelled
- cancellation requested
- progress
- messages
- timestamps
- processor version
- parameters

Failed SQLAlchemy transactions must be rolled back before attempting to
persist a FAILED job state.

A processing failure must never leave a job permanently RUNNING.

---

# 4. Current Implementation Status

## Phase 1 — Core Platform

Status: COMPLETE

Implemented:

- JWT authentication
- Users
- Projects
- AOIs
- Raster CRUD
- Metadata extraction
- Storage abstraction
- Repository pattern
- Service layer
- Alembic migrations
- Docker
- PostgreSQL/PostGIS
- Frontend foundation
- Workspace shell foundation

---

# 5. Phase 2 — Geospatial Processing Engine

Current major phase:

## Phase 2.3 — Raster Derivatives

---

# 6. Phase 2.1 — Processing Framework

Status: COMPLETE

Implemented:

- Processor abstraction
- ProcessingContext
- ProcessingResult
- GeneratedRaster
- Processor registry
- Processor factory
- ProcessingManager
- LocalExecutor
- Storage-aware paths
- Progress callbacks

---

# 7. Phase 2.2 — Processing Jobs

Status:

COMPLETE WITH PRODUCTION HARDENING REMAINING

Implemented:

- Processing job persistence
- Job lifecycle
- Progress tracking
- Job messages
- Timestamps
- Processor version
- Processing parameters
- Job polling
- Job cancellation
- ProcessingJobTracker
- ProcessingJobRepository
- Provenance

Remaining hardening:

- Transaction rollback before FAILED persistence
- Failure-state reliability
- Idempotency keys before distributed execution
- Ensure output persistence failures cannot leave jobs RUNNING

This hardening must be completed before the processing engine is considered
fully production-hardened.

---

# 8. Phase 2.3 — Raster Derivatives

Status:

IN PROGRESS

## Completed

### Metadata

Purpose:
Extract raster metadata.

### Hillshade

Purpose:
Generate terrain relief visualization.

### Slope

Purpose:
Generate terrain slope raster.

### Aspect

Purpose:
Generate terrain aspect raster.

### Color Relief

Purpose:
Generate RGB terrain visualization.

Color Relief has been successfully integrated into the processor registry,
database enum and generated raster persistence.

---

## Remaining

The required remaining processors are:

1. Contour
2. Clip
3. Merge
4. Reproject

The immediate next implementation is:

# Contour

Do not skip to Clip, Merge, Reproject, Phase 2.4, Phase 3 or Phase 4 unless
explicitly instructed.

---

# 9. Processor Requirements

Every raster processor must provide:

- Parameter validation
- Processor registration
- Storage abstraction
- Provenance
- Metadata persistence
- Required enum migrations
- Progress reporting
- Error handling
- Mathematical/correctness tests where applicable
- End-to-end API test

Every enum-backed processor or raster type addition requires the appropriate
PostgreSQL/Alembic migration.

---

# 10. Phase 2.4 — Raster Preview

Status:

NOT STARTED

Required capabilities:

- Thumbnail generation
- PNG preview
- Histogram/statistics
- Quick metadata

This begins only after Phase 2.3 is complete.

---

# 11. Phase 2.5 — Workspace

Status:

NOT STARTED

Required capabilities:

Project
    ↓
Raster Upload
    ↓
Raster List
    ↓
Generated Raster Browsing
    ↓
Job Queue
    ↓
Job Status / Progress

Realtime job progress may use SSE when realtime delivery is introduced.

---

# 12. Phase 3 — Interactive GIS

Status:

NOT STARTED

Phase 3 begins after the geospatial processing foundation,
Raster Preview and Workspace are sufficiently complete.

## Backend

Required:

- Raster tile generation
- PostGIS spatial queries
- AOI intersections
- Geometry validation
- Geometry normalization
- Raster clipping integrated with AOI workflows
- GeoJSON support
- Coordinate-related spatial operations

Redis caching should only be introduced where profiling demonstrates a real
performance benefit.

## Frontend

Technology:

- MapLibre GL JS

Required:

- Interactive map
- AOI drawing
- AOI editing
- Layer panel
- Layer visibility controls
- Raster overlays
- GeoJSON layers
- Coordinate inspector

Target UX:

Project
    ↓
AOI
    ↓
Layer
    ↓
Map
    ↓
Processing
    ↓
Result Layer
    ↓
Analysis

---

# 13. Phase 4A — AI / Computer Vision / Hazard Intelligence

Phase 4A contains the GeoRisk AI differentiator.

The AI architecture is a two-stage cascaded inference pipeline:

Input Raster / AOI / DEM / Satellite
    ↓
SegFormer
    ↓
Segmentation + Uncertainty
    ↓
TerraWatch
    ↓
Risk Score + Hazard Maps
    ↓
Structured Risk + Uncertainty Metrics
    ↓
Validated LLM Report

---

# 14. Phase 4A.1 — SegFormer

SegFormer is the first AI inference stage.

Responsibilities:

- Multi-class semantic segmentation
- Generate segmentation mask
- Generate model outputs required by downstream analysis
- Persist model provenance
- Persist preprocessing configuration
- Persist model version

The existing uncertainty-aware SegFormer research/model is the basis for this
integration.

---

# 15. Phase 4A.2 — Uncertainty Engine

SegFormer must provide uncertainty as a first-class output.

Primary output:

Uncertainty Raster

Scale:

0.0 → high confidence
1.0 → high uncertainty

The exact normalization must be explicitly documented.

Possible UQ methods:

- Probability entropy
- Margin-based uncertainty
- MC Dropout
- Ensembles

Fast entropy/margin methods may be used where appropriate.

MC Dropout or ensembles should only be enabled where deployment and
evaluation justify them.

The uncertainty raster is an authoritative analytical artifact and must not
be treated as decorative metadata.

---

# 16. Phase 4A.3 — TerraWatch

TerraWatch is an independent risk-analysis model.

Inputs may include:

- Raw imagery
- DEM
- Slope
- Supported terrain predictors
- Supported weather/rainfall predictors
- SegFormer segmentation channels/features
- Optionally the uncertainty raster

Outputs:

- Continuous risk score raster
- Hazard maps
- Low/Medium/High risk classifications where supported
- Structured risk metrics

TerraWatch must preserve:

- Model version
- Input provenance
- Feature schema
- Processing configuration
- Parent artifacts

---

# 17. Phase 4A.4 — Cascaded Orchestration

The pipeline is:

Input
    ↓
Stage 1 — SegFormer
    ↓
Segmentation Mask
+
Uncertainty Raster
    ↓
Stage 2 — TerraWatch
    ↓
Risk Score Raster
+
Hazard Maps
    ↓
Structured Risk + Uncertainty Metrics
    ↓
LLM Layer

Critical rules:

1. SegFormer and TerraWatch remain independent processors/services.
2. Stage 1 artifacts must be persisted before Stage 2 starts.
3. TerraWatch must never consume incomplete artifacts.
4. Failure of Stage 1 must prevent Stage 2 execution.
5. Parent jobs and artifact dependencies must be recorded.
6. Queue-task chaining belongs in the infrastructure adapter.
7. QueueService abstraction must remain intact.

---

# 18. Phase 4A — AI Output Artifacts

Expected artifacts:

## Segmentation Mask

Purpose:
Semantic classes/features.

## Uncertainty Raster

Purpose:
Pixel-wise prediction uncertainty.

## Risk Score Raster

Purpose:
Continuous TerraWatch risk score.

## Hazard Map

Purpose:
Risk classes/zones.

## Structured Metrics

Examples:

- Risk score
- Risk class
- Mean uncertainty
- Percentile uncertainty
- Affected area
- Elevation statistics
- Slope statistics
- Model version
- Processing metadata

---

# 19. AI Provenance Model

Prefer generated child Raster records plus structured analysis metadata.

Do not scatter AI artifact paths across the Raster model.

Preferred conceptual structure:

Analysis Run
    ├── Segmentation Raster
    ├── Uncertainty Raster
    ├── Risk Score Raster
    ├── Hazard Map
    └── Structured Analysis Metrics

Each artifact must have:

- Lifecycle
- Parent relationship
- Provenance
- Model/version information where applicable

---

# 20. Phase 4B — LLM Intelligence

The LLM is a reporting and reasoning layer.

The LLM is NOT the numerical source of truth.

Authoritative sources are:

- GIS measurements
- SegFormer outputs
- Uncertainty metrics
- TerraWatch risk outputs
- Structured analytical results

The LLM converts these authoritative outputs into human-readable
intelligence.

---

# 21. Uncertainty-Aware LLM Reporting

LLM inputs may include:

- Risk class
- Risk score
- Uncertainty
- Confidence
- Elevation statistics
- Slope statistics
- Affected area
- Model provenance
- Processing provenance

The report must:

- Explain risk
- Explain uncertainty
- Distinguish model predictions from deterministic GIS measurements
- Avoid unsupported numerical claims
- Avoid inventing risk scores
- Explicitly mention material uncertainty

A proposed starting threshold is:

0.45

However, this is NOT a universal scientific constant.

The threshold must be configurable and evaluated.

---

# 22. LLM Validation

Reports must be validated against structured outputs.

Validation should check:

- Location
- Risk class
- Risk score
- Uncertainty
- Numerical claims
- Source metrics
- Model provenance

The system must not allow confident prose to hide high uncertainty.

Underlying source metrics should be exposed alongside the generated report.

---

# 23. Phase 4B — RAG

Use PostgreSQL + pgvector where practical.

Potential embedded sources:

- Approved reports
- AOI metadata
- Processing history
- Analytical summaries
- Project history

The RAG system should retrieve authoritative project records before the LLM
generates an answer.

---

# 24. Optional Fine-Tuning

Do NOT fine-tune by default.

First evaluate:

- Prompting
- Structured context
- RAG
- Validation

Only introduce LoRA/QLoRA if evaluation demonstrates a real domain gap.

If fine-tuning is justified:

- Use PEFT
- Keep base model separately versioned
- Keep adapter separately versioned
- Track training configuration
- Track evaluation metrics
- Validate factual/report quality

---

# 25. MLOps

Use MLflow for model registry and experiment tracking.

Track:

## segformer-uncertainty

- Model weights
- Architecture
- Configuration
- UQ method
- Dataset/version
- Evaluation metrics
- Preprocessing configuration

## terrawatch-risk

- Model weights
- Feature schema
- Dataset/version
- Evaluation metrics

## llm-report-adapter

Only if fine-tuning is actually introduced:

- Base model
- Adapter
- Training configuration
- Evaluation configuration
- Evaluation metrics

Every inference must be reproducible from:

Model version
+
Input artifacts
+
Configuration
+
Preprocessing version

---

# 26. Phase 5 — Cloud

Cloud implementation comes only after the local architecture is stable.

Current:

Local implementations

Future:

StorageService
    ├── LocalStorage
    ├── GCS
    └── S3

QueueService
    ├── Local
    ├── Redis/Celery/Arq where justified
    └── Pub/Sub

Database:

Docker PostgreSQL/PostGIS
    ↓
Cloud SQL

Compute:

Local workers
    ↓
Cloud Run / dedicated inference compute where required

Registry:

Local images
    ↓
Artifact Registry

Secrets:

Local environment
    ↓
GCP Secret Manager / Vault

---

# 27. Phase 6 — Data Engineering

Do not introduce Spark until the workload justifies distributed processing.

Preferred progression:

DuckDB
    ↓
Parquet
    ↓
Apache Arrow
    ↓
PySpark when distributed processing is required
    ↓
BigQuery

Potential analytical data:

- Raster metadata
- Processing runtime
- Risk score
- Elevation
- Slope
- Land cover
- Prediction confidence
- Uncertainty
- Model performance
- Report validation quality

---

# 28. Phase 7 — Dashboards

Operational and analytical dashboards may include:

- Uploads/day
- Processing duration
- Processing failures
- Storage usage
- Prediction distributions
- Risk-class distribution
- Mean uncertainty
- Percentile uncertainty
- High-risk area trends
- Model-version performance
- Report validation quality

---

# 29. Phase 8 — DevOps / Infrastructure / Observability

Target technologies:

- Terraform
- GitHub Actions
- Docker
- pytest
- Playwright
- k6 / Locust
- Ruff
- Trivy / Snyk
- OpenTelemetry
- Prometheus
- Grafana

CI/CD progression:

Lint
    ↓
Tests
    ↓
Security Scan
    ↓
Build
    ↓
Staging Validation
    ↓
Production Deployment

---

# 30. Phase 9 — Production Features

Future capabilities:

- Multi-user collaboration
- Organizations
- Workspaces
- RBAC
- PostgreSQL RLS
- Shared projects
- Raster versioning
- Audit logs
- Notifications
- API keys
- Gateway rate limiting
- Monitoring
- Alerting

These are future capabilities and must not be implemented prematurely.

---

# 31. Technology Stack

## Backend

- Python 3.12
- FastAPI
- SQLAlchemy
- Alembic

## Database

- PostgreSQL
- PostGIS
- pgvector

## Geospatial

- Rasterio
- GDAL
- NumPy
- GeoPandas
- Shapely
- PyProj

## Frontend

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- shadcn/ui

## GIS

- MapLibre GL JS

## Frontend Data / State

- TanStack Query
- Axios
- Zustand
- React Hook Form
- Zod

## Realtime

- SSE initially
- WebSockets only if bidirectional requirements emerge

## Processing

- GeoRisk processor framework
- Celery/Arq only when justified

## Queue / Cache

- Redis
- Celery/Arq
- Pub/Sub

## ML

- PyTorch
- SegFormer
- Entropy/UQ
- MC Dropout where justified
- TerraWatch

## LLM

- Hugging Face Transformers
- PEFT
- bitsandbytes
- LangChain/LlamaIndex where useful

## MLOps

- MLflow
- Evaluation harness

## Cloud

- Docker
- Google Cloud Storage
- Cloud SQL
- Cloud Run
- Pub/Sub
- Artifact Registry

## Data Engineering

- DuckDB
- Pandas
- Apache Arrow
- Parquet
- PySpark
- BigQuery

## DevOps

- Terraform
- GitHub Actions
- Ruff
- pytest
- Playwright
- Docker Compose

## Security

- OAuth2/OIDC
- Secret Manager/Vault
- Trivy/Snyk
- PostgreSQL RLS

## Observability

- OpenTelemetry
- Prometheus
- Grafana

---

# 32. Master Development Order

The implementation order is:

1. Finish Phase 2.3
   - Contour
   - Clip
   - Merge
   - Reproject

2. Harden Phase 2.2
   - Transaction rollback
   - Failure-state reliability
   - Idempotency

3. Phase 2.4
   - Thumbnail
   - PNG preview
   - Histogram
   - Quick metadata

4. Phase 2.5
   - Workspace
   - Upload
   - Raster list
   - Generated raster browsing
   - Job queue
   - Realtime progress

5. Phase 3
   - MapLibre
   - Tiles
   - AOI
   - Spatial queries
   - Geometry validation
   - Overlays

6. Phase 4A.1
   - SegFormer inference
   - Segmentation artifact

7. Phase 4A.2
   - Uncertainty engine
   - Uncertainty raster

8. Phase 4A.3
   - TerraWatch inference
   - Stage 1 dependency handling

9. Phase 4A.4
   - Combined risk + uncertainty analysis

10. Phase 4B.1
    - Validated uncertainty-aware LLM reports

11. Phase 4B.2
    - pgvector RAG

12. Phase 4B.3
    - Optional LoRA/QLoRA if evaluation justifies it

13. MLOps
    - MLflow
    - Evaluation
    - Inference deployment
    - Drift monitoring

14. Phase 5
    - Cloud storage
    - Cloud queue
    - Cloud database
    - Cache
    - Compute
    - Secrets

15. Phase 6
    - DuckDB
    - Parquet
    - Spark
    - BigQuery

16. Phase 7
    - Operational dashboards
    - Analytical dashboards

17. Phase 8
    - Terraform
    - CI/CD
    - Security
    - Observability
    - Load testing

18. Phase 9
    - Collaboration
    - RBAC
    - Audit
    - Rate limiting
    - Production hardening

---

# 33. Non-Negotiable Rules

1. The LLM is never the authoritative source for numerical risk.

2. TerraWatch must never consume incomplete SegFormer artifacts.

3. Material uncertainty must always be surfaced to users.

4. Business logic must not directly depend on infrastructure implementations.

5. Do not introduce Spark before the workload justifies it.

6. Do not introduce fine-tuning before evaluation justifies it.

7. Do not introduce cloud infrastructure before the local architecture is
   stable.

8. Every enum-backed raster/processor addition requires the appropriate
   database migration.

9. Failed transactions must not prevent FAILED job persistence.

10. AI results must be reproducible from model version, input artifacts and
    configuration.

11. Every generated raster must have provenance.

12. Every generated raster must have a clear parent/analysis relationship.

13. Never skip ahead in the roadmap unless explicitly instructed.

14. Never rewrite working architecture without a demonstrated reason.

15. Preserve existing abstraction boundaries.

16. Prefer isolated, testable changes.

17. Do not implement multiple unrelated changes in one development step.

---

# 34. Current Immediate Priority

CURRENT PHASE:

Phase 2.3 — Raster Derivatives

COMPLETED:

- Metadata
- Hillshade
- Slope
- Aspect
- Color Relief

NEXT:

Contour

THEN:

Clip
Merge
Reproject

AFTER THAT:

Phase 2.2 production hardening where still blocking
Phase 2.4 Raster Preview
Phase 2.5 Workspace
Phase 3 Interactive GIS
Phase 4A SegFormer + Uncertainty + TerraWatch
Phase 4B LLM Intelligence
Phase 5 Cloud
Phase 6 Data Engineering
Phase 7 Dashboards
Phase 8 DevOps
Phase 9 Production Features

---

# 35. How AI Coding Agents Must Work

All AI coding agents working on GeoRisk AI must:

1. Read this document before making architectural decisions.
2. Inspect the actual repository before assuming an implementation exists.
3. Treat the repository as the implementation source of truth.
4. Treat this document as the architectural/project-state source of truth.
5. Never assume planned features are already implemented.
6. Never skip roadmap phases without explicit instruction.
7. Work incrementally.
8. Modify only the required file(s) for the current isolated task.
9. Run the appropriate compile/test command.
10. Report the result.
11. Stop and wait for confirmation before continuing.

When implementing a software step, use this response structure:

🎯 Goal

📁 File

✏️ Code

✅ Compile/Test

⛔ Stop

💡 Improvement

---

# 36. Source of Truth Hierarchy

When information conflicts, use this priority:

1. Actual repository implementation
2. Database/schema/migrations
3. Current tests and verified runtime behavior
4. GEO_RISK_PROJECT_CONTEXT.md
5. Master Project Plan
6. AI assumptions

Never invent implementation status.

If the documentation and repository disagree:

- Inspect the repository.
- Verify the actual state.
- Update the documentation after confirmation.

---

# 37. Project Vision

The final GeoRisk AI platform should allow a user to:

1. Create a project.
2. Define an AOI.
3. Upload geospatial raster data.
4. Validate and inspect the data.
5. Run geospatial preprocessing.
6. Visualize the data in an interactive GIS.
7. Run SegFormer segmentation.
8. Generate pixel-wise uncertainty.
9. Run TerraWatch risk analysis.
10. Generate risk score and hazard maps.
11. Inspect risk and uncertainty metrics.
12. Generate a validated natural-language report.
13. Query project history through RAG.
14. Track model versions and provenance.
15. Analyze operational and model metrics.
16. Eventually operate the system in a cloud-native environment.

The ultimate architecture is:

Raster / AOI
    ↓
Validation + Metadata
    ↓
Geospatial Processing
    ↓
Interactive GIS
    ↓
SegFormer
    ↓
Segmentation + Uncertainty
    ↓
TerraWatch
    ↓
Risk + Hazard Maps
    ↓
Structured Risk + Uncertainty
    ↓
Validated LLM Report
    ↓
MapLibre + Analytics
    ↓
Cloud + Data Engineering

---

# 38. Immediate Next Action

Do NOT start Phase 3.

Do NOT start SegFormer.

Do NOT start TerraWatch.

Do NOT introduce cloud infrastructure.

The immediate implementation target is:

Phase 2.3 — Contour Processor.