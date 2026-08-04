# PROJECT_CONSTITUTION.md

# GeoRisk AI Project Constitution

**Version:** 1.0  
**Status:** Active  
**Last Updated:** July 2026

---

# Purpose

This document defines the engineering principles, architectural constraints, and development standards for the GeoRisk AI project.

Every contributor—human or AI—is expected to follow these rules. Architectural changes should be made intentionally and documented through an Architecture Decision Record (ADR) before implementation.

This document is considered the project's source of truth for engineering practices.

---

# 1. Core Principles

GeoRisk AI is designed around the following principles:

- Simplicity over cleverness.
- Readability over brevity.
- Explicit behavior over implicit behavior.
- Scalability over quick fixes.
- Consistency over personal preference.
- Documentation alongside implementation.

Every design decision should improve long-term maintainability.

---

# 2. Architectural Principles

The backend follows a layered architecture.

```
Client
    │
    ▼
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

Each layer has a single responsibility.

---

## Router Layer

Responsibilities

- Define HTTP endpoints.
- Validate requests.
- Invoke services.
- Return responses.

Routers must never contain business logic.

Routers must never access the database directly.

---

## Service Layer

Responsibilities

- Business rules
- Authorization
- Validation orchestration
- Repository coordination
- Response construction

Services are the only layer that coordinates multiple repositories.

---

## Repository Layer

Responsibilities

- Database queries
- CRUD operations
- Persistence

Repositories must never contain business logic.

Repositories should only know about the database.

---

## Database Layer

Responsibilities

- Data persistence
- Constraints
- Indexes
- Relationships

Database-specific logic should remain inside repositories or migrations.

---

# 3. Dependency Injection

All dependencies must be injected.

Avoid constructing repositories or services manually inside application code.

Example

```
Router
    ↓

Service

    ↓

Repository

    ↓

Database Session
```

---

# 4. API Principles

The API follows REST principles.

Rules

- Use nouns instead of verbs.
- Use plural resource names.
- Return consistent response models.
- Return appropriate HTTP status codes.
- Validate all client input.

Example

```
/projects

/projects/{project_id}

/projects/{project_id}/aois
```

---

# 5. Geospatial Principles

GeoRisk AI separates public API formats from internal storage.

External representation

```
GeoJSON
```

Internal representation

```
PostGIS Geometry
```

Conversion between both formats must happen exclusively inside the geo package.

No other module should perform geometry conversion.

---

## SRID

The project uses

```
EPSG:4326
```

as the default coordinate reference system.

The value should always be referenced through

```
DEFAULT_SRID
```

Never hardcode SRID values.

---

# 6. Validation

Validation occurs in multiple stages.

Request

↓

Pydantic

↓

Business Validation

↓

Geometry Validation

↓

Database Constraints

Each layer validates only what it owns.

---

# 7. Error Handling

All user-facing exceptions must inherit from

```
AppException
```

Do not expose

- ValueError
- TypeError
- SQLAlchemy exceptions
- Shapely exceptions

to API consumers.

Convert library exceptions into project-specific exceptions.

---

# 8. Coding Standards

General Rules

- Async-first development.
- Full type annotations.
- Explicit return types.
- No magic numbers.
- Small, focused functions.
- One responsibility per module.

Avoid unnecessary abstractions.

Prefer clarity over excessive optimization.

---

# 9. Naming Conventions

Classes

```
ProjectService
AOIRepository
GeoJSONFeature
```

Functions

```
create_project()

get_aoi()

validate_feature()
```

Constants

```
DEFAULT_SRID
```

Modules

```
snake_case
```

---

# 10. Documentation Standards

Every major architectural decision must be documented.

Documentation should explain

- Why
- What
- Alternatives considered

Implementation details belong in source code.

Architectural reasoning belongs in documentation.

---

# 11. Testing Principles

Tests should verify behavior rather than implementation.

Recommended layers

- Unit Tests
- Repository Tests
- API Tests
- Integration Tests

Mock only external systems.

Avoid mocking business logic.

---

# 12. AI Contribution Policy

AI assistants are contributors, not decision makers.

Architecture changes require human approval.

AI-generated code should always be reviewed before merging.

Project documentation is the authoritative reference for all AI tools.

---

# 13. Pull Request Checklist

Before merging, ensure:

- [ ] Code follows architecture.
- [ ] Documentation updated.
- [ ] Tests added or updated.
- [ ] No duplicated logic.
- [ ] Type hints complete.
- [ ] Exceptions handled correctly.
- [ ] Formatting passes.
- [ ] No hardcoded values.

---

# 14. Future Expansion

The architecture should support future modules without significant refactoring.

Planned additions include:

- Raster processing
- Machine learning inference
- Background task processing
- Interactive mapping
- Report generation
- Cloud deployment

New modules should integrate with existing architectural principles rather than introducing parallel patterns.

---

# Final Principle

When faced with multiple implementation choices, prefer the solution that is:

1. Easier to understand.
2. Easier to test.
3. Easier to document.
4. Easier to maintain.

Consistency across the codebase is more valuable than individual optimization.