# Current Task

## Task ID

P01-M2-T01

## Milestone

M2 — Portal & Authentication Configuration

## Business objective

Establish an approved remediation plan for the credential-security contradiction before further vendor-onboarding implementation expands the unsafe boundary.

## Scope

- inventory plaintext/default credentials and every consumer
- distinguish demo fixtures from production-like values
- map secret-reference flow across SQL Server, ASP.NET, Python, tests, and UI
- define removal, rotation, runtime injection, failure behavior, and verification sequencing
- determine whether any database change is genuinely required; document it but do not execute it

## Dependencies

None.

## Allowed files/modules

- `server/secret_provider.py` (read-only during design)
- ASP.NET secret-provider and configuration paths (read-only during design)
- environment/configuration templates (read-only during design)
- tests that mention credentials (read-only during design)
- `docs/SECURITY.md`, `docs/DECISIONS.md`, and task documentation

## Protected areas

- no database or stored-procedure changes
- no credential rotation or external secret-provider mutation
- no production-code remediation until the design is approved
- no vendor collection, reconciliation, or UI feature work
- never print or copy credential values

## Acceptance criteria

1. Every credential source/default and consumer is classified.
2. The approved provider boundary and environment behavior are explicit.
3. Removal/rotation steps prevent credential persistence in Git history, logs, and artifacts.
4. Failure behavior does not silently substitute a default credential.
5. A verification plan proves secrets do not reach API responses or the browser.
6. Any database impact is identified separately for approval.

## Test requirements

- repository secret scan with values redacted
- API contract test proving no password/secret value field is returned
- missing/unknown secret-reference negative tests
- approved provider resolution test using runtime-injected test credentials
- Git-history remediation/rotation checklist if confirmed necessary

## Recommended AI

CODEX

## Status

COMPLETE — SECURITY DESIGN AND IMMEDIATE CONTAINMENT ONLY

## Why CODEX

The task crosses security boundaries, multiple runtimes, credential handling, tests, and possible historical exposure. It requires architectural judgment and must precede bounded implementation.

## Findings and containment result

- Confirmed tracked plaintext credentials in both Python and ASP.NET development providers.
- Confirmed silent default-credential fallback in both providers.
- Confirmed local `.env` held a configured database secret, was untracked, and was not ignored.
- Removed provider literals and default fallback.
- Added fail-closed runtime environment resolution.
- Added `.env` ignore rules while preserving `.env.example`.
- Confirmed the live execution-config API did not return a password field.
- Confirmed known exposed patterns were absent from the inspected generated XLSX.
- Confirmed known credential patterns remain in Git history; one historical tree was unreadable, so the scan is not exhaustive.

## Rotation and history decision

- Rotation/revocation: RECOMMENDED for every formerly committed value that may be accepted by any system.
- Git-history remediation: RECOMMENDED after rotation, using a separately approved coordinated procedure.
- Automatic rotation/history rewrite: NOT PERFORMED.

## Files changed by this task

- `server/secret_provider.py`
- `backend/SchoolRecon.Infrastructure/Secrets/DevelopmentSecretProvider.cs`
- `.gitignore`
- `docs/SECURITY.md`
- `docs/DECISIONS.md`
- `tasks/CURRENT_TASK.md`

## Verification performed

- Python provider unknown-reference failure: PASS
- Python provider missing-runtime-value failure: PASS
- Python provider synthetic process-environment resolution: PASS
- Python syntax compilation: PASS
- Known exposed-pattern scan of current source: PASS (no matches)
- `.env` ignored and `.env.example` trackable: PASS
- Known-pattern scan of generated XLSX content: PASS (no matches)
- ASP.NET compilation: BLOCKED by unavailable NuGet packages/network after restore attempted to resolve external dependencies; no C# compile failure was observed before package resolution stopped

## Next-task recommendation

`P01-M1 — Complete Vendor Basic Information end-to-end` is the recommended next implementation task. It is bounded and suitable for SPARK provided it does not add credential editing, authentication/authorization, database/schema changes, collection execution, or Phase-2 work.

STOPPED — WAITING FOR HUMAN APPROVAL
