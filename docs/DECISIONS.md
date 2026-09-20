# Architecture Decision Records (ADRs)

## ADR-001: Headless Playwright for Vendor Portal Automation
* **Context:** Most school collection vendors in Bangladesh lack modern REST APIs and deliver statements through authenticated web portals.
* **Decision:** Deploy containerized headless Playwright (Chromium) workers managed via RabbitMQ queues.
* **Consequences:** Enables fully automated crawls while isolating browser execution from API web servers.

## ADR-002: Advisory-Only Boundary for AI Investigations
* **Context:** AI models can hallucinate or misclassify ambiguous ledger records.
* **Decision:** AI agents investigate and recommend resolutions, but are strictly prohibited from mutating financial ledger balances without explicit operator sign-off.
* **Consequences:** Guarantees full audit compliance and financial non-repudiation.

## ADR-003: MinIO S3 for Cryptographic Evidence Storage
* **Context:** Financial audits require immutable original statements to settle disputes.
* **Decision:** Archive every downloaded file in an S3-compatible object store (MinIO) paired with SHA-256 hashes in SQL Server.
* **Consequences:** Tamper-proof record-keeping independent of vendor portal retention policies.

## ADR-004: Repository & Realtime Hub Abstraction in Frontend
* **Context:** The frontend was implemented prior to ASP.NET Core backend completion.
* **Decision:** Decouple the UI behind `ReconServiceContract` and `RealtimeHub` event emitters.
* **Consequences:** Backend integration requires changing only service implementations without rewriting UI components.

## ADR-005: Implementation Truthfulness Standard & Feature Classification
* **Context:** In enterprise systems with simulated or decoupled backends, developers may mistake UI mocks for operational backend services.
* **Decision:** Enforce strict classification of all features (`UI_ONLY`, `MOCKED`, `IMPLEMENTED`, `TESTED`, `LIVE_VERIFIED`). Never mark tests as `PASS` without explicit verification.
* **Consequences:** Provides clear visibility into current system readiness and prevents premature deployment assumptions.

## ADR-006: Disqualification of SQLite from Acceptance Criteria & Formalization of M2 Acceptance Prerequisites
* **Context:** In Milestone 2, a temporary SQLite database and Python/FastAPI mock server were introduced to facilitate offline development and frontend testing. However, the system architecture explicitly specifies Microsoft SQL Server 2022 and ASP.NET Core 8 with Dapper repositories executing real stored procedures. The test suite previously ran against SQLite while masking it under SQL Server labels.
* **Decision:**
  1. Formally disqualify SQLite from the Milestone 2 acceptance path. SQLite may only exist as an uncommitted local development mock.
  2. Remove all misleading "SQL Server" claims from mock services (`server/vendor_collection_agent.py`, `server/api_server.py`, and test logs).
  3. Introduce `tests/test_sqlserver_acceptance.py` as the strict acceptance gate. This test asserts zero SQLite acceptance, checks live SQL Server availability (port 1433), checks `.NET` SDK availability, and statically validates stored procedure parity.
  4. Enforce that Milestone 3 will not be initiated until an actual SQL Server instance (e.g. via Docker or hosted instance) and the .NET runtime are available to pass the M2 acceptance gate.
* **Consequences:** Restores complete architectural and verification integrity per the GEMINI.md Truthfulness Protocol. Prevents false claims of completion and ensures enterprise-grade compliance.
