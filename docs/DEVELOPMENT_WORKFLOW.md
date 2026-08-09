# GeoRisk AI — Development Workflow

> Canonical development workflow for GeoRisk AI.
>
> This document defines how humans and AI coding agents must make changes
> to the repository.
>
> It complements:
>
> - `docs/GEO_RISK_PROJECT_CONTEXT.md`
> - `docs/ARCHITECTURE.md`

---

# 1. Core Development Principle

GeoRisk AI is developed incrementally.

Every implementation change must be:

- Small
- Isolated
- Testable
- Reversible
- Consistent with the architecture
- Consistent with the current project phase

Do not implement future functionality simply because it appears in the
roadmap.

The current implementation phase has priority over future architecture.

---

# 2. Source of Truth

Before implementing a significant change, inspect:

```text
docs/GEO_RISK_PROJECT_CONTEXT.md
docs/ARCHITECTURE.md
docs/DEVELOPMENT_WORKFLOW.md
````

Then inspect the actual repository implementation.

The repository is the source of truth for:

* What is currently implemented
* Actual file locations
* Existing interfaces
* Existing database schema
* Existing processor behavior
* Existing API behavior
* Existing tests

The documentation is the source of truth for:

* Architectural intent
* Project direction
* Development constraints
* Current milestone
* Future design

Never assume documentation means a feature already exists.

---

# 3. Source of Truth Hierarchy

When information conflicts, use this order:

```text
1. Actual runtime behavior
2. Current source code
3. Database schema / migrations
4. Existing tests
5. Architecture documentation
6. Project context / roadmap
7. Future design proposals
```

However, an architectural conflict must not simply be ignored.

If implementation differs from the intended architecture:

1. Identify the difference.
2. Determine whether the implementation or documentation is outdated.
3. Make the smallest correction necessary.
4. Update documentation when the architecture changes.

---

# 4. Incremental Implementation Rule

Never implement an entire feature in one uncontrolled change.

Work in isolated steps.

Example:

Bad:

```text
Implement Phase 3 GIS
    ↓
Modify backend
    ↓
Modify database
    ↓
Add tile server
    ↓
Build MapLibre UI
    ↓
Add caching
    ↓
Add tests
```

Preferred:

```text
Step 1
Create tile service abstraction
    ↓
Test
    ↓
STOP

Step 2
Implement first tile provider
    ↓
Test
    ↓
STOP

Step 3
Expose tile API
    ↓
Test
    ↓
STOP

Step 4
Connect MapLibre
    ↓
Test
    ↓
STOP
```

Each step must have a clear completion condition.

---

# 5. One Implementation Step Per Interaction

When working interactively with an AI coding agent:

The agent must provide only one implementation step at a time unless the
user explicitly asks for multiple steps.

Each response should contain:

```text
🎯 Goal

📁 File

✏️ Code

✅ Compile/Test

⛔ Stop

💡 Improvement
```

The agent must stop after the current step.

Do not automatically continue to the next implementation step.

---

# 6. Before Editing a File

Before modifying a file:

1. Locate the file.
2. Read the relevant implementation.
3. Identify its callers.
4. Identify related interfaces/models.
5. Check existing tests.
6. Determine whether the requested change belongs in that layer.

Do not modify a file merely because its name appears related to the task.

---

# 7. Repository Inspection

Before making architectural changes, inspect the repository.

Useful commands include:

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

```bash
git status --short
```

The agent should understand the existing implementation before proposing
new abstractions.

---

# 8. Never Assume File Structure

Do not invent paths.

For example, do not assume:

```text
app/processors/
```

exists simply because the architecture says processors exist.

Inspect the repository first.

The actual project may use:

```text
app/processing/processors/
```

or another structure.

Always follow the current repository structure unless the current step
explicitly changes it.

---

# 9. Preserve Existing Abstractions

If an abstraction already exists, extend it rather than creating a
competing abstraction.

Examples:

If this exists:

```text
StorageService
```

do not introduce:

```text
CloudStorageManager
```

without a strong architectural reason.

If this exists:

```text
ProcessorRegistry
```

do not create another processor-dispatch mechanism.

If this exists:

```text
ProcessingJobTracker
```

do not duplicate job-state logic inside routers.

---

# 10. Avoid Premature Infrastructure

Do not introduce infrastructure merely because it appears in the roadmap.

Examples:

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

should not be introduced before their phase or a concrete requirement.

The architecture should provide abstractions where appropriate, but
implementations should be introduced only when justified.

---

# 11. Abstraction Before Infrastructure

When a future infrastructure dependency is architecturally important,
introduce the abstraction first.

Example:

```text
StorageService
    ↓
LocalStorage
```

Later:

```text
StorageService
    ├── LocalStorage
    ├── GCSStorage
    └── S3Storage
```

Similarly:

```text
QueueService
    ↓
LocalQueue
```

Later:

```text
QueueService
    ├── LocalQueue
    └── PubSubQueue
```

The business/application layer should depend on the abstraction.

---

# 12. Database Changes

Any database schema modification requires an Alembic migration.

Never manually modify the production schema as the final solution.

Examples requiring migrations:

* New table
* New column
* New index
* New constraint
* New relationship
* Enum modification
* Data migration

After changing a database enum in Python, verify the PostgreSQL enum as
well.

Example:

```text
Python Enum
    ↕
PostgreSQL Enum
```

must remain synchronized.

---

# 13. Migration Workflow

For a schema change:

```text
Inspect current schema
        ↓
Modify SQLAlchemy model
        ↓
Generate/create migration
        ↓
Inspect migration
        ↓
Apply migration
        ↓
Verify database
        ↓
Run tests
```

Never blindly trust an autogenerated migration.

Review it before applying it.

---

# 14. Processing Processor Workflow

New raster processors must follow the existing processing architecture.

Preferred flow:

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

Do not bypass the processing framework by creating special-case API logic.

---

# 15. Adding a New Processor

For a new raster processor:

### Step 1

Implement the raster algorithm.

Example:

```text
app/raster/processing/contour.py
```

### Step 2

Test the mathematical/geospatial behavior independently.

### Step 3

Implement the processor.

Example:

```text
app/processing/processors/contour.py
```

### Step 4

Register the processor.

### Step 5

Verify processor discovery/registration.

### Step 6

Test end-to-end processing.

### Step 7

Verify generated raster persistence.

Do not combine all of these into one uncontrolled modification.

---

# 16. Processor Registration

Whenever a new processor is introduced, verify:

```text
ProcessorType
    ↓
Processor implementation
    ↓
ProcessorRegistry
    ↓
ProcessingManager
    ↓
API/job execution
```

A processor existing on disk does not mean the system can execute it.

Always test registration separately when appropriate.

---

# 17. Raster Output Validation

Every generated raster should be validated according to its type.

Validate relevant properties such as:

```text
Dimensions
CRS
Band count
Data type
NoData
Value range
Pixel size
Bounds
File existence
```

Examples:

Hillshade:

```text
Expected numeric range
```

Slope:

```text
Expected slope range
```

Aspect:

```text
0–360 degrees
```

Color relief:

```text
3 bands
uint8
0–255
```

The expected mathematical/geospatial semantics must be tested rather
than merely checking that a file exists.

---

# 18. Processing Job Verification

A successful processing test should verify more than HTTP 200.

Verify:

```text
Job created
    ↓
Job running
    ↓
Progress updates
    ↓
Job completed
    ↓
Progress = 100
    ↓
finished_at populated
    ↓
Generated raster persisted
    ↓
Output file exists
    ↓
Output metadata is correct
```

For failures:

```text
Job failed
    ↓
finished_at populated
    ↓
Useful error message persisted
```

For cancellation:

```text
Cancellation requested
    ↓
CANCELLING
    ↓
Worker observes cancellation
    ↓
CANCELLED
```

---

# 19. Transaction Failure Rule

When a database operation fails:

```text
Database exception
    ↓
Rollback
    ↓
Recover transaction/session
    ↓
Persist failure state
```

Never attempt another database operation on a failed SQLAlchemy transaction
without first rolling it back.

This is especially important for processing jobs.

A processing job must never remain permanently `RUNNING` merely because
its failure handler encountered a transaction error.

---

# 20. Error Handling

Errors should be handled at the appropriate architectural boundary.

Example:

```text
Raster algorithm
    ↓
Domain/processing exception
    ↓
Processing service
    ↓
Job failure state
    ↓
API response
```

Do not expose internal stack traces as normal API responses.

Preserve the original exception through exception chaining where useful:

```python
raise ProcessingError(...) from exc
```

---

# 21. Logging

Logs should provide useful operational context.

Prefer:

```text
Processor
Job ID
Raster ID
Project ID
Operation
Duration
Status
```

Avoid logging:

* Passwords
* JWTs
* Secrets
* Private credentials
* Sensitive tokens

Logging should help diagnose processing failures without leaking secrets.

---

# 22. Testing Before Declaring Completion

A change is not complete merely because the code compiles.

At minimum:

```text
Static/import validation
        ↓
Focused test
        ↓
Integration/API test when applicable
        ↓
Manual verification when applicable
```

For geospatial changes, validate the actual output artifact.

For API changes, validate the HTTP response.

For database changes, validate persisted state.

For processing changes, validate the entire job lifecycle.

---

# 23. Test Commands

Use the repository's actual tooling.

Current backend tooling includes:

```bash
uv
```

Typical commands:

```bash
uv run pytest
```

For focused tests:

```bash
uv run pytest path/to/test.py
```

For import validation:

```bash
uv run python -c "..."
```

For compilation:

```bash
uv run python -m compileall src/app
```

Do not claim a test passed without actually running it.

---

# 24. Frontend Workflow

Frontend changes should follow:

```text
Component/API requirement
        ↓
Inspect existing UI architecture
        ↓
Modify one isolated component
        ↓
Run type/lint/build validation
        ↓
Browser verification
```

Do not rewrite the frontend architecture for a single UI feature.

Preserve existing:

```text
TanStack Query
Axios
Zustand
React Hook Form
Zod
MapLibre
```

where already established.

---

# 25. API Contract Changes

When changing an API:

Inspect all three:

```text
Router
Schema
Frontend/API consumer
```

Do not change response structure casually.

If a response contract changes:

1. Update backend schema.
2. Update backend endpoint.
3. Update relevant tests.
4. Update frontend consumer if applicable.
5. Verify the actual HTTP response.

---

# 26. Backward Compatibility

Prefer additive changes when possible.

Example:

Good:

```text
Add optional field
```

Potentially dangerous:

```text
Rename existing response field
```

Breaking changes require explicit justification.

---

# 27. Git Workflow

Before starting work:

```bash
git status --short
```

Understand existing changes before editing.

Never discard existing user changes without explicit permission.

Never run destructive commands such as:

```bash
git reset --hard
git clean -fd
```

unless explicitly requested.

Avoid:

```bash
git add .
```

when unrelated work is present.

Prefer targeted staging:

```bash
git add docs/ARCHITECTURE.md
```

or:

```bash
git add path/to/changed/file
```

---

# 28. Generated Files

Do not intentionally commit generated artifacts unless the project
requires them.

Common generated artifacts include:

```text
__pycache__/
*.pyc
temporary GeoTIFFs
test output files
local databases
logs
```

These should normally be covered by `.gitignore`.

Repository cleanup should be performed as a separate controlled task.

---

# 29. Documentation Workflow

When a change modifies architecture:

Update:

```text
docs/ARCHITECTURE.md
```

When a change modifies project state:

Update:

```text
docs/GEO_RISK_PROJECT_CONTEXT.md
```

When development methodology changes:

Update:

```text
docs/DEVELOPMENT_WORKFLOW.md
```

Do not create duplicate architecture documents.

---

# 30. Architecture Decision Records

Significant architectural decisions should eventually be recorded as ADRs.

Recommended location:

```text
docs/adr/
```

Example:

```text
docs/adr/
├── 0001-processing-architecture.md
├── 0002-storage-abstraction.md
└── 0003-ai-cascade.md
```

Do not create an ADR for every minor implementation change.

Use ADRs for decisions such as:

* Choosing Celery vs Arq
* Choosing MapLibre
* Choosing MLflow
* Choosing GCS
* Choosing PostGIS architecture
* Choosing the SegFormer/TerraWatch cascade

---

# 31. AI Pipeline Development Workflow

The AI pipeline must be implemented incrementally.

Target:

```text
SegFormer
    ↓
Uncertainty
    ↓
TerraWatch
    ↓
Risk
    ↓
LLM
```

Do not implement the entire pipeline at once.

Preferred sequence:

```text
SegFormer inference
    ↓
Test

Uncertainty generation
    ↓
Test

Artifact persistence
    ↓
Test

TerraWatch inference
    ↓
Test

Pipeline chaining
    ↓
Test

Structured metrics
    ↓
Test

LLM context assembly
    ↓
Test

Report generation
    ↓
Test

Report validation
    ↓
Test
```

---

# 32. AI Numerical Truth

The AI/LLM layer must not invent numerical values.

Authoritative values come from:

```text
Raster processing
SegFormer
TerraWatch
PostGIS
Structured metrics
```

The LLM is responsible for interpretation and communication.

It is not the source of:

* Risk scores
* Coordinates
* Areas
* Uncertainty values
* Elevation
* Slope
* Model metrics

---

# 33. Uncertainty-Aware Reporting

If uncertainty materially affects a prediction, the reporting layer must
reflect it.

Conceptually:

```text
High Risk
    +
High Uncertainty
    ↓
Report must communicate uncertainty
```

A high-risk prediction should not automatically be described as a
high-confidence conclusion.

The exact thresholds must be defined and validated when the reporting
pipeline is implemented.

---

# 34. Performance Workflow

Do not optimize prematurely.

Preferred:

```text
Implement
    ↓
Measure
    ↓
Identify bottleneck
    ↓
Optimize
    ↓
Measure again
```

Never add:

```text
Redis
Spark
GPU infrastructure
Distributed workers
Caching
```

simply because they might improve future performance.

---

# 35. Dependency Management

Before adding a dependency:

1. Check whether the functionality already exists.
2. Check whether an existing dependency provides it.
3. Determine whether the dependency belongs in the current phase.
4. Consider maintenance and security implications.
5. Add it only if justified.

Do not introduce multiple libraries for the same responsibility.

---

# 36. Security Workflow

For security-sensitive changes:

```text
Authentication
Authorization
Input validation
Storage access
Database access
Secrets
Logging
```

must be explicitly considered.

Never commit:

```text
.env
credentials
API keys
service account files
private keys
tokens
```

unless explicitly required and safe.

---

# 37. AI Coding Agent Behavior

AI agents must:

1. Read the canonical documentation.
2. Inspect the repository.
3. Identify the current phase.
4. Identify the exact requested step.
5. Modify only what is necessary.
6. Preserve existing architecture.
7. Run focused validation.
8. Report the result.
9. Stop.

AI agents must not:

* Skip phases
* Build future infrastructure
* Rewrite working modules unnecessarily
* Modify unrelated files
* Invent APIs
* Invent database fields
* Assume a feature exists
* Claim tests passed without running them
* Continue to the next step without confirmation

---

# 38. Handling Ambiguity

If the requested change is ambiguous:

Do not make a large assumption.

Instead:

```text
Identify ambiguity
    ↓
Inspect existing implementation
    ↓
Choose the smallest safe interpretation
```

Ask a clarification question when the ambiguity could materially change
the architecture or data model.

---

# 39. Handling Failures

When a test fails:

Do not immediately rewrite the implementation.

Use:

```text
Failure
 ↓
Read traceback/log
 ↓
Identify failing boundary
 ↓
Reproduce
 ↓
Determine root cause
 ↓
Make smallest fix
 ↓
Retest
```

Do not hide failures by weakening tests.

---

# 40. Root Cause First

When debugging, distinguish:

```text
Symptom
```

from:

```text
Root Cause
```

Example:

```text
Job remains RUNNING
```

is a symptom.

Possible root cause:

```text
Database transaction failed
    ↓
Exception handler attempted another commit
    ↓
PendingRollbackError
    ↓
FAILED state never persisted
```

Fix the root cause rather than patching the visible symptom.

---

# 41. Production Quality Standard

A feature is considered production-ready only when:

```text
Correct
+
Tested
+
Observable
+
Maintainable
+
Error-handled
+
Architecturally consistent
```

"Works once" is not sufficient.

---

# 42. Current Development Priority

At the time this workflow was established:

```text
Phase 2.3 — Raster Derivatives
```

Completed:

```text
Metadata
Hillshade
Slope
Aspect
Color Relief
```

Remaining:

```text
Contour
Clip
Merge
Reproject
```

Do not skip to Phase 3 or Phase 4 unless explicitly requested.

---

# 43. Current Step Discipline

When the user says:

```text
"next"
```

interpret it as:

```text
Continue with exactly one next implementation step
```

not:

```text
Implement the entire remaining phase
```

When the user says:

```text
"give me the full code"
```

provide the complete code for the current isolated file/change only,
unless the user explicitly requests multiple files.

---

# 44. Completion Protocol

At the end of every implementation step, report:

```text
🎯 Goal
What was implemented.

📁 File
Exact file modified.

✏️ Code
Complete code for the isolated change.

✅ Compile/Test
Exact commands executed or commands the user should run.

⛔ Stop
Explicitly stop before the next implementation step.

💡 Improvement
Any improvement implemented in the current step.
```

Never present a multi-step roadmap when the user requested an
implementation step.

---

# 45. Final Rule

GeoRisk AI development is governed by:

```text
Understand
    ↓
Inspect
    ↓
Plan one small change
    ↓
Implement
    ↓
Test
    ↓
Verify
    ↓
Document if necessary
    ↓
STOP
```

The goal is not to maximize the amount of code written per interaction.

The goal is to maximize:

```text
Correctness
+
Architectural integrity
+
Traceability
+
Testability
+
Long-term maintainability
```

while progressing steadily toward the GeoRisk AI production architecture.

