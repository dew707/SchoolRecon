# Current Task

## Task ID

P01-M2-T04 — Navigation Configuration End-to-End

## Milestone

Phase 1 — deterministic vendor portal navigation configuration

## Business objective

Persist the ordered workflow a future collection worker will execute, without implementing browser execution or storing credential values.

## Scope

- load and atomically save the complete workflow
- add, edit, duplicate, delete, enable/disable, and reorder steps
- validate actions, selectors, value sources, runtime variables, bounds, unique codes, and contiguous sequence
- use semantic credential-field references for username/password steps

## Dependencies

- P01-M2-T02 and P01-M2-T03 are live verified
- existing `VendorNavigationStep` table and connector relationship
- Docker SQL Server 2022 `SchoolRecon` database

## Allowed files/modules

- vendor configuration React page, frontend service, types, and non-runtime mock fixtures
- navigation DTO, validator, application mapping, repository, and focused tests
- navigation stored procedures and runtime verification script
- canonical current-task/status documentation

## Protected areas

- no table or enum redesign
- no credential values or resolved secrets
- no ad-hoc SQL persistence path
- no browser worker, test execution, T05, or reconciliation implementation

## Acceptance criteria and tests

- real React contract → HTTP API → application → Dapper → stored procedure → SQL Server path
- deterministic contiguous ordering and atomic batch replacement
- useful validation failures and fail-closed credential handling
- persistence across API restart and independent SQL verification
- backend build/tests, frontend build, runtime SQL checks, and final security/diff review

## Recommended AI

CODEX

## Status

IMPLEMENTED, TESTED, and LIVE_VERIFIED; RUNTIME ACCEPTED: PASS

## Verified results

- Existing workflow loaded and add/edit/duplicate/reorder/enable-disable/delete persisted through the real runtime.
- Invalid action, duplicate StepCode, and invalid runtime variable returned HTTP 400.
- A database constraint failure rolled back the full replacement transaction.
- API restart and an independent SQL query confirmed durable, contiguous persistence.
- Credential-related steps stored semantic references only; no resolved secrets appeared in API payloads.

STOPPED — P01-M2-T04 acceptance complete. Do not begin T05 without separate authorization.
