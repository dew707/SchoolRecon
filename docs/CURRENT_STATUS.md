# SchoolRecon — Current Implementation Status

**Status Audit Date:** 22 September 2026
**Standards:** Full adherence to GEMINI.md Truthfulness Protocol & ADR-006  
**Milestone Gate:** M2 Acceptance FAILED (M3 Blocked)

---

## 1. Feature Classification Matrix

| Feature / Component | Classification | Description & Evidence |
| :--- | :--- | :--- |
| **16 Operational UI Screens** | `IMPLEMENTED` & `TESTED` | All 16 screens render in React 18 / Tailwind with full routing, responsive drawer, and global search (`⌘K`). Verified in browser bundle. |
| **Design System & BDT Formatting** | `IMPLEMENTED` & `TESTED` | Dark navy sidebar (`#071A36`), brand blue (`#1267E8`), status semantics, and BDT currency formatting (`৳`). |
| **Recon Service Abstraction (`reconService.ts`)** | `MOCKED` | Implements `ReconServiceContract` with in-memory promises. Ready for replacement with ASP.NET Core REST APIs. |
| **Realtime SignalR Hub (`realtimeHub.ts`)** | `MOCKED` | Simulates WebSocket heartbeats and job telemetry via typed in-memory event bus. |
| **Demo Vendor Portal (`server/demo_vendor_portal.py`)** | `IMPLEMENTED` & `TESTED` | Local HTTP portal on port 8085 serving login, reports DOM, and generating real XLSX via `openpyxl`. |
| **Vendor Collection Agent (`server/vendor_collection_agent.py`)** | `IMPLEMENTED` & `TESTED` | Automates vault token resolution, portal auth, navigation, real XLSX download, and SHA-256 verification. |
| **Real XLSX Artifact Generation** | `TESTED` & `LIVE_VERIFIED` | Generated `report_18092026.xlsx` (79,199 bytes, 1,782 records, ৳8,712,990 sum, SHA-256: `5b44941314d3a71db24291fcab45fb935942cc93509bc171edf6f5da3a2a982d`). |
| **AI Investigation Supervisor UI** | `MOCKED` | Displays model telemetry (`gpt-4o-financial-recon-v3`), tool execution steps, and advisory recommendations. Backend OpenAI API call is simulated. |
| **SQL Server 2022 Schema & Stored Procedures** | `IMPLEMENTED` (Code Complete) | 12 relational tables (`database/tables/*.sql`) and 23 stored procedures (`database/stored-procedures/*.sql`). Verified 1:1 parameter parity with Dapper repositories. |
| **ASP.NET Core 8 & Dapper Data Access Layer** | `IMPLEMENTED` (Code Complete) | Clean Architecture solution (`backend/SchoolRecon.sln`) with 7 Dapper repositories calling real stored procedures. |
| **Vendor Basic Information CRUD** | `LIVE_VERIFIED` | React/API/service/repository path supports list, get, create, update, active-state changes, validation, and RowVersion conflicts. Focused tests pass and the real HTTP/Dapper/stored-procedure/SQL Server path passed runtime acceptance. |
| **Live SQL Server Persistence Runtime** | `LIVE_VERIFIED` (Vendor Basic Information scope) | Docker SQL Server 2022 at `localhost:1433` persisted the temporary T02 acceptance vendor across API restart. Broader system runtime acceptance is not implied. |
| **Live Dapper Stored Procedure Execution** | `LIVE_VERIFIED` (Vendor Basic Information scope) | ASP.NET/Dapper executed existing Vendor stored procedures for list, create, read, update, duplicate validation, concurrency, and status persistence. |
| **Development SQLite Persistence (`school_recon.db`)** | `MOCKED` (Disqualified) | Disqualified from acceptance path per ADR-006. Preserved strictly for offline local developer prototyping. |
| **RabbitMQ AMQP Broker** | `UI_ONLY` | Queue topology defined in `docs/ARCHITECTURE.md`; broker not yet deployed. |
| **MinIO S3 Object Evidence Store** | `UI_ONLY` | Architecture planned; local artifacts currently saved to `artifacts_storage/`. |

---

## 2. Verified Capabilities
- All 16 screens accessible with full interactive state transitions.
- 10-point Vendor Configuration panel tested with real step telemetry.
- Cryptographic SHA-256 calculation and schema validation executed and verified against real `.xlsx` files.
- Static verification confirms 100% parameter alignment across all 23 SQL Server stored procedures and 7 C# Dapper repositories.
- `test_sqlserver_acceptance.py` explicitly proves SQLite is rejected from the acceptance criteria.

---

## 3. Environment Blockers & Remaining Limitations
- **.NET SDK Available:** ASP.NET restore/build and focused vendor tests pass under .NET 8/9 tooling.
- **Vendor Basic Information Runtime Accepted:** The configured Docker SQL Server and ASP.NET/Dapper path passed the P01-M2-T02 acceptance sequence.
- **Milestone Scope:** This acceptance applies only to Vendor Basic Information. It does not accept credential configuration, collection execution, reconciliation, or M3 work.
