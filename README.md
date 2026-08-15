# GeoRisk AI

> An AI-powered geospatial risk analysis and intelligence platform combining Next.js, FastAPI, PostGIS, high-performance raster processing, and uncertainty-aware computer vision.

GeoRisk AI is a full-stack geospatial intelligence platform designed for satellite imagery and terrain analysis. It enables users to organize projects, define spatial Areas of Interest (AOIs), catalog GeoTIFF rasters, run high-performance terrain derivative algorithms, stream interactive map tiles, execute machine learning hazard forecasting models, and generate validated analytical risk reports.

---

## 1. System Architecture

```
                       Next.js 15 (React 19 + MapLibre GL JS)
                                     │
                                     ▼  [REST / Bearer JWT / XYZ Tiles]
                              FastAPI REST API
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
  Authentication              Project & AOI Services       Raster & Processing Services
  (JWT / Bcrypt)              (PostGIS Workspaces)         (GDAL / Rasterio / rio-tiler)
        │                            │                            │
        └────────────────────────────┼────────────────────────────┘
                                     ▼
                            Repository Layer
                                     │
                                     ▼
                      PostgreSQL 16 + PostGIS Engine
                                     │
        ┌────────────────────────────┴────────────────────────────┐
        ▼                                                         ▼
  Pluggable Storage                                         Local & Distributed Workers
  (Local Disk / GCS / S3)                                   (9 Terrain Processors / CV / UQ)
```

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS, Radix UI primitives, Lucide Icons, Sonner
- **Mapping & GIS**: MapLibre GL JS, react-map-gl
- **State & Data**: TanStack Query v5, Zustand, Axios, React Hook Form, Zod

### Backend & Geospatial Processing
- **API Framework**: FastAPI, Pydantic v2, Starlette
- **Database & ORM**: PostgreSQL 16 + PostGIS, SQLAlchemy 2.0 (psycopg3), GeoAlchemy2, Alembic
- **Geospatial Processing**: GDAL, Rasterio, Shapely, PyProj, GeoPandas, rio-tiler, NumPy
- **Security**: OAuth2 Bearer JWT, Passlib (Bcrypt)

### Machine Learning & Analytics *(Phases 4A–4B)*
- **Vision Models**: SegFormer (Multi-class semantic segmentation)
- **Uncertainty Engine**: Evidential Deep Learning / Entropy UQ
- **Hazard Analysis**: TerraWatch landslide & risk analysis model
- **LLM Intelligence**: Validated reporting layer, pgvector RAG

---

## 3. Verified Implemented Features

- ✅ **Authentication & Authorization**: JWT token issuance, password hashing, route protection.
- ✅ **Project Management**: Multi-project workspaces with ownership isolation and PostGIS transactions.
- ✅ **Area of Interest (AOI)**: GeoJSON spatial boundary definition, PostGIS geometry validation and spatial queries.
- ✅ **Raster Upload & Ingestion**: GeoTIFF upload, format validation with Rasterio, spatial metadata extraction (CRS, bounds, resolution, band counts).
- ✅ **Raster Derivative Processors (9 Registered)**:
  - `Metadata`: Geospatial metadata extraction.
  - `Hillshade`: Analytical terrain relief visualization.
  - `Slope`: Terrain slope calculation (degrees/percent).
  - `Aspect`: Terrain aspect calculation (degrees from North).
  - `Color Relief`: Color ramp visualization raster.
  - `Contour`: Vector contour line/polygon generation.
  - `Clip`: Spatial clipping to vector AOI boundaries.
  - `Merge`: Multi-raster mosaicking.
  - `Reproject`: Coordinate Reference System reprojection.
- ✅ **Processing Engine & Job Lifecycle**: Asynchronous job tracker, cancellation support, state persistence (`PENDING`, `QUEUED`, `RUNNING`, `CANCELLING`, `COMPLETED`, `FAILED`, `CANCELLED`).
- ✅ **Tile Server & Visualization**: Dynamic XYZ map tile rendering and TileJSON metadata streaming via `rio-tiler`.
- ✅ **Raster Previews & Statistics**: In-memory downsampled PNG preview generation, thumbnail rendering, and band statistics/histograms.
- ✅ **Workspace Interface**: Projects hub, workspace overview, raster catalog feed, upload dialog, processing jobs panel, and project settings.

---

## 4. Live Deployment Topology

| Component | Platform | URL / Endpoint |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | `https://georisk-ai-omega.vercel.app` |
| **FastAPI Backend** | Railway | `https://georisk-ai-production.up.railway.app` |
| **PostgreSQL / PostGIS** | Neon Cloud | Managed PostgreSQL 16 + PostGIS |
| **API Health Check** | Railway | `GET https://georisk-ai-production.up.railway.app/api/v1/health/` |

---

## 5. Repository Structure

```
GeoRisk-AI/
├── backend/
│   ├── src/
│   │   └── app/
│   │       ├── api/            # FastAPI routers & dependencies
│   │       ├── core/           # Configuration & logging
│   │       ├── db/             # SQLAlchemy engine & session management
│   │       ├── factories/      # Model factories
│   │       ├── models/         # SQLAlchemy 2.0 ORM models
│   │       ├── processing/     # Processing framework & 9 processors
│   │       ├── raster/         # Validation, metadata, & preview generators
│   │       ├── repositories/   # Clean data access layer
│   │       ├── schemas/        # Pydantic v2 request/response schemas
│   │       ├── services/       # Core business logic services
│   │       └── storage/        # Storage abstraction (Local, GCS, S3)
│   ├── migrations/             # Alembic database migrations
│   └── pyproject.toml          # uv Python package configuration
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Typed API client modules
│   │   ├── app/                # Next.js 15 App Router pages & layouts
│   │   ├── components/         # Modular UI components & dialogs
│   │   ├── hooks/              # TanStack Query custom hooks
│   │   ├── lib/                # Axios instance & utility functions
│   │   ├── stores/             # Zustand state stores
│   │   └── types/              # TypeScript interface definitions
│   └── package.json            # npm package configuration
│
└── docs/
    ├── GEO_RISK_PROJECT_CONTEXT.md  # Master project context & roadmap matrix
    ├── ARCHITECTURE.md              # Detailed system architecture document
    ├── DEVELOPMENT_WORKFLOW.md      # Engineering rules & development workflow
    └── agents.md                    # Instructions for AI coding assistants
```

---

## 6. Quick Start (Local Development)

### Prerequisites
- Python 3.12+ and [uv](https://github.com/astral-sh/uv)
- Node.js 20+ and npm
- PostgreSQL 16+ with PostGIS enabled (or Docker)

### Backend Setup
```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```
API docs will be available at `http://localhost:8000/docs`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Web app will be available at `http://localhost:3000`.

---

## 7. Canonical Documentation & Source of Truth

Before making code or architectural changes, refer to the canonical project documents:

1. **Master Project Context**: [`docs/GEO_RISK_PROJECT_CONTEXT.md`](docs/GEO_RISK_PROJECT_CONTEXT.md)
2. **System Architecture**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
3. **Engineering Workflow**: [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md)
4. **Project Constitution**: [`PROJECT_CONSTITUTION.md`](PROJECT_CONSTITUTION.md)

> **Source of Truth Rule**:
> Implementation status is determined from the repository's actual source code, tests, migrations, and deployment configuration. The roadmap describes intended ordering, but must not be treated as evidence that a feature is implemented.