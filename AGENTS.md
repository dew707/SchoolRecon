# SchoolRecon Working Rules

## Required context

Before working on a task, read:

1. `docs/PROJECT.md`
2. `docs/CURRENT_STATUS.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATABASE.md`
5. `docs/BUSINESS_RULES.md`
6. `docs/DECISIONS.md`
7. the relevant phase file under `tasks/`
8. `tasks/CURRENT_TASK.md`

Inspect only the source files needed for the authorized task. Do not treat mock UI, simulated telemetry, generated artifacts, or static contract checks as proof of live behavior.

## Roles

### CODEX

Primary responsibilities:

- architecture and cross-module analysis
- database-impact review
- security-sensitive design
- complex backend or process design
- architectural gap analysis
- review of changes affecting multiple modules

### GEMINI / SPARK

Primary responsibilities:

- bounded implementation tasks
- UI changes and forms
- validation and CRUD
- straightforward API integration
- small bug fixes
- implementation within already-approved architecture

Gemini/Spark must not independently redesign the database, system architecture, authentication, credential architecture, or reconciliation architecture. When implementation discovers a problem in one of those areas, stop that portion and report:

`ARCHITECTURE_REVIEW_REQUIRED`

## Protected areas

- Database changes require a separately approved architecture task.
- Never create, alter, rename, or remove database objects unless the current approved task explicitly permits it.
- Never expose or persist plaintext credentials in React, API responses, logs, screenshots, source code, Markdown, or Git.
- Do not run migrations or deployment scripts during an audit.
- Do not silently fall back from the approved SQL Server/ASP.NET runtime to mock or SQLite behavior.
- AI may advise on portal changes but must not autonomously change connector rules, credentials, financial data, or reconciliation results.

## Task ownership

Every implementation task must declare:

- Task ID
- Milestone
- Business objective
- Scope
- Dependencies
- Allowed files/modules
- Protected areas
- Acceptance criteria
- Test requirements
- Recommended AI (`SPARK` or `CODEX`)
- Status

Prefer small end-to-end vertical slices. A business operation is incomplete when only its UI, API, service, or database layer works.

## Truthfulness and completion

Classify capabilities as `UI_ONLY`, `MOCKED`, `IMPLEMENTED`, `TESTED`, or `LIVE_VERIFIED`. A simulated success message is not verification. A database object that is not used by the application is an application implementation gap, not a database gap.

After an approved implementation task, run proportionate tests and update the canonical status and test documentation. Stop after the authorized task; do not begin the next task automatically.
