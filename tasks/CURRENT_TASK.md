# Current Task

## Task ID

P01-M2-T03 — Portal & Authentication Configuration End-to-End

## Milestone

Phase 1 — Vendor onboarding, portal and authentication configuration slice

## Business objective

Persist vendor portal connector settings and credential-reference metadata per Vendor + Environment through React, ASP.NET Core, Dapper, stored procedures, and SQL Server without storing or exposing credential values.

## Scope

- load and save connector settings
- load and save credential-reference metadata by Vendor + Environment
- support approved authentication types and the development secret provider
- retain Vendor RowVersion concurrency protection
- validate URLs and reference metadata
- reload from the API with no mock fallback

## Dependencies

- P01-M2-T02 is live verified
- existing connector and credential-reference tables
- Docker SQL Server 2022 `SchoolRecon` database

## Allowed files/modules

- vendor configuration React page, service, and types
- vendor configuration API/application/domain/repository files
- focused tests
- approved credential-reference stored procedures and deployment include
- canonical current-task/status documentation

## Protected areas

- never store or return credential values, passwords, API keys, tokens, PINs, OTPs, or resolved secrets
- no table redesign; identity remains Vendor + Environment
- no ad-hoc SQL or parallel persistence path
- no collection, reconciliation, AI, T04, Phase 2, or M3 implementation

## Acceptance criteria and tests

- real HTTP/API → service → Dapper → stored procedure → SQL Server save/reload
- validation, nonexistent vendor, and stale RowVersion rejection
- stale writes preserve newer metadata
- persistence survives API restart
- responses expose reference metadata only
- backend build/tests, frontend build, runtime SQL checks, and final security/diff review

## Recommended AI

CODEX

## Status

IMPLEMENTED, TESTED, and LIVE_VERIFIED; RUNTIME ACCEPTED: PASS

## Verified results

- Connector and Vendor + Environment reference metadata passed real API and independent SQL checks.
- URL, authentication type/provider, and required-reference validation passed.
- A stale save returned HTTP 409 and did not overwrite newer SQL data.
- Retrieval after restarting only the API proved persistence was not application-memory based.
- Responses contained reference metadata only; actual portal authentication was not executed.

STOPPED — P01-M2-T03 acceptance complete. Do not begin T04 without separate authorization.
