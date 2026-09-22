# Current Task

## Task ID

P01-M2-T02 — Vendor Basic Information End-to-End

## Milestone

Phase 1 — Vendor onboarding, basic information slice

## Business objective

Persist vendor identity and operational status through React, ASP.NET Core, Dapper, existing stored procedures, and SQL Server, then reload the saved values.

## Scope

- list and retrieve vendors
- create and update vendor code/name/portal URL/connector type/active state
- retain existing RowVersion concurrency behavior
- server-side validation and useful API errors
- loading, saving, success, validation, and API-error states in the existing React screens
- no mock fallback for vendor CRUD

## Protected areas

- no credential-management changes or secret values in the browser
- no database schema changes or migrations
- no connector, collection, reconciliation, AI, or Phase 2/M3 implementation

## Status

IMPLEMENTED, TESTED, and LIVE_VERIFIED; RUNTIME ACCEPTED: PASS

## Verified results

- ASP.NET restore/build: PASS with 0 warnings and 0 errors.
- Frontend TypeScript/Vite production build: PASS.
- Focused vendor controller/service/security tests: PASS (16 tests).
- SQL Server acceptance checks: PASS.
- SQLite remains disqualified, .NET is available, and Dapper/stored-procedure static contract checks pass.
- The complete HTTP/API → ASP.NET Core → application service → Dapper → stored procedure → Docker SQL Server path passed for list, create, read, update, reload, duplicate rejection, validation, concurrency, and both active-state transitions.
- Independent `dbo.Vendor` queries confirmed create/update persistence, duplicate count remained one, and retrieval passed after restarting only the ASP.NET API.
- No schema or stored-procedure changes were required.
- No credential provider behavior was changed; unknown secret references remain fail-closed.

## Runtime acceptance evidence

Docker container `schoolrecon-sql` was running SQL Server 2022 at `localhost:1433` against the `SchoolRecon` database. Runtime configuration was injected from the approved untracked local environment file without exposing or committing the credential. The clearly named acceptance record `T02ACC20260922213835` remains because no approved delete API or cleanup stored procedure exists.

## Next-task recommendation

Update the Phase 1 plan/task identifiers so the next approved bounded slice is explicit; do not begin T03 without a separately authorized task.

STOPPED — P01-M2-T02 final acceptance complete.
