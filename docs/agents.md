# GeoRisk AI — AI Agent Instructions

## 1. Purpose

You are working on GeoRisk AI, a production-oriented geospatial
intelligence platform.

Before making architectural or implementation changes, read:

1. `docs/GEO_RISK_PROJECT_CONTEXT.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DEVELOPMENT_WORKFLOW.md`

These documents are the canonical project context, architecture, and
development workflow.

Do not rely on memory when the repository documentation can answer the
question.

---

# 2. Current Project

GeoRisk AI is being developed as a layered geospatial intelligence
platform.

Target architecture:

```text
Next.js
    ↓
FastAPI
    ↓
Application Services
    ↓
Repositories
    ↓
PostgreSQL + PostGIS
    +
Storage
    +
Queue
    ↓
Processing / Inference Workers
````

The long-term AI pipeline is:

```text
Input Raster
    ↓
SegFormer
    ↓
Segmentation + Uncertainty
    ↓
TerraWatch
    ↓
Risk / Hazard Analysis
    ↓
Structured Metrics
    ↓
LLM Intelligence
    ↓
Validated Report
```

Do not implement the entire target architecture prematurely.

---

# 3. Implementation Status & Milestone Alignment

Always determine implementation status from:

```text
docs/GEO_RISK_PROJECT_CONTEXT.md
```

> **Source of Truth Rule:**
> Implementation status is determined from the repository's actual source code,
> tests, migrations, and deployment configuration. The roadmap describes intended
> ordering, but must not be treated as evidence that a feature is implemented.

Consult the **Milestone Completion Matrix** in `GEO_RISK_PROJECT_CONTEXT.md` to
identify completed capabilities, active work, and pending hardening tasks.

Do not skip ahead to downstream phases unless explicitly requested.

---

# 4. Mandatory Workflow

For every implementation task:

```text
Read context
    ↓
Inspect repository
    ↓
Identify current implementation
    ↓
Identify one isolated change
    ↓
Implement
    ↓
Test
    ↓
Verify
    ↓
Document architectural changes if necessary
    ↓
STOP
```

Do not implement multiple unrelated steps in one response.

---

# 5. Incremental Development

GeoRisk AI is developed incrementally.

When the user says:

```text
next
```

implement only the next logical step.

Do not interpret:

```text
next
```

as permission to implement an entire feature, phase, or subsystem.

When the user confirms a step is complete, continue with exactly one next
step.

---

# 6. Response Format

For implementation work, respond using exactly:

```text
🎯 Goal

📁 File

✏️ Code

✅ Compile/Test

⛔ Stop

💡 Improvement
```

The `Code` section must contain the complete code for the current isolated
file/change.

Do not dump multiple implementation steps unless the user explicitly asks
for them.

---

# 7. Repository Inspection

Before changing code:

```bash
git status --short
```

Inspect the relevant source files.

Never invent file paths.

Use the actual repository structure.

Useful commands:

```bash
find backend/src/app -maxdepth 4 -type f
```

```bash
grep -R "ProcessorType" -n backend/src/app
```

```bash
grep -R "class .*Service" -n backend/src/app/services
```

```bash
grep -R "class .*Repository" -n backend/src/app/repositories
```

Understand existing abstractions before creating new ones.

---

# 8. Preserve Architecture

Prefer extending existing abstractions.

Do not create duplicate systems for responsibilities that already have
an established abstraction.

Examples:

```text
StorageService
ProcessorRegistry
ProcessingManager
ProcessingJobTracker
RasterFactory
Repository layer
Service layer
```

Use existing architecture unless there is a demonstrated reason to change
it.

If architectural change is necessary, explain why and keep the change
isolated.

---

# 9. Dependency Direction

Preserve:

```text
API
 ↓
Services
 ↓
Repositories / Domain
 ↓
Infrastructure
```

Processing:

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

Do not introduce dependencies in the opposite direction.

Processors must not depend on HTTP routers.

Services must not directly depend on cloud SDKs when an abstraction exists.

LLM code must not become the source of authoritative numerical data.

---

# 10. No Premature Infrastructure

Do not introduce future infrastructure merely because it appears in the
roadmap.

Do not add:

```text
Redis
Celery
Kafka
Pub/Sub
Spark
BigQuery
Kubernetes
Terraform
Prometheus
Grafana
```

unless:

1. The current development phase requires it, or
2. The user explicitly requests it, or
3. A concrete architectural requirement has been demonstrated.

Future architecture should not become unnecessary current complexity.

---

# 11. Abstraction Before Infrastructure

When future infrastructure is relevant, preserve an abstraction boundary.

Examples:

```text
StorageService
    ├── LocalStorage
    ├── GCSStorage
    └── S3Storage
```

and:

```text
QueueService
    ├── LocalQueue
    └── PubSubQueue
```

Application code should depend on the abstraction.

Do not couple business logic directly to a cloud provider.

---

# 12. Database Rules

Any database schema change requires an Alembic migration.

This includes:

* Tables
* Columns
* Indexes
* Constraints
* Relationships
* Enum values
* Data migrations

Always inspect migrations before applying them.

Python enums and PostgreSQL enums must remain synchronized.

After a migration:

```text
Apply migration
    ↓
Verify database
    ↓
Run focused tests
```

---

# 13. Processing Rules

Raster operations must use the processing architecture.

Preferred:

```text
Processor
    ↓
Raster algorithm
    ↓
GeneratedRaster
    ↓
ProcessingResult
    ↓
RasterFactory
    ↓
RasterRepository
```

Do not bypass the processor framework with special-case API logic.

Every new processor must be:

```text
Implemented
    ↓
Tested
    ↓
Registered
    ↓
Registration verified
    ↓
Executed
    ↓
Output verified
```

---

# 14. Raster Correctness

For raster processing, file existence alone is not sufficient.

Validate appropriate:

```text
CRS
Dimensions
Band count
Data type
NoData
Pixel size
Bounds
Value range
Mathematical semantics
```

Examples:

```text
Aspect → 0–360 degrees
Color Relief → 3-band uint8 RGB
```

Use the correct mathematical/geospatial expectations for each processor.

---

# 15. Processing Jobs

Processing job lifecycle must remain consistent:

```text
PENDING
    ↓
QUEUED
    ↓
RUNNING
    ↓
COMPLETED
```

Failure:

```text
RUNNING
    ↓
FAILED
```

Cancellation:

```text
RUNNING
    ↓
CANCELLING
    ↓
CANCELLED
```

Job completion must verify:

```text
status = COMPLETED
progress = 100
finished_at != null
```

A generated output must also be persisted successfully.

---

# 16. Transaction Safety

Never attempt database operations on a failed SQLAlchemy transaction without
first rolling the transaction back.

Correct:

```text
Database exception
    ↓
Rollback
    ↓
Persist failure state
```

Incorrect:

```text
Database exception
    ↓
Commit again
    ↓
PendingRollbackError
```

A processing job must not remain stuck in `RUNNING` because the failure
handler itself failed.

---

# 17. Error Handling

Debug root causes rather than symptoms.

Use:

```text
Symptom
    ↓
Traceback/log
    ↓
Reproduction
    ↓
Root cause
    ↓
Minimal fix
    ↓
Retest
```

Do not weaken tests simply to make them pass.

Do not hide exceptions.

Preserve exception chaining where useful:

```python
raise SomeError(...) from exc
```

---

# 18. Testing

Never claim a test passed without actually running it.

Typical backend validation:

```bash
uv run pytest
```

Focused:

```bash
uv run pytest path/to/test.py
```

Compilation:

```bash
uv run python -m compileall src/app
```

Import validation:

```bash
uv run python -c "..."
```

For geospatial changes, inspect the generated raster.

For API changes, inspect the actual HTTP response.

For database changes, inspect persisted state.

For processing changes, inspect the complete job lifecycle.

---

# 19. Git Safety

Before editing:

```bash
git status --short
```

Never destroy existing user work.

Do not run:

```bash
git reset --hard
```

or:

```bash
git clean -fd
```

unless explicitly requested.

Do not blindly use:

```bash
git add .
```

when unrelated changes exist.

Prefer targeted staging.

---

# 20. Generated Files

Do not intentionally commit generated artifacts unless required.

Typical generated files:

```text
__pycache__/
*.pyc
temporary GeoTIFFs
logs
local databases
test output files
```

Repository cleanup must be a separate controlled task.

---

# 21. AI Architecture

The AI system is a two-stage cascaded model pipeline:

```text
Input Raster
    ↓
SegFormer
    ├── Segmentation Mask
    └── Uncertainty Raster
            ↓
        TerraWatch
            ├── Risk Score
            └── Hazard Maps
                    ↓
              Structured Metrics
                    ↓
                   LLM
                    ↓
             Validated Report
```

SegFormer and TerraWatch are separate model stages.

Do not merge their responsibilities.

---

# 22. SegFormer

SegFormer is responsible for segmentation and uncertainty estimation.

Outputs include:

```text
Segmentation Mask
Uncertainty Raster
```

Potential uncertainty methods include:

```text
Softmax Entropy
MC Dropout
Ensembling
```

The uncertainty representation should be explicitly normalized and tested.

---

# 23. TerraWatch

TerraWatch is the risk-analysis stage.

Conceptually:

```text
Raw Geospatial Inputs
+
SegFormer Outputs
+
Terrain Features
+
Optional Uncertainty
    ↓
TerraWatch
    ↓
Risk / Hazard Outputs
```

TerraWatch must not depend directly on the LLM.

The LLM consumes structured TerraWatch results.

---

# 24. LLM Numerical Truth

The LLM must never be treated as the authoritative source for numerical
geospatial or model results.

Authoritative sources include:

```text
PostGIS
Raster processing
SegFormer
TerraWatch
Structured analysis metrics
```

The LLM interprets and communicates those results.

It must not invent:

```text
Risk scores
Coordinates
Areas
Elevation
Slope
Uncertainty
Model metrics
```

---

# 25. Uncertainty-Aware Reporting

When uncertainty materially affects an analysis, the generated report must
communicate that uncertainty.

Conceptually:

```text
High Risk
+
High Uncertainty
↓
Cautious report
```

Do not present uncertain predictions as high-confidence conclusions.

Exact thresholds must be defined during implementation and backed by tests.

---

# 26. Documentation

When architecture changes:

```text
docs/ARCHITECTURE.md
```

must be updated.

When project status changes:

```text
docs/GEO_RISK_PROJECT_CONTEXT.md
```

must be updated.

When development rules change:

```text
docs/DEVELOPMENT_WORKFLOW.md
```

must be updated.

Avoid creating duplicate documentation.

---

# 27. User Instructions Override Convenience

If the user explicitly asks for a different implementation strategy,
follow the request unless it violates the established architecture,
safety, or technical correctness.

If the request would create a significant architectural problem, explain
the issue before implementing it.

Do not silently substitute a different architecture.

---

# 28. Do Not Skip Ahead

The roadmap contains future phases.

Future phases are not permission to implement them now.

Active milestones and hardening priorities take precedence.

Example:

If the current task involves Phase 3 interactive GIS or Phase 2 hardening,
do not start:

```text
SegFormer
Uncertainty Engine
TerraWatch
Celery
GCS/S3 Cloud Storage
BigQuery
```

unless explicitly requested.

---

# 29. Definition of Done

A step is complete only when:

```text
Implementation
    +
Focused test
    +
Relevant verification
```

has succeeded.

For architecture changes:

```text
Implementation
    +
Tests
    +
Documentation
```

may be required.

Never mark a step complete based solely on code generation.

---

# 30. Final Agent Rule

Before every significant change, ask internally:

```text
What phase are we in?

What exact step did the user request?

What already exists?

Which single file/change is necessary?

How will I verify it?

What should remain untouched?
```

Then:

```text
Inspect
    ↓
Implement one change
    ↓
Test
    ↓
Report
    ↓
STOP
```

Do not continue automatically.

---

# 31. Canonical References

Always treat these files as the shared GeoRisk AI project memory:

```text
docs/GEO_RISK_PROJECT_CONTEXT.md
docs/ARCHITECTURE.md
docs/DEVELOPMENT_WORKFLOW.md
```

This file is the agent-facing entry point.

When entering the repository, read this file first, then read the three
canonical documents before making significant changes.
