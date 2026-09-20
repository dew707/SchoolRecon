# Product Roadmap & Delivery Milestones

## Phase 1: Operational Frontend & UX Reference Implementation (Completed)
- [x] Implement all 16 screens based on UX design reference.
- [x] Design token implementation: Navy `#071A36`, Primary `#1267E8`, Canvas `#F5F7FA`, BDT currency formatting (`৳`).
- [x] Domain types and interfaces (`src/types/index.ts`).
- [x] Seed realistic mock datasets (148 schools, 12 vendors, 616 exceptions).
- [x] Interactive service and SignalR hub abstractions (`reconService.ts`, `realtimeHub.ts`).
- [x] Standalone browser distribution bundle (`standalone_app.html`).

## Phase 2: Vendor Collection Agent & 10-Point Configuration (Completed)
- [x] Extend Vendor Configuration with 10 features:
  1. Secure Credential Configuration (Vault integration).
  2. Authentication Configuration (Form/Playwright selectors).
  3. Browser Navigation Workflow Configuration (DOM targets & wait timeouts).
  4. Report Configuration (XLSX, sheet name, schema columns).
  5. School & Date Parameter Configuration (`ABC_INT`, `YYYY-MM-DD`).
  6. Test Login action with live telemetry.
  7. Test Navigation action with DOM assertion.
  8. Test Download action.
  9. Run Full Test action with real XLSX ingestion.
  10. Live Browser-Agent Execution Telemetry panel.
- [x] Python Demo Vendor Portal (`demo_vendor_portal.py` on port 8085).
- [x] Playwright/Python Vendor Collection Agent (`vendor_collection_agent.py`) with real XLSX generation and SHA-256 calculation.
- [x] Extended AI Agent Center with Browser Collection Supervisor.

## Phase 3: ASP.NET Core Backend & SQL Server Ingestion (In Progress)
- [ ] Implement ASP.NET Core Web API controllers mapping to `reconService.ts`.
- [ ] Deploy SQL Server 2022 database schema and migration scripts.
- [ ] Connect HashiCorp Vault SDK for production AppRole token resolution.

## Phase 4: Production Queue Orchestration & SignalR Real-Time Hub
- [ ] Deploy RabbitMQ worker consumers for parallel portal crawls.
- [ ] Replace simulated `realtimeHub.ts` with real `@microsoft/signalr` client.
- [ ] Wire MinIO S3 object storage for multi-terabyte evidence archiving.

## Phase 5: Pilot Rollout & Operations Sign-Off
- [ ] Pilot with initial 5 schools (ABC School, DPS School, Uttara Model, Scholastica, XYZ School).
- [ ] End-to-end 3-way matching pilot with acquiring banks (bKash, Nagad, City Bank).
- [ ] Bangladesh Bank regulatory reporting compliance audit.
