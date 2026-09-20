# System Architecture Specification

## 1. End-to-End System Topology
```text
+-------------------------------------------------------------------------------+
|                             CLIENT / FRONTEND                                 |
|   React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + SignalR Client  |
+-------------------------------------------------------------------------------+
                                      ▲ (REST / WebSockets)
                                      ▼
+-------------------------------------------------------------------------------+
|                       API GATEWAY & BACKEND SERVICES                          |
|   ASP.NET Core (.NET 8/9) Controller APIs + SignalR Realtime Hub              |
+-------------------------------------------------------------------------------+
       |                          |                             |
       ▼                          ▼                             ▼
+---------------+        +------------------+         +-------------------+
|  SQL Server   |        | RabbitMQ Broker  |         |   Redis Cluster   |
|  2022 Primary |        | (AMQP Queues)    |         | (Caching/Session) |
+---------------+        +------------------+         +-------------------+
                                  |
                +-----------------+-----------------+
                |                                   |
                ▼                                   ▼
    +-----------------------+           +-----------------------+
    | Playwright Workers    |           | Reconciliation Engine |
    | (Portal Crawlers)     |           | (Rule-Based Matcher)  |
    +-----------------------+           +-----------------------+
                |                                   |
                ▼                                   ▼
    +-----------------------+           +-----------------------+
    | MinIO S3 Store        |           | AI Investigation Agent|
    | (SHA-256 Evidence)    |           | (Advisory Root-Cause) |
    +-----------------------+           +-----------------------+
```

## 2. Component Responsibilities
1. **Frontend (React 18 SPA):**
   - 16 operational screens (Dashboard, Live Monitor, Exception Center, 3-Column Workspace, Matching View, Vendor Config, Artifact Center, Audit Trail, etc.).
   - Service abstraction layer (`reconService.ts`) and pub/sub event bus (`realtimeHub.ts`).
2. **Backend API (ASP.NET Core):**
   - Exposes RESTful endpoints for dashboard telemetry, runs, exceptions, vendor configuration, and artifacts.
   - Hosts the SignalR hub (`/hubs/recon`) broadcasting real-time progress and worker telemetry.
3. **Storage & Evidence:**
   - **SQL Server 2022:** Transactional ledgers, reconciliation runs, institutions, vendors, and audit events.
   - **MinIO S3:** Cryptographically hashed (SHA-256) original XLSX, CSV, and JSON settlement statements.
4. **Message Broker (RabbitMQ):**
   - Orchestrates queues: `vendor.collection`, `file.processing`, `reconciliation.pipeline`, `ai.investigation`, and `dead.letter`.
