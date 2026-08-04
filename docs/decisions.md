# Architecture Decision Records (ADRs)

# Index

| ADR | Title | Status |
|------|-------|--------|
| ADR-001 | Repository Pattern | Accepted |
| ADR-002 | Service Layer | Accepted |
| ADR-003 | Dependency Injection | Accepted |
| ADR-004 | GeoJSON as Public API | Accepted |
| ADR-005 | PostGIS as Internal Geometry | Accepted |
| ADR-006 | Dedicated Geo Package | Accepted |
| ADR-007 | GeoJSON Feature Wrapper | Accepted |
| ADR-008 | Repository Ownership Rules | Accepted |
| ADR-009 | Exception Hierarchy | Accepted |
| ADR-010 | DEFAULT_SRID Constant | Accepted |
This document records the major architectural decisions made during the development of GeoRisk AI.

Its purpose is to preserve the reasoning behind important technical choices so future contributors understand not only **what** was implemented, but also **why** it was implemented that way.

The decisions documented here are considered accepted unless explicitly superseded by a newer ADR.

---

# ADR-001 — Repository Pattern

**Status:** Accepted

## Problem

Business logic should not depend directly on SQLAlchemy queries or database implementation details.

## Decision

Use a dedicated Repository layer responsible for all database access.

Services communicate with repositories instead of interacting directly with SQLAlchemy.

## Alternatives Considered

- Direct database queries inside services
- Active Record pattern
- Generic CRUD without repositories

## Why This Was Chosen

The Repository Pattern separates persistence from business logic, improves testability, and allows the database implementation to evolve independently.

## Consequences

- Services remain database-agnostic.
- Database logic is centralized.
- Easier to mock repositories during testing.

---

# ADR-002 — Service Layer

**Status:** Accepted

## Problem

Business rules should not be distributed across routers or repositories.

## Decision

Introduce a dedicated Service layer responsible for application logic.

## Alternatives Considered

- Business logic inside routers
- Business logic inside repositories

## Why This Was Chosen

Services provide a single location for business rules, authorization, validation orchestration, and coordination between repositories.

## Consequences

- Clear separation of responsibilities.
- Easier maintenance.
- Better scalability as the project grows.

---

# ADR-003 — Dependency Injection

**Status:** Accepted

## Problem

Manually constructing services and repositories creates tight coupling.

## Decision

Use FastAPI dependency injection throughout the application.

## Alternatives Considered

- Manual object creation
- Global singleton instances

## Why This Was Chosen

Dependency injection improves modularity, simplifies testing, and keeps object creation centralized.

## Consequences

- Loose coupling.
- Easier mocking during tests.
- Consistent dependency management.

---

# ADR-004 — GeoJSON as the Public API Format

**Status:** Accepted

## Problem

The frontend requires a standard spatial data format that is interoperable with modern GIS libraries.

## Decision

Expose all geometries through GeoJSON.

## Alternatives Considered

- WKT
- WKB
- Raw coordinate arrays
- PostGIS-specific formats

## Why This Was Chosen

GeoJSON is widely supported by web mapping libraries such as Leaflet, MapLibre, OpenLayers, and Mapbox.

It also aligns with common REST API practices.

## Consequences

- Simple frontend integration.
- GIS interoperability.
- Stable public API.

---

# ADR-005 — PostGIS as the Internal Geometry Format

**Status:** Accepted

## Problem

Spatial operations require efficient indexing and native GIS functionality.

## Decision

Store geometries using PostgreSQL + PostGIS.

## Alternatives Considered

- Plain JSON
- WKT strings
- Geometry stored outside the database

## Why This Was Chosen

PostGIS provides mature spatial indexing, validation, and analysis capabilities while integrating seamlessly with PostgreSQL.

## Consequences

- Efficient spatial queries.
- Native GiST indexing.
- Future support for advanced GIS operations.

---

# ADR-006 — Dedicated Geo Package

**Status:** Accepted

## Problem

Geometry validation and conversion should not be duplicated across modules.

## Decision

Create a dedicated `app.geo` package.

## Responsibilities

- GeoJSON schemas
- Geometry validation
- Geometry conversion
- Future spatial utilities

## Why This Was Chosen

Centralizing geospatial functionality avoids duplicated logic and keeps the architecture modular.

## Consequences

- Easier maintenance.
- Single source of truth for GIS operations.

---

# ADR-007 — GeoJSON Feature Wrapper

**Status:** Accepted

## Problem

Business metadata should remain separate from spatial metadata.

## Decision

Return AOI geometries as a GeoJSON Feature inside API response objects.

Example

```json
{
  "id": 1,
  "name": "Flood Zone",
  "feature": {
    "type": "Feature",
    "geometry": { ... },
    "properties": {}
  }
}
```

## Why This Was Chosen

Business entities evolve independently from spatial metadata.

The Feature wrapper preserves GeoJSON compliance while keeping the API flexible.

## Consequences

- Cleaner API.
- Future spatial properties can be added without changing business schemas.

---

# ADR-008 — Repository Ownership Rules

**Status:** Accepted

## Problem

Authorization logic should not leak into the persistence layer.

## Decision

Repositories only query data.

Ownership validation belongs to the Service layer.

## Why This Was Chosen

Repositories should know about data, not users or permissions.

## Consequences

- Better separation of concerns.
- Cleaner authorization flow.

---

# ADR-009 — Exception Hierarchy

**Status:** Accepted

## Problem

Library exceptions should not be exposed through the public API.

## Decision

Create project-specific exceptions that inherit from `AppException`.

## Examples

- ProjectNotFoundError
- AOINotFoundError
- InvalidGeoJSONError
- InvalidGeometryError

## Why This Was Chosen

The API returns consistent error responses regardless of the underlying library.

## Consequences

- Stable API.
- Easier frontend error handling.

---

# ADR-010 — DEFAULT_SRID Constant

**Status:** Accepted

## Problem

Hardcoded SRID values create duplicated configuration.

## Decision

Use a shared constant:

```python
DEFAULT_SRID = 4326
```

## Why This Was Chosen

The project currently supports a single coordinate reference system.

Centralizing the value avoids magic numbers and simplifies future changes.

## Consequences

- Improved readability.
- Easier migration if multiple SRIDs are supported later.

---

# Future ADRs

The following decisions are expected as the project evolves.

- Raster Processing Pipeline
- Background Job Processing
- Machine Learning Architecture
- Frontend State Management
- Map Rendering Framework
- Cloud Deployment Strategy
- Caching Strategy
- Role-Based Access Control (RBAC)
- File Storage Architecture
- CI/CD Pipeline