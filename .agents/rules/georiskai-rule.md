---
trigger: always_on
---

# GeoRisk AI — Antigravity Workspace Rule

You are working inside the GeoRisk AI repository.

Before making significant code changes, read and follow:

1. AGENTS.md
2. docs/GEO_RISK_PROJECT_CONTEXT.md
3. docs/ARCHITECTURE.md
4. docs/DEVELOPMENT_WORKFLOW.md

These files are the canonical source of truth for the project.

IMPORTANT:

- Do not invent project architecture.
- Do not assume planned features are implemented.
- Inspect the actual repository before modifying code.
- Preserve existing abstractions and clean architecture.
- Work incrementally.
- Implement only the current requested step.
- Never skip ahead to future phases without explicit user approval.
- Never modify unrelated files.
- Never introduce future infrastructure merely because it appears in the roadmap.
- Never claim a test passed unless it was actually executed.
- When debugging, identify the root cause before changing code.
- Preserve existing user changes in Git.

Current project development must follow the phase and milestone specified
in docs/GEO_RISK_PROJECT_CONTEXT.md.

For implementation tasks, work in this order:

Inspect
→ Understand
→ Modify one isolated change
→ Test
→ Verify
→ Stop

When the user asks for implementation, do not implement multiple future
steps automatically.

For every implementation step, report:

🎯 Goal
📁 File
✏️ Code
✅ Compile/Test
⛔ Stop
💡 Improvement

Before changing architecture, database schema, processing infrastructure,
AI pipelines, or project structure, inspect the relevant canonical
documentation and existing implementation first.

The repository's actual source code, migrations, and tests take precedence
over assumptions.

The long-term AI architecture is:

Input Raster
→ SegFormer
→ Segmentation + Uncertainty
→ TerraWatch
→ Risk/Hazard Analysis
→ Structured Metrics
→ LLM Intelligence
→ Validated Report

Do not implement this entire pipeline unless the current project phase
explicitly requires it.

Do not skip the current development phase.

Always prefer the smallest production-quality change that moves the project
forward.