# GeoRisk AI — Technical Architecture

> Technical architecture reference for GeoRisk AI.
>
> This document describes system boundaries, layers, dependencies,
> abstractions, processing architecture, geospatial architecture and
> future AI/cloud architecture.
>
> It complements:
>
> `docs/GEO_RISK_PROJECT_CONTEXT.md`
>
> The project context document defines current state and roadmap.
> This document defines how the system is designed.

---

# 1. Architectural Vision

GeoRisk AI is designed as a layered geospatial intelligence platform.

The primary architecture is:

Frontend
    ↓
FastAPI API
    ↓
Application Services
    ↓
Repositories
    ↓
PostgreSQL + PostGIS

with processing and inference workers operating through explicit
processing and infrastructure abstractions.

The target logical architecture is:

                         ┌─────────────────────────┐
                         │       Next.js UI        │
                         └────────────┬────────────┘
                                      │
                                  HTTPS/REST
                                      │
                         ┌────────────▼────────────┐
                         │       FastAPI API        │
                         └────────────┬────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
       Project Service          Raster Service        Processing Service
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                              Repository Layer
                                      │
                   ┌──────────────────┼──────────────────┐
                   │                  │                  │
                   ▼                  ▼                  ▼
              PostgreSQL          Storage             Queue
               + PostGIS          Service             Service
                   │                  │                  │
                   └──────────────────┼──────────────────┘
                                      │
                              Worker Layer
                                      │
                  ┌───────────────────┼───────────────────┐
                  │                   │                   │
                  ▼                   ▼                   ▼
             Raster Workers     AI/Inference        Future ETL
                                  Workers             Workers

---

# 2. Architectural Layers

GeoRisk follows a layered architecture.

## 2.1 API Layer

Location:

```text
backend/src/app/api/
````

Responsibilities:

* HTTP routing
* Authentication dependencies
* Request validation
* Response serialization
* API-level authorization
* Mapping HTTP requests to application services

The API layer must not contain core business logic.

Routers should delegate to services.

---

# 2.2 Service Layer

Location:

```text
backend/src/app/services/
```

Responsibilities:

* Application use cases
* Business orchestration
* Authorization coordination
* Processing orchestration
* Repository interaction
* Transaction boundaries where appropriate

Services should not implement low-level storage or raster algorithms.

Examples:

```text
ProjectService
RasterService
ProcessingService
ProcessingJobTracker
```

---

# 2.3 Repository Layer

Location:

```text
backend/src/app/repositories/
```

Responsibilities:

* Persistence
* Database queries
* Entity creation/update/delete
* Database-specific query logic

Repositories abstract SQLAlchemy/database access from services.

Services should not directly construct database queries when a repository
exists for the required operation.

---

# 2.4 Domain / Model Layer

Location:

```text
backend/src/app/models/
```

Responsibilities:

* Persistent domain entities
* Enumerations
* Relationships
* Database-backed state

Examples:

```text
User
Project
AOI
Raster
ProcessingJob
```

The model layer should represent domain state rather than application
workflow logic.

---

# 2.5 Schema Layer

Location:

```text
backend/src/app/schemas/
```

Responsibilities:

* API request models
* API response models
* Serialization
* Input validation

Pydantic schemas should not be confused with SQLAlchemy persistence
models.

---

# 2.6 Processing Layer

Location:

```text
backend/src/app/processing/
```

Responsibilities:

* Processor abstraction
* Processor registry
* Processing context
* Processing manager
* Processing results
* Processor execution
* Job-aware execution

The processing layer is intentionally independent from individual raster
algorithms.

---

# 2.7 Raster Layer

Location:

```text
backend/src/app/raster/
```

Responsibilities:

* Raster I/O
* Raster metadata
* Raster processing algorithms
* Terrain operations
* Raster-specific utilities

Examples:

```text
rasterio
GDAL
NumPy
PyProj
```

Raster algorithms must remain isolated from API concerns.

---

# 2.8 Storage Layer

Location:

```text
backend/src/app/storage/
```

Responsibilities:

* File/object persistence
* Path resolution
* Storage abstraction
* Object lifecycle

Current implementation:

```text
LocalStorage
```

Future implementations:

```text
GCSStorage
S3Storage
```

The application and processing layers should depend on the storage
abstraction rather than directly on filesystem or cloud SDKs.

---

# 2.9 Queue Layer

Location:

```text
backend/src/app/queue/
```

Responsibilities:

* Job dispatch
* Asynchronous execution abstraction
* Queue message handling

Current architecture may use local execution.

Future implementations may include:

```text
Redis/Celery
Arq
Google Pub/Sub
```

Queue-specific implementation must remain outside core business logic.

---

# 3. Dependency Direction

The preferred dependency direction is:

```text
API
 ↓
Services
 ↓
Repositories / Domain abstractions
 ↓
Infrastructure
```

Processing follows:

```text
API
 ↓
Processing Service
 ↓
Processing Manager
 ↓
Processor
 ↓
Raster / Storage abstractions
```

Infrastructure must not force dependencies upward into the application layer.

For example:

```text
ProcessingService
    ↓
StorageService
```

is preferred over:

```text
ProcessingService
    ↓
GCS SDK
```

---

# 4. Processing Architecture

GeoRisk's processing framework is designed around processors rather than
hard-coded service methods.

Core components:

```text
Processor
ProcessingContext
ProcessingResult
GeneratedRaster
ProcessorRegistry
ProcessingManager
Executor
```

Conceptually:

```text
Processing Request
        ↓
Processing Service
        ↓
Processing Context
        ↓
Processing Manager
        ↓
Processor Registry
        ↓
Selected Processor
        ↓
Raster Algorithm
        ↓
GeneratedRaster
        ↓
ProcessingResult
        ↓
Raster Persistence
        ↓
Processing Job Completion
```

---

# 5. Processor Abstraction

Every raster operation should be represented by a processor.

Examples:

```text
MetadataProcessor
HillshadeProcessor
SlopeProcessor
AspectProcessor
ColorReliefProcessor
ContourProcessor
ClipProcessor
MergeProcessor
ReprojectProcessor
```

A processor is responsible for:

* Parameter validation
* Calling the appropriate raster operation
* Generating outputs
* Returning standardized results
* Reporting progress
* Producing metadata
* Preserving provenance

Processors must not directly manipulate HTTP requests.

---

# 6. Processing Context

`ProcessingContext` provides a processor with the information required to
execute.

Conceptually it contains:

```text
processor
project_id
raster
current_user
parameters
input_path
working_directory
output_directory
storage
job_id
job_repository
progress_callback
```

This keeps processors independent from API request objects.

---

# 7. Processing Result

Every processor returns a standardized `ProcessingResult`.

Conceptually:

```text
ProcessingResult
├── status
├── outputs
├── metadata
├── warnings
├── logs
├── execution_time
├── processor
├── processor_version
└── parameters
```

Generated raster outputs are represented using `GeneratedRaster`.

This ensures downstream persistence is independent of the individual
processor implementation.

---

# 8. Generated Raster Architecture

A processor should not directly create the final database Raster model.

Instead:

```text
Processor
    ↓
GeneratedRaster
    ↓
RasterFactory
    ↓
Raster model
    ↓
RasterRepository
```

This separation keeps processor output representation independent from
database persistence.

---

# 9. Raster Provenance

Generated rasters must preserve:

```text
parent_raster_id
processor
processor_version
processing_parameters
file_path
metadata
```

Conceptually:

```text
Input Raster
     │
     ├── Hillshade
     │
     ├── Slope
     │
     ├── Aspect
     │
     ├── Color Relief
     │
     └── Future Derived Raster
```

This forms a raster lineage graph.

The lineage should make it possible to answer:

* Which raster produced this output?
* Which processor generated it?
* Which version was used?
* Which parameters were used?
* Where is the output stored?

---

# 10. Processing Job Architecture

Processing jobs represent execution state independently from the processor
itself.

Conceptually:

```text
ProcessingJob
├── id
├── raster_id
├── processor
├── status
├── progress
├── processor_version
├── parameters
├── executor
├── message
├── started_at
├── finished_at
├── cancel_requested_at
├── created_at
└── updated_at
```

Supported lifecycle:

```text
PENDING
   ↓
QUEUED
   ↓
RUNNING
   ├───────────────┐
   ↓               ↓
COMPLETED      CANCELLING
                   ↓
               CANCELLED

RUNNING
   ↓
FAILED
```

Invalid state transitions must be rejected.

---

# 11. Processing Job Tracker

`ProcessingJobTracker` centralizes lifecycle state transitions.

Responsibilities:

* Create job
* Queue job
* Start job
* Update progress
* Complete job
* Fail job
* Request cancellation
* Mark cancelled

This prevents different services and workers from implementing inconsistent
job-state behavior.

---

# 12. Transaction Reliability

A critical invariant is:

```text
Processing failure
        ↓
Rollback failed transaction
        ↓
Persist FAILED state
```

Never:

```text
Database error
        ↓
Failed SQLAlchemy transaction
        ↓
Attempt another commit
        ↓
PendingRollbackError
        ↓
Job remains RUNNING
```

Any implementation that persists failure state after a failed database
transaction must first restore a valid transaction state.

This is a production reliability requirement.

---

# 13. Cancellation Architecture

Cancellation is cooperative.

Conceptually:

```text
User
 ↓
Cancel API
 ↓
ProcessingJobTracker
 ↓
cancel_requested_at
 ↓
RUNNING → CANCELLING
 ↓
Worker observes cancellation
 ↓
Processor stops safely
 ↓
CANCELLED
```

A processor should not assume that cancellation can always terminate
arbitrary native raster operations immediately.

Cancellation should therefore be implemented at safe execution boundaries.

---

# 14. Storage Architecture

Storage is abstracted behind a service/interface.

Current:

```text
StorageService
    ↓
LocalStorage
```

Future:

```text
StorageService
    ├── LocalStorage
    ├── GCSStorage
    └── S3Storage
```

Application code should work with:

```text
logical storage path
```

rather than hard-coded filesystem paths.

---

# 15. Storage Path Architecture

Logical paths should identify the resource without coupling application
logic to the physical storage provider.

Example:

```text
projects/{project_id}/rasters/{uuid}.tif
```

Generated outputs:

```text
projects/{project_id}/generated/{processor}/{uuid}.tif
```

Temporary files:

```text
projects/{project_id}/temp/
```

The storage implementation resolves logical paths into physical locations.

---

# 16. Geospatial Data Architecture

GeoRisk uses different systems for different responsibilities.

## PostgreSQL + PostGIS

Used for:

* Project geometry
* AOIs
* Spatial metadata
* Spatial queries
* Geometry relationships

## Raster/Object Storage

Used for:

* GeoTIFF files
* Raster outputs
* Preview images
* Large geospatial artifacts

The database should not store large raster binary content directly.

---

# 17. Raster Processing Architecture

The raster processing stack is:

```text
Rasterio
    ↓
GDAL
    ↓
NumPy
```

with:

```text
GeoPandas
Shapely
PyProj
```

for vector and CRS operations.

Raster algorithms remain inside:

```text
app/raster/
```

and are invoked through processors.

---

# 18. Phase 3 GIS Architecture

Phase 3 introduces interactive GIS.

Conceptually:

```text
MapLibre
    ↓
FastAPI
    ↓
GIS Services
    ↓
PostGIS / Raster Storage
```

Capabilities:

* Raster tiles
* Vector/GeoJSON layers
* AOI drawing
* AOI editing
* Spatial queries
* Geometry validation
* Raster clipping
* Coordinate inspection

---

# 19. Tile Architecture

Raster tiles should be generated or served through a dedicated tile
interface.

Conceptually:

```text
MapLibre
    ↓
Tile API
    ↓
Tile Service
    ↓
Raster Storage
```

Caching may later be introduced:

```text
MapLibre
    ↓
Tile API
    ↓
Redis Cache
    ↓
Tile Service
    ↓
Raster Storage
```

Redis should only be introduced when performance requirements justify it.

---

# 20. AOI Architecture

AOIs are spatial domain objects.

Conceptually:

```text
Project
 ├── AOI
 │    ├── Geometry
 │    ├── CRS
 │    └── Metadata
 │
 └── Raster
      └── Derived Raster
```

AOI workflows should support:

* Geometry validation
* CRS normalization
* Intersection checks
* Raster clipping
* Spatial filtering

---

# 21. AI Architecture

The AI system is a cascaded pipeline.

```text
Input Raster
     │
     ▼
SegFormer
     │
     ├── Segmentation Mask
     │
     └── Uncertainty Raster
             │
             ▼
        TerraWatch
             │
             ├── Risk Score Raster
             │
             └── Hazard Maps
                     │
                     ▼
             Structured Metrics
                     │
                     ▼
                LLM Layer
```

The LLM is downstream of authoritative model outputs.

---

# 22. SegFormer Architecture

SegFormer is responsible for semantic segmentation.

Inputs may include:

* Satellite imagery
* Geospatial imagery prepared for model input

Outputs:

```text
Segmentation Mask
Uncertainty Raster
```

Model metadata must include:

* Model version
* Preprocessing configuration
* Dataset/version
* Inference configuration
* UQ configuration

---

# 23. Uncertainty Architecture

Uncertainty is a first-class output.

Potential methods:

```text
Probability Entropy
Margin Sampling
MC Dropout
Ensembles
```

Entropy:

```text
H(p) = -Σ pᵢ log(pᵢ)
```

The final normalized uncertainty representation should be:

```text
0.0 = high confidence
1.0 = high uncertainty
```

The exact normalization must be explicitly documented and tested.

---

# 24. TerraWatch Architecture

TerraWatch is an independent risk-analysis stage.

Conceptually:

```text
Raw Geospatial Inputs
        +
SegFormer Features
        +
Terrain Features
        +
Optional Uncertainty
        ↓
TerraWatch
        ↓
Risk Score
        +
Hazard Classification
```

Potential inputs include:

* DEM
* Slope
* Rainfall/weather
* Satellite imagery
* SegFormer segmentation
* Uncertainty

TerraWatch must not directly depend on the LLM.

---

# 25. AI Artifact Dependency

The AI pipeline must preserve explicit artifact dependencies.

Example:

```text
Analysis Run #42

Inputs
├── DEM Raster #2
└── Satellite Raster #8

Stage 1
├── Segmentation Raster #31
└── Uncertainty Raster #32

Stage 2
├── Risk Score Raster #33
└── Hazard Map Raster #34

Structured Metrics
└── Analysis Metrics #42
```

This makes the analysis reproducible.

---

# 26. AI Model Registry

MLflow is the target model registry.

Models:

```text
segformer-uncertainty
terrawatch-risk
llm-report-adapter
```

The LLM adapter only exists if fine-tuning is actually introduced.

Every deployed model must have a version.

---

# 27. LLM Architecture

The LLM consumes structured authoritative context.

```text
GIS Metrics
     +
SegFormer Metrics
     +
Uncertainty Metrics
     +
TerraWatch Metrics
     +
Project Context
     ↓
Retrieval / Context Assembly
     ↓
LLM
     ↓
Generated Report
     ↓
Validation
     ↓
Approved Report
```

The LLM cannot become the source of numerical truth.

---

# 28. LLM Validation Boundary

The report validation layer must compare generated claims against
structured system data.

For example:

```text
Generated:
Risk = 0.87

Authoritative:
Risk = 0.87

→ Valid
```

But:

```text
Generated:
Risk = 0.92

Authoritative:
Risk = 0.87

→ Invalid
```

The same principle applies to:

* Risk class
* Uncertainty
* Area
* Elevation
* Slope
* Coordinates
* Model outputs

---

# 29. RAG Architecture

Future RAG:

```text
PostgreSQL
    +
pgvector
    ↓
Embedding / Retrieval
    ↓
Relevant Project Context
    ↓
LLM
```

Potential sources:

* Reports
* AOI metadata
* Processing history
* Analysis summaries
* Approved project documents

RAG should retrieve authoritative information before generation.

---

# 30. Cloud Architecture

The cloud architecture should preserve current abstractions.

Target:

```text
Next.js
    ↓
Cloud Run / API
    ↓
Application Services
    ↓
Cloud SQL
    +
GCS
    +
Pub/Sub
    +
Workers
```

Potential infrastructure:

```text
Cloud Run
Cloud SQL
Cloud Storage
Pub/Sub
Artifact Registry
Secret Manager
VPC
```

Cloud implementations should replace local implementations rather than
rewrite business logic.

---

# 31. Queue Architecture

Current:

```text
LocalExecutor
```

Future:

```text
QueueService
    ├── Local
    ├── Redis/Celery/Arq
    └── Pub/Sub
```

The queue abstraction should allow processing services to remain unaware
of the underlying queue technology.

---

# 32. Data Engineering Architecture

Initial analytical workflow:

```text
PostgreSQL / Raster Metadata
        ↓
DuckDB
        ↓
Parquet
```

Distributed future workflow:

```text
Cloud Storage
        ↓
PySpark
        ↓
Transformation
        ↓
Parquet
        ↓
BigQuery
```

Spark should only be introduced when data volume or processing requirements
justify distributed execution.

---

# 33. Analytics Architecture

Operational database:

```text
PostgreSQL + PostGIS
```

Analytical warehouse:

```text
BigQuery
```

Potential metrics:

* Raster uploads
* Processing runtime
* Processing failures
* Risk scores
* Uncertainty
* Elevation
* Slope
* Land cover
* Model performance
* Report validation

---

# 34. Observability Architecture

Target:

```text
Application
    ↓
OpenTelemetry
    ↓
Metrics / Traces / Logs
    ↓
Prometheus
    +
Grafana
```

Important metrics:

```text
Processing duration
Processing failures
Queue latency
Worker utilization
Raster processing throughput
Inference latency
Model errors
Prediction distribution
Uncertainty distribution
LLM validation failures
```

---

# 35. Security Architecture

Security boundaries include:

```text
Authentication
    ↓
Authorization
    ↓
Project ownership
    ↓
Raster access
    ↓
Processing authorization
```

Future production security:

* OAuth2/OIDC
* RBAC
* PostgreSQL RLS
* Secret Manager
* Signed object-storage URLs
* Rate limiting
* API keys
* Dependency scanning
* Container scanning

---

# 36. Frontend Architecture

Target frontend:

```text
Next.js
    ↓
Pages / Routes
    ↓
UI Components
    ↓
TanStack Query
    ↓
Axios API Client
    ↓
FastAPI
```

State separation:

```text
Server state
    ↓
TanStack Query

Local UI state
    ↓
Zustand

Form state
    ↓
React Hook Form + Zod
```

GIS state should remain isolated from unrelated application state.

---

# 37. Frontend GIS Architecture

Target:

```text
MapLibre
    ↓
Layer Manager
    ├── Base Layers
    ├── Raster Layers
    ├── Vector Layers
    ├── AOI Layers
    ├── Segmentation
    ├── Uncertainty
    └── Risk
```

The map should not contain business logic for processing.

Processing remains a backend responsibility.

---

# 38. API Architecture

The API should expose resources and operations rather than internal
implementation details.

Examples:

```text
/api/v1/projects
/api/v1/projects/{project_id}/rasters
/api/v1/processing/jobs
/api/v1/processing/jobs/{job_id}
/api/v1/tiles/...
```

API routes should delegate to services.

---

# 39. Database Migration Rules

Any database schema or enum change requires an Alembic migration.

This includes:

* New columns
* New tables
* New enums
* New enum values
* Indexes
* Constraints
* Relationships

Application enum changes must remain synchronized with PostgreSQL enum types.

Example:

```text
Python RasterType
        ↕
PostgreSQL rastertype
```

They must not diverge.

---

# 40. Testing Architecture

Testing should exist at multiple levels.

## Unit Tests

Test:

* Raster algorithms
* Processor logic
* Validation
* Factories
* State transitions

## Integration Tests

Test:

* Database repositories
* Services
* Storage
* Processing manager
* Processor registry

## API Tests

Test:

* Authentication
* Raster endpoints
* Processing endpoints
* Job polling
* Cancellation

## End-to-End Tests

Test:

```text
API request
    ↓
Processing Job
    ↓
Processor
    ↓
Generated Raster
    ↓
Database persistence
    ↓
Job completion
```

---

# 41. Performance Architecture

Performance optimizations must be evidence-driven.

Potential optimizations:

* Raster tiling
* Compression
* Chunked I/O
* Windowed raster reads
* Caching
* Connection pooling
* PgBouncer
* Tile caching
* Parallel workers
* Distributed processing

Do not introduce these solely because they are common technologies.

---

# 42. Scalability Architecture

The platform should scale along independent dimensions.

## API Scaling

```text
Multiple FastAPI instances
```

## Worker Scaling

```text
Multiple processing workers
```

## Storage Scaling

```text
Local
→
Object Storage
```

## Queue Scaling

```text
Local
→
Distributed Queue
```

## Database Scaling

```text
PostgreSQL
→
Cloud SQL
→
Read replicas / optimized infrastructure when required
```

## Analytics Scaling

```text
DuckDB
→
Spark
→
BigQuery
```

---

# 43. Architectural Boundaries

The following boundaries must remain explicit:

```text
API
≠
Business Logic

Business Logic
≠
Database Queries

Processors
≠
HTTP

Processors
≠
Cloud SDKs

LLM
≠
Risk Calculation

TerraWatch
≠
LLM

SegFormer
≠
TerraWatch Implementation

Operational Database
≠
Analytical Warehouse
```

These boundaries are fundamental to maintainability.

---

# 44. Future Distributed AI Pipeline

When distributed execution becomes necessary:

```text
API
 ↓
Processing Service
 ↓
Queue
 ↓
SegFormer Worker
 ↓
Artifact Persistence
 ↓
TerraWatch Worker
 ↓
Artifact Persistence
 ↓
Metrics
 ↓
LLM Worker
 ↓
Report Validation
```

The business flow should remain unchanged even if the infrastructure changes.

---

# 45. Target End-to-End Architecture

The complete target system is:

```text
                         USER
                           │
                           ▼
                    ┌─────────────┐
                    │  Next.js    │
                    │  MapLibre   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   FastAPI   │
                    └──────┬──────┘
                           │
            ┌──────────────┼───────────────┐
            │              │               │
            ▼              ▼               ▼
       Project         Raster         Processing
       Service        Service          Service
            │              │               │
            └──────────────┼───────────────┘
                           │
                    ┌──────▼──────┐
                    │ Repositories│
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          PostgreSQL    Storage       Queue
          + PostGIS     Service       Service
                           │            │
                           └─────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │   Workers   │
                          └──────┬──────┘
                                 │
                  ┌──────────────┼──────────────┐
                  │              │              │
                  ▼              ▼              ▼
              Raster         SegFormer      TerraWatch
              Workers          + UQ            Risk
                  │              │              │
                  └──────────────┼──────────────┘
                                 │
                          Structured Metrics
                                 │
                                 ▼
                              LLM
                                 │
                                 ▼
                         Report Validation
                                 │
                                 ▼
                           Final Report
```

---

# 46. Architectural Decision Principles

When choosing between technologies or designs:

1. Prefer simplicity.
2. Preserve abstraction boundaries.
3. Prefer proven technology.
4. Introduce infrastructure only when required.
5. Keep business logic portable.
6. Prefer explicit provenance.
7. Prefer reproducibility.
8. Prefer testability.
9. Prefer observable workflows.
10. Optimize only after measuring.

---

# 47. AI Coding Agent Rules

Any AI coding agent working on GeoRisk AI must:

* Read `GEO_RISK_PROJECT_CONTEXT.md`.
* Read this architecture document before making architectural changes.
* Inspect the actual repository.
* Never assume planned architecture is already implemented.
* Preserve established abstractions.
* Avoid unnecessary rewrites.
* Make isolated changes.
* Test every implementation step.
* Update documentation when architecture materially changes.

When repository implementation and documentation disagree:

1. Inspect the actual implementation.
2. Verify runtime behavior.
3. Determine the correct architecture.
4. Update the documentation.
5. Continue only after the state is clear.

---

# 48. Implementation Status & Architectural Priority

Implementation status and priorities are dynamically determined from the
**Milestone Completion Matrix** in [`docs/GEO_RISK_PROJECT_CONTEXT.md`](GEO_RISK_PROJECT_CONTEXT.md).

> **Source of Truth Rule:**
> Implementation status is determined from the repository's actual source code,
> tests, migrations, and deployment configuration. The roadmap describes intended
> ordering, but must not be treated as evidence that a feature is implemented.

### Roadmap Progression

```text
Phase 1: Core Platform (Complete)
    ↓
Phase 2.1–2.3: Processing Engine & All 9 Raster Processors (Complete)
    ↓
Phase 2.4: Raster Preview & Statistics (Complete; Path Resolution Hardening)
    ↓
Phase 2.5: Next.js Workspace Shell (Complete; Route Aliasing Hardening)
    ↓
Phase 3: Interactive GIS & MapLibre Tile Viewer (In Progress)
    ↓
Phase 4A: SegFormer + Uncertainty + TerraWatch Cascaded AI (Planned)
    ↓
Phase 4B: Validated Uncertainty-Aware LLM Reporting & RAG (Planned)
    ↓
Phases 5–9: Cloud Scaling, Data Engineering, Observability & Enterprise
```

The AI pipeline (Phase 4A/4B) must not be implemented before the geospatial
and interactive GIS foundation is complete and verified.

---

# 49. Final Architectural Invariant

GeoRisk AI must remain:

```text
Modular
Observable
Testable
Reproducible
Infrastructure-independent
Geospatially correct
Uncertainty-aware
AI-assisted
Scalable
```

The platform should be able to evolve from:

```text
Local Development
```

to:

```text
Cloud Production
```

without rewriting the core application architecture.

