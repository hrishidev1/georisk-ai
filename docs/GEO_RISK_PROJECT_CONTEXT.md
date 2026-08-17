# GeoRisk AI — Master Project Context & Implementation Reference

> Canonical operational context for all AI coding agents, software engineers, and GIS specialists.
>
> Master strategic plan: `GeoRisk_AI_Master_Project_Plan_Production_AI_GIS.docx`
>
> This document describes the verified implementation state, architectural principles, roadmap, deployment topology, and immediate development priorities.

---

# 1. Source of Truth & Implementation Status Rule

> [!IMPORTANT]
> **Canonical Source of Truth Rule:**
> Implementation status is determined exclusively from the repository's actual source code, tests, migrations, and deployment configuration. The roadmap describes intended ordering, but must never be treated as evidence that a feature is implemented.

1. **No Fixed Phase Declarations**: Never hardcode a static statement such as "Current implementation phase: Phase X" that becomes stale as development progresses.
2. **Dynamic Derivation**: Implementation status is derived directly from the **Milestone Completion Matrix** (Section 5) and the verified codebase.
3. **Verification Before Action**: Before designing or modifying code, inspect the actual codebase, database schema, and test suite. Do not assume planned features exist or that completed features are missing.

---

# 2. Project Overview & Identity

GeoRisk AI is a production-oriented geospatial intelligence platform combining:

- Backend engineering (FastAPI, SQLAlchemy 2.0 async/sync patterns, Pydantic v2)
- Geospatial processing engine (GDAL, Rasterio, Shapely, PyProj, GeoPandas, rio-tiler)
- Interactive GIS (Next.js 15, React 19, MapLibre GL JS, XYZ tile streaming)
- Computer vision & uncertainty quantification (SegFormer, Evidential Deep Learning, UQ Engine)
- Hazard/risk analysis (TerraWatch risk engine, landslide & terrain hazard modeling)
- LLM intelligence & reporting (Uncertainty-aware validated reporting, pgvector RAG)
- MLOps & cloud infrastructure (MLflow, PostgreSQL/PostGIS, Docker, Cloud-ready adapters)

The platform enables users to organize study regions, manage vector boundaries, catalog and validate GeoTIFF rasters, run high-performance terrain derivative algorithms, visualize raster tile overlays, execute AI hazard segmentation, and generate validated analytical risk reports.

---

# 3. Canonical Architecture

```
Frontend (Next.js 15 + React 19 + MapLibre GL)
    ↓  [REST / JSON / Multipart / XYZ Tiles / Bearer JWT]
FastAPI Application Layer (v0.1.0)
    ↓
Application Services Layer
    ├── ProjectService
    ├── AOIService
    ├── RasterService
    ├── ProcessingService
    ├── ProjectAccessService
    └── StorageService / QueueService Abstractions
    ↓
Repository Layer (Clean Data Access)
    ├── ProjectRepository
    ├── AOIRepository
    ├── RasterRepository
    ├── VectorLayerRepository
    └── ProcessingJobRepository
    ↓
Database & Physical Persistence
    ├── PostgreSQL + PostGIS (Neon Cloud / Local Docker)
    ├── Pluggable Storage (LocalStorage / GCS / S3)
    └── Pluggable Queue (LocalExecutor / PubSub / Celery / Arq)
    ↓
Processing & Inference Workers
    ├── Raster Derivative Processors (Hillshade, Slope, Aspect, Color Relief, Contour, Clip, Merge, Reproject)
    ├── SegFormer CV Inference + UQ Engine (Planned Phase 4A)
    ├── TerraWatch Risk Analysis Engine (Planned Phase 4A)
    └── Validated LLM Intelligence Layer (Planned Phase 4B)
```

---

# 4. Verified Implemented Capabilities

The following capabilities are verified present in the repository source code:

### Core Platform & Data Management
- **JWT Authentication & User Management**: Secure user registration, password hashing via bcrypt, JWT token creation/verification, route authorization dependencies (`/api/v1/auth/*`).
- **Project Workspaces**: Full CRUD on project entities with ownership isolation and PostGIS cascade relationships (`/api/v1/projects/*`).
- **Area of Interest (AOI) Management**: Spatial geometry storage, validation, GeoJSON conversion, PostGIS spatial queries (`/api/v1/projects/{id}/aois/*`).
- **Raster Management & Validation**: Multipart GeoTIFF upload, format validation via Rasterio, spatial metadata extraction (CRS, resolution, bounds, pixel sizes, band counts) (`/api/v1/projects/{id}/rasters/*`).
- **Raster Lineage & Provenance**: Parent-child lineage tracking in database (`raster_lineage` table and `parent_raster_id` foreign keys) recording processor name, version, and parameters.

### Geospatial Processing Engine
- **Processing Framework**: Modular `Processor` abstraction, `ProcessingContext`, `ProcessingResult`, `GeneratedRaster`, `ProcessorRegistry`, and `ProcessingManager`.
- **Job Lifecycle Tracking**: Persistence of `ProcessingJob` with lifecycle states (`PENDING`, `QUEUED`, `RUNNING`, `CANCELLING`, `COMPLETED`, `FAILED`, `CANCELLED`), progress tracking, and execution metadata.
- **Nine Raster Processors Registered & Verified**:
  1. `MetadataProcessor`: Geospatial metadata extraction.
  2. `HillshadeProcessor`: Analytical hillshade relief generation.
  3. `SlopeProcessor`: Terrain slope calculation (degrees/percent).
  4. `AspectProcessor`: Terrain aspect calculation (degrees from North).
  5. `ColorReliefProcessor`: Multi-band color relief ramp visualization.
  6. `ContourProcessor`: Vector contour line/polygon extraction.
  7. `ClipProcessor`: Raster clipping to vector AOI geometries.
  8. `MergeProcessor`: Multi-raster mosaic and compositing.
  9. `ReprojectProcessor`: Coordinate reference system reprojection.

### Visualization, Tile Streaming & Interactive GIS (Phase 3 Complete)
- **Interactive GIS Workspace**: Full-canvas MapLibre GL workspace (`/projects/[projectId]/map`) with layer management, basemap switcher (Carto Positron, Dark Matter, Voyager), contextual toolbars, and responsive overlays.
- **Raster Tile Streaming & Sampling**: Dynamic XYZ tile streaming (`/tiles/{z}/{x}/{y}.png`), TileJSON 2.2.0 metadata (`/tilejson.json`), and coordinate point sampling (`/projects/{id}/rasters/{id}/point?lon={lon}&lat={lat}`) using `rio-tiler`.
- **Raster Preview & Statistics**: In-memory downsampled PNG preview generation, thumbnail creation, band min/max/mean/std calculation, and histogram computation (`RasterPreview`) with resolved storage paths.
- **Vector AOI Management & Editing**: On-canvas polygon drawing, rubber-band preview, draggable vertex modification, geodesic area calculation (ha / km² / m²), and PostGIS EPSG:4326 persistence.
- **Geodesic Measurement & Inspection HUD**: High-precision Haversine distance and spherical polygon excess calculations, live cursor coordinates with click-to-copy, and on-map pixel value sampling HUD.
- **Next.js 15 Web Workspace**:
  - Projects Hub & Repository feed (`/dashboard`)
  - Workspace Overview (`/projects/[projectId]`)
  - Interactive GIS & AOIs (`/projects/[projectId]/map`)
  - Raster Imagery Catalog & Fixed Multipart Upload (`/projects/[projectId]/rasters`)
  - Processing Jobs Console & Task submission (`/projects/[projectId]/processing`)
  - Project Settings & Configuration (`/projects/[projectId]/settings`)
  - Route alias at `/projects` redirecting to `/dashboard`

---

# 5. Phase & Milestone Completion Matrix

| Milestone | Scope & Capabilities | Status | Verified Repository Implementation | Notes / Hardening Items |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Core Platform** | Users, Projects, AOIs, Raster CRUD, Storage Abstraction, PostGIS DB, Auth | **COMPLETE** | `backend/src/app/models/`, `routers/`, `services/`, `repositories/`, `storage/` | Fully functional in local and production environments. |
| **Phase 2.1: Processing Framework** | Processor base, Context, Results, Registry, Manager, LocalExecutor | **COMPLETE** | `backend/src/app/processing/` | Core abstraction extensible for any GDAL/Rasterio algorithm. |
| **Phase 2.2: Processing Jobs** | Job persistence, tracker, lifecycle states, cancel support, job APIs | **COMPLETE** | `ProcessingJobTracker`, `ProcessingJobRepository`, `routers/processing.py` | Hardening item: transaction rollback before persisting FAILED state. |
| **Phase 2.3: Raster Derivatives** | Hillshade, Slope, Aspect, Color Relief, Contour, Clip, Merge, Reproject | **COMPLETE** | All 9 processors in `processors/`, registered in `factory.py` | Multi-input lineage supported via `raster_lineage` table. |
| **Phase 2.4: Raster Preview & Stats** | Downsampled PNG previews, thumbnails, band statistics & histograms | **COMPLETE** | `RasterPreview` in `app/raster/preview.py`, endpoints in `routers/raster.py` | Path resolution with `resolve_path` implemented. |
| **Phase 2.5: Workspace UI** | Projects Hub, Workspace dashboard, Raster catalog, Processing panel | **COMPLETE** | Next.js routes under `frontend/src/app/(app)/` | Breadcrumb alias at `/projects` implemented. |
| **Phase 3: Interactive GIS** | Full GIS workspace, XYZ tiles, point sampling, AOI drawing/editing/delete, measurement, basemaps | **COMPLETE** | `frontend/src/components/gis/`, `/map/page.tsx`, `point` API in `raster.py`, `rio-tiler` Reader | End-to-end interactive geospatial intelligence workspace complete. |
| **Phase 4A.1: SegFormer** | Vision Transformer semantic segmentation, mask generation, provenance | **NOT STARTED** | Planned | Research basis established; next phase in roadmap. |
| **Phase 4A.2: Uncertainty Engine** | Pixel-wise UQ raster (0.0=confident, 1.0=uncertain), entropy/margin | **NOT STARTED** | Planned | Authoritative analytical raster output. |
| **Phase 4A.3: TerraWatch** | Landslide risk score raster, hazard maps, terrain + CV integration | **NOT STARTED** | Planned | Consumes Phase 4A.1/4A.2 persisted artifacts. |
| **Phase 4A.4: Cascaded Orchestration** | Two-stage pipeline (SegFormer → TerraWatch), artifact dependency | **NOT STARTED** | Planned | Stage 1 artifacts strictly persisted before Stage 2 execution. |
| **Phase 4B.1: LLM Intelligence** | Validated natural language hazard reports, uncertainty calibration | **NOT STARTED** | Planned | LLM reports validated against structured numerical GIS metrics. |
| **Phase 4B.2: RAG** | PostgreSQL + pgvector retrieval over project history and hazard reports | **NOT STARTED** | Planned | Embeddings over analytical project records. |
| **Phase 5: Cloud Infrastructure** | Google Cloud Storage, Cloud Run, Pub/Sub, Cloud SQL | **NOT STARTED** | Infrastructure adapters planned | Local/pluggable abstractions preserved. |
| **Phase 6+: Data Eng & MLOps** | DuckDB/Parquet, Spark/BigQuery, MLflow registry, CI/CD, Observability | **NOT STARTED** | Planned | Introduce only when scale/evaluation justifies. |

---

# 6. Current Remaining Work & Hardening Priorities

Based on current repository state, immediate engineering work focuses on production hardening and preparing for Phase 4A (Computer Vision & Hazard Intelligence):

1. **Transaction Rollback Hardening (Phase 2.2 Hardening)**:
   - Ensure failed database transactions roll back cleanly before writing `FAILED` job status records in `ProcessingJobTracker`.
2. **Durable Cloud Storage Integration (Phase 5 Prep)**:
   - Attach a persistent volume or configure GCS/S3 storage backend for production deployments to ensure GeoTIFF files persist across container restarts.
3. **Phase 4A SegFormer Integration**:
   - Model weights loading and inference worker setup for semantic segmentation masks and pixel-wise uncertainty maps.

---

# 7. Deployment Architecture & Status

### Live Deployment Topology

```
User Web Browser
      │
      ▼
Vercel Edge Network
      │
      ▼
Next.js 15 Frontend (https://georisk-ai-omega.vercel.app)
      │  [HTTPS API Requests / Bearer JWT / Server rewrites]
      ▼
Railway Application Container (https://georisk-ai-production.up.railway.app)
      │  [FastAPI Backend v0.1.0 on Python 3.12]
      ├── Local Ephemeral Disk (./data/projects/...)
      │
      ▼ [SSL Encrypted Postgres Connection]
Neon Managed Cloud Database (PostgreSQL 16 + PostGIS)
```

### Deployment Verification:
- **Backend Health Check**: `GET /api/v1/health/` returns `HTTP 200` (`{"status":"ok","project":"GeoRisk AI","environment":"production","version":"0.1.0"}`).
- **Authentication**: JWT token issuance and route security verified in production (unauthenticated requests return `HTTP 401 Unauthorized`).
- **Database Migrations**: Alembic migrations applied to head on Neon PostgreSQL.
- **Storage Persistence Notice**: In the current deployment, backend `STORAGE_BACKEND` is set to `local`. Because Railway containers use ephemeral disks, GeoTIFF files written to `./data/` are lost upon container restarts/redeployments. Durable production operations require mounting a persistent Railway volume or switching to an object storage provider (GCS/S3).

---

# 8. Core Architecture Principles

These architectural principles are non-negotiable across all development phases:

### 8.1 Infrastructure Independence
Business logic must never depend directly on specific cloud services (GCS, S3, Pub/Sub, Celery, Redis, BigQuery). All infrastructure access flows through clean abstraction interfaces:
- `StorageService` (`LocalStorage`, `GCSStorage`, `S3Storage`)
- `QueueService` (`LocalExecutor`, `PubSub`, `Celery`/`Arq`)

### 8.2 Incremental Development & Scope Discipline
1. Implement one capability at a time.
2. Make one isolated, testable change.
3. Verify behavior and run automated tests.
4. Advance only after the current step is verified.
5. Never skip ahead to future roadmap phases without explicit instruction.

### 8.3 Provenance & Reproducibility
Every generated raster must preserve complete data lineage:
- Parent raster relationship (`parent_raster_id` and `raster_lineage` records)
- Processor name and semantic version
- Processing parameter dictionary
- File path, spatial metadata, and creation timestamps
- AI artifacts must additionally track model version, configuration, input features, and UQ configuration.

### 8.4 Asynchronous & Cancellable Processing
Long-running raster and AI tasks run asynchronously:
- Jobs support explicit states: `PENDING`, `QUEUED`, `RUNNING`, `CANCELLING`, `COMPLETED`, `FAILED`, `CANCELLED`.
- Progress percentage (0–100) and status messages are continuously updated.
- Output persistence failures must never leave a job permanently in `RUNNING` state.

---

# 9. Processor Specifications (Phase 2.3)

Every processor in `backend/src/app/processing/processors/` adheres to the unified `Processor` interface:

| Processor | Input Requirements | Parameters | Output Artifact |
| :--- | :--- | :--- | :--- |
| **`MetadataProcessor`** | 1 Raster (GeoTIFF) | None | Structured spatial metadata dictionary |
| **`HillshadeProcessor`** | 1 DEM Raster | `azimuth` (0–360°), `altitude` (0–90°), `z_factor` | 8-bit Hillshade visualization raster |
| **`SlopeProcessor`** | 1 DEM Raster | `units` (`"degrees"` or `"percent"`), `z_factor` | 32-bit Float Slope derivative raster |
| **`AspectProcessor`** | 1 DEM Raster | `flat_values` | 32-bit Float Aspect derivative raster (0–360°) |
| **`ColorReliefProcessor`** | 1 DEM Raster | `color_table` (ramp definition), `color_format` | 24-bit RGB Color Relief raster |
| **`ContourProcessor`** | 1 DEM Raster | `interval` (elevation step), `base` (elevation base) | Vector contour layer (GeoJSON / Shapefile) |
| **`ClipProcessor`** | 1 Raster + AOI Geometry | `aoi_id` or GeoJSON polygon, `crop` | Clipped raster bounded to geometry extent |
| **`MergeProcessor`** | 2+ Overlapping Rasters | `raster_ids`, `method` (`first`, `min`, `max`) | Mosaicked single composite raster |
| **`ReprojectProcessor`** | 1 Raster | `target_crs` (e.g. `"EPSG:3857"`), `resampling` | Reprojected GeoTIFF raster in target CRS |

---

# 10. AI / Computer Vision / Hazard Intelligence (Phase 4A)

### 10.1 Two-Stage Cascaded Pipeline
```
Input DEM / Satellite Imagery / AOI
            │
            ▼
┌───────────────────────────────────────┐
│ Stage 1: SegFormer Multi-Class CV     │
└───────────────────────────────────────┘
     │                             │
     ▼                             ▼
Segmentation Mask            Uncertainty Raster (0.0–1.0)
     │                             │
     └──────────────┬──────────────┘
                    ▼
┌───────────────────────────────────────┐
│ Stage 2: TerraWatch Risk Engine       │
└───────────────────────────────────────┘
     │                             │
     ▼                             ▼
Continuous Risk Score Raster   Hazard Classification Maps
                    │
                    ▼
Structured Risk & Uncertainty Analytical Metrics
                    │
                    ▼
┌───────────────────────────────────────┐
│ Phase 4B: Validated LLM Intelligence  │
└───────────────────────────────────────┘
```

### 10.2 Strict AI Pipeline Invariants
1. **Separation**: SegFormer and TerraWatch are independent services.
2. **Artifact Persistence**: Stage 1 segmentation and uncertainty rasters must be fully persisted to storage and registered in PostgreSQL before Stage 2 commences.
3. **Failure Propagation**: Failure of Stage 1 strictly prevents Stage 2 execution.
4. **Uncertainty as First-Class Citizen**: Uncertainty is an authoritative analytical raster, scaled from 0.0 (maximum confidence) to 1.0 (maximum uncertainty).

---

# 11. LLM Intelligence & Reporting (Phase 4B)

### 11.1 Authoritative Source Principles
- The LLM is a reporting and synthesis layer, **never** the numerical source of truth.
- Authoritative numerical sources are deterministic GIS metrics, SegFormer masks, UQ distributions, and TerraWatch risk scores.
- The LLM translates structured analytical measurements into human-actionable reports.

### 11.2 Uncertainty-Aware Report Validation
Every generated LLM report is programmatically validated against source metrics:
- Location and AOI bounds
- Risk class and mean/max risk scores
- Mean uncertainty and high-uncertainty spatial coverage
- Factual alignment with underlying GIS measurements
- High-uncertainty areas (e.g. uncertainty > 0.45) must be explicitly flagged in the text rather than smoothed over with confident prose.

---

# 12. Future Cloud & MLOps Roadmap (Phases 5–9)

The project roadmap establishes the following long-term expansion path:

1. **Phase 5 — Cloud Infrastructure**: Managed GCS/S3 storage adapters, Pub/Sub queue workers, Cloud Run autoscaling, Secret Manager.
2. **Phase 6 — Data Engineering**: DuckDB / Apache Arrow local analytics, Parquet export, PySpark distributed processing for massive extents, BigQuery analytical sync.
3. **Phase 7 — Dashboards & Operational Intelligence**: Interactive risk dashboards, batch analytics, model performance monitoring.
4. **Phase 8 — DevOps, Security & Observability**: OpenTelemetry tracing, Prometheus metrics, Grafana dashboards, Terraform infrastructure-as-code, automated load testing.
5. **Phase 9 — Enterprise Features**: Multi-tenant RBAC, audit logging, rate limiting, and workflow collaboration.

---

# 13. How AI Coding Agents Must Work

All AI coding agents working on the GeoRisk AI repository must follow this protocol:

1. **Inspect Before Action**: Read this document and inspect the current repository code, migrations, and tests.
2. **Never Invent Architecture**: Adhere to the established repository, service, and domain patterns.
3. **Work Incrementally**: Perform one isolated, production-quality change per turn.
4. **Compile and Test**: Validate changes with type checks, linters, and unit/integration tests before reporting completion.
5. **Standard Step Response Structure**:
   - 🎯 **Goal**: Summary of the isolated change.
   - 📁 **File**: File(s) being modified or created.
   - ✏️ **Code**: Concise description of changes.
   - ✅ **Compile/Test**: Commands executed and verification output.
   - ⛔ **Stop**: Pause for confirmation before moving to the next step.
   - 💡 **Improvement**: Follow-up hardening or testing suggestions.