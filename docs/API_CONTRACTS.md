# API Contracts: React Frontend ↔ ASP.NET Core Backend

## 1. REST Endpoints

### Dashboard & Telemetry
- `GET /api/v1/recon/dashboard`  
  **Response:** `DashboardSummary` (KPIs, progress %, financial totals, live school table rows).
- `GET /api/v1/recon/health`  
  **Response:** Service health status, worker pool telemetry (8/8 portal workers), queue depths.

### Reconciliation Runs
- `GET /api/v1/recon/runs`  
  **Query:** `?date=...&status=...&page=...`  
  **Response:** List of `ReconRun` objects.
- `GET /api/v1/recon/runs/{id}`  
  **Response:** Specific `ReconRun` details.
- `GET /api/v1/recon/runs/{runId}/schools/{schoolId}`  
  **Response:** `SchoolReconRun` breakdown (Vendor vs System source cards, matching pills).

### Exceptions & Matching
- `GET /api/v1/recon/exceptions`  
  **Query:** `?school=...&type=...&status=...`  
  **Response:** Filtered `ReconException` list.
- `POST /api/v1/recon/exceptions/{id}/actions`  
  **Request:** `{ "action": "ACCEPT_FINDING" | "MANUAL_REVIEW" | "INVESTIGATE_MORE", "note": "..." }`  
  **Response:** `{ "success": true, "status": "Updated" }`
- `POST /api/v1/recon/matching/confirm`  
  **Request:** `{ "ruleId": "R004_STUDENT_AMOUNT_TIME", "vendorRef": "...", "systemRef": "..." }`  
  **Response:** `{ "success": true, "message": "Match posted" }`

### Vendor Collection Agent API
- `POST /api/v1/vendor/{id}/test-login`  
  **Response:** `{ "success": true, "steps": [ ... ], "sessionToken": "..." }`
- `POST /api/v1/vendor/{id}/test-navigation`  
  **Response:** `{ "success": true, "steps": [ ... ] }`
- `POST /api/v1/vendor/{id}/test-download`  
  **Request:** `{ "schoolCode": "ABC_INT", "date": "2026-09-18" }`  
  **Response:** `{ "success": true, "fileName": "...", "sha256": "..." }`
- `POST /api/v1/vendor/{id}/run-full-test`  
  **Request:** `{ "schoolCode": "ABC_INT", "date": "2026-09-18" }`  
  **Response:** `{ "success": true, "validation": { "rowCount": 1782, "totalAmount": 8712990, ... } }`

---

## 2. SignalR Real-Time Hub (`/hubs/recon`)
- **Server Events:**
  - `RunProgressUpdate`: Emitted every 5 seconds with batch completion percentage and active stage.
  - `SchoolJobProgress`: Emitted when an individual portal crawler begins or completes an action.
  - `BrowserAgentTelemetry`: Emitted during interactive diagnostic tests on Vendor Configuration.
  - `ArtifactIngested`: Emitted when a new validated XLSX/CSV statement is stored.
