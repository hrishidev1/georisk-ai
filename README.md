# GeoRisk AI

> An AI-powered geospatial risk analysis platform for managing projects, defining Areas of Interest (AOIs), and generating intelligent spatial insights from satellite imagery.

GeoRisk AI is a full-stack geospatial intelligence platform designed to simplify satellite imagery analysis through modern web technologies, machine learning, and GIS tooling. It enables users to organize projects, define spatial regions of interest, process geospatial datasets, and visualize analysis results through an interactive web interface.

The project is being built with a strong emphasis on clean architecture, maintainability, and scalability, making it suitable for both research and production-oriented workflows.

---

## Features

### Current

- User authentication and authorization
- Project management
- Area of Interest (AOI) management
- GeoJSON-based spatial APIs
- PostgreSQL + PostGIS integration
- Repository and Service Layer architecture
- Typed API schemas using Pydantic v2
- Alembic database migrations

### Planned

- Raster upload pipeline
- Satellite imagery processing
- Machine learning inference
- Landslide susceptibility analysis
- Interactive web maps
- Background processing
- Analysis history
- Exportable reports

---

# System Overview

```
                React + TypeScript
                        │
                        ▼
               FastAPI REST API
                        │
        ┌───────────────┴───────────────┐
        │                               │
 Authentication                 Project Services
                                        │
                                   AOI Services
                                        │
                                 Geo Conversion
                                        │
                             PostgreSQL + PostGIS
                                        │
                             Raster Processing
                                        │
                              Machine Learning
                                        │
                               Analysis Results
```

GeoRisk AI follows a layered architecture that separates API routing, business logic, data access, and geospatial processing into independent modules. This design improves maintainability, testability, and future extensibility.

---

# Technology Stack

## Backend

- FastAPI
- SQLAlchemy 2.0
- PostgreSQL
- PostGIS
- GeoAlchemy2
- Alembic
- Pydantic v2
- JWT Authentication

## Frontend *(Planned)*

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- React Router
- Leaflet / MapLibre GL

## Geospatial

- GeoJSON
- Shapely
- PostGIS
- Raster processing (planned)

## Machine Learning *(Planned)*

- PyTorch
- SegFormer
- Evidential Deep Learning
- Satellite imagery segmentation

---

# Repository Structure

```
GeoRisk-AI/

├── backend/
│   ├── app/
│   ├── migrations/
│   └── docs/
│
├── frontend/
│   └── docs/
│
├── docs/
│
├── README.md
├── ARCHITECTURE.md
└── PROJECT_CONSTITUTION.md
```

---

# Quick Start

## Backend

```bash
git clone <repository-url>

cd backend

uv sync

uv run alembic upgrade head

uv run uvicorn app.main:app --reload
```

The API documentation will be available at

```
http://localhost:8000/docs
```

---

# Documentation

Project documentation is organized into multiple sections.

| Document | Description |
|----------|-------------|
| `ARCHITECTURE.md` | Overall system architecture |
| `PROJECT_CONSTITUTION.md` | Engineering principles and project rules |
| `docs/decisions.md` | Architecture Decision Records (ADRs) |
| `backend/docs/` | Backend documentation |
| `frontend/docs/` | Frontend documentation |

---

# Development Workflow

The project follows a layered architecture.

```
Router
    │
    ▼
Service
    │
    ▼
Repository
    │
    ▼
Database
```

Geospatial processing follows a dedicated pipeline.

```
GeoJSON

↓

Validation

↓

Conversion

↓

PostGIS

↓

Database
```

---

# Project Status

Current Phase

- ✅ Authentication
- ✅ Project Management
- 🚧 Area of Interest (AOI)
- ⬜ Raster Processing
- ⬜ Machine Learning Pipeline
- ⬜ Frontend Development
- ⬜ Deployment

---

# Design Principles

GeoRisk AI is built around several core principles.

- Separation of concerns
- Clean architecture
- Type safety
- Async-first backend
- GeoJSON as the public API format
- PostGIS as the internal spatial engine
- Explicit dependency injection
- Comprehensive documentation

---

# Contributing

Before contributing, please read:

- `PROJECT_CONSTITUTION.md`
- `ARCHITECTURE.md`

These documents define the project's engineering standards, architectural decisions, and development workflow.

---

# License

This project is currently under active development.

A license will be added prior to the first public release.

---

# Acknowledgements

GeoRisk AI is being developed as a modern geospatial intelligence platform combining GIS technologies, machine learning, and scalable backend architecture.