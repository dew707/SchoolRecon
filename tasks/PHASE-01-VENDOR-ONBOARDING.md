# Phase 01 — Vendor / Report Source Onboarding and Verification

**Audit date:** 22 September 2026  
**Overall status:** PARTIAL, with M6 and M7 incorrect and M8 missing  
**Implementation authorization:** none; this file is planning and audit documentation only

## Status summary

| Milestone | Status |
|---|---|
| M1 — Vendor Basic Information | PARTIAL |
| M2 — Portal & Authentication Configuration | PARTIAL |
| M3 — Report Location / Navigation Configuration | PARTIAL |
| M4 — Report Parameter Configuration | PARTIAL |
| M5 — Report Collection Configuration | PARTIAL |
| M6 — Configuration Test / Verification | INCORRECT |
| M7 — Sample Report Retrieval & Inspection | INCORRECT |
| M8 — Vendor Ready-for-Reconciliation Gate | MISSING |

## M1 — Vendor Basic Information

### P01-M1-T01 — Complete vendor creation as one vertical slice

- **Task ID:** P01-M1-T01
- **Milestone:** M1
- **Business objective:** create a vendor and immediately retrieve/display the persisted result.
- **Scope:** Add Vendor form → client service → API validation → existing application/repository → existing `sp_Vendor_Create` → response → vendor list → tests.
- **Dependencies:** security task P01-M2-T01 need not block basic non-credential creation; required vendor fields must be confirmed.
- **Allowed files/modules:** vendor management page, frontend types/service, vendor DTO/service/controller, tests.
- **Protected areas:** database schema/procedures; authentication/credential design; reconciliation.
- **Acceptance criteria:** no mock-only success; duplicate/invalid data is surfaced; reload proves SQL persistence.
- **Test requirements:** frontend behavior, API validation, live SQL create/read test using disposable approved test data and cleanup plan.
- **Recommended AI:** SPARK
- **Status:** NOT STARTED

### P01-M1-T02 — Complete vendor edit/status flow

End-to-end bind and persist name, portal URL, connector type, and active state with concurrency feedback. Use existing schema/API. **Recommended AI: SPARK. Status: NOT STARTED.**

## M2 — Portal & Authentication Configuration

### P01-M2-T01 — Security and credential-boundary remediation design

- **Task ID:** P01-M2-T01
- **Milestone:** M2
- **Business objective:** remove credential exposure and define the approved development/production secret-provider boundary without redesigning it during this audit.
- **Scope:** analyze plaintext source credentials, defaults, secret-reference reads, API exposure, runtime injection, test fixtures, and rotation implications; produce an approved remediation plan before code changes.
- **Dependencies:** none.
- **Allowed files/modules:** security documentation and read-only review of secret-provider/configuration paths.
- **Protected areas:** no credential migration, schema change, source remediation, or secret rotation in the design task.
- **Acceptance criteria:** every plaintext/default credential location and consumer is accounted for; remediation sequencing and verification are explicit.
- **Test requirements:** secret scanning plan and runtime credential-resolution test plan.
- **Recommended AI:** CODEX
- **Status:** RECOMMENDED NEXT TASK

### P01-M2-T02 — Implement approved credential metadata configuration slice

After P01-M2-T01 approval, implement authentication type and secret-reference metadata UI/API persistence inside the approved architecture. **Recommended AI: SPARK unless architecture changes are required. Status: BLOCKED BY P01-M2-T01.**

## M3 — Report Location / Navigation Configuration

### P01-M3-T01 — Navigation workflow editor vertical slice

Provide ordered add/edit/remove/activate controls, validation, existing API persistence, reload, and worker-consumption proof. Do not alter schema. **Recommended AI: SPARK. Status: NOT STARTED.**

### P01-M3-T02 — Connector configuration vertical slice

Use the dedicated connector contract for login URL, connector name/type, timeout, retries, and active state. **Recommended AI: SPARK. Status: NOT STARTED.**

## M4 — Report Parameter Configuration

### P01-M4-T01 — Report definition and dynamic parameter editor

Implement UI → existing report API → stored procedures → reload for ordered, vendor-specific parameters and file expectations. Review replacement/deletion semantics before implementation; stop with `ARCHITECTURE_REVIEW_REQUIRED` if existing procedures cannot safely express the desired behavior. **Recommended AI: SPARK. Status: NOT STARTED.**

## M5 — Report Collection Configuration

### P01-M5-T01 — School mapping editor and job input resolution

Expose existing school mappings, validate selected mappings, and remove the hard-coded `SCH-004` job behavior. **Recommended AI: SPARK. Status: NOT STARTED.**

### P01-M5-T02 — Worker orchestration architecture

Define how ASP.NET job creation dispatches an approved deterministic Playwright worker, how status/events/artifacts return, and how mock mode is isolated. RabbitMQ/SignalR/MinIO choices must be reconciled with current code. **Recommended AI: CODEX. Status: NOT STARTED.**

## M6 — Configuration Test / Verification

### P01-M6-T01 — Verification evidence and configuration-version design

Define durable test-run identity, configuration snapshot/version, required step outcomes, failure reasons, artifact linkage, and invalidation. This includes a database-gap review but no database change without separate approval. **Recommended AI: CODEX. Status: BLOCKED BY P01-M2-T01 AND P01-M5-T02.**

### P01-M6-T02 — Truthful targeted and full-test execution

Replace fixed/simulated success with portal, login, navigation, parameter, generation, download, validation, and retention outcomes from the approved worker. **Recommended AI: SPARK within approved architecture. Status: BLOCKED BY P01-M6-T01.**

## M7 — Sample Report Retrieval & Inspection

### P01-M7-T01 — Retain and inspect an actual collected sample

Persist original bytes and validated metadata, then render safe inspection evidence. Synthetic workbook generation must remain explicitly demo-only. **Recommended AI: SPARK. Status: BLOCKED BY P01-M6-T02.**

## M8 — Vendor Ready-for-Reconciliation Gate

### P01-M8-T01 — Readiness gate architecture and database approval

Define pass criteria, current-configuration linkage, expiry/invalidation, operator visibility, and enforcement before future reconciliation selection. This is a documented database gap and requires architecture approval. **Recommended AI: CODEX. Status: BLOCKED BY P01-M6-T01.**

### P01-M8-T02 — Implement the approved readiness gate

Implement the approved database/API/UI/worker vertical slice and prove an unverified or stale configuration cannot be selected. **Recommended AI: SPARK after approval. Status: BLOCKED BY P01-M8-T01.**

## Phase completion gate

Phase 1 is complete only when one vendor can be created/configured across all required dimensions, tested through a real supported connector with durable step evidence, retain an original validated report, and become eligible only through an enforced current verification result.
