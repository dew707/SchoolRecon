# SchoolRecon — Milestone 2 (M2) Runtime Acceptance Guide

**Standard:** Full adherence to GEMINI.md Implementation Truthfulness Protocol & ADR-006  
**Scope:** Verification of Microsoft SQL Server 2022 Persistence + ASP.NET Core 8 & Dapper Data Access Layer  

---

## Overview

This guide provides concrete, step-by-step instructions for an engineer executing the Milestone 2 (M2) runtime acceptance procedure on a machine or server equipped with:
1. **Git**
2. **.NET 8 SDK** (`dotnet` CLI)
3. **Microsoft SQL Server 2022** (native instance or containerized via Docker)

> **Important Note on Environment Constraints:**  
> In sandbox environments lacking Docker, a running SQL Server engine, or the .NET 8 SDK, the M2 acceptance suite will fail fast with `BLOCKED: DOTNET_NOT_AVAILABLE` or `BLOCKED: SQLSERVER_UNREACHABLE`. SQLite has been formally disqualified from the acceptance path per ADR-006 and will never satisfy M2 runtime acceptance.

---

## 1. Clone / Pull the Repository

Ensure you have the latest code from the repository:

```bash
git clone <repo-url> school-recon
cd school-recon
```

---

## 2. Configure Environment Variables

Copy `.env.example` to `.env` and set your SQL Server parameters:

```bash
cp .env.example .env
```

Edit `.env` to configure your SQL Server instance:

```bash
# Microsoft SQL Server Configuration
SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_DATABASE=SchoolRecon
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=YourStrong!Password2026
SQLSERVER_ENCRYPT=false
SQLSERVER_TRUST_SERVER_CERTIFICATE=true

# API Configuration
ASPNETCORE_URLS=http://localhost:5000
ASPNETCORE_ENVIRONMENT=Development
```

> **Security Rule:** Never commit `.env` or real passwords to source control.

---

## 3. Configure Microsoft SQL Server

If using Docker to host SQL Server 2022, start an instance:

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong!Password2026" \
   -p 1433:1433 --name schoolrecon-sql \
   -d mcr.microsoft.com/mssql/server:2022-latest
```

Verify that SQL Server is listening on port 1433:

```bash
nc -zv localhost 1433
```

---

## 4. Deploy Database Schema & Stored Procedures

Deploy the 12 relational tables, 23 stored procedures, and seed data using `sqlcmd`:

```bash
cd database/migrations-or-deployment
sqlcmd -S localhost,1433 -U sa -P "YourStrong!Password2026" -Q "IF DB_ID('SchoolRecon') IS NULL CREATE DATABASE [SchoolRecon];"
sqlcmd -S localhost,1433 -U sa -P "YourStrong!Password2026" -d SchoolRecon -i deploy_all.sql
cd ../..
```

The database will now contain:
- **12 Relational Tables**: `Vendor`, `VendorCredentialReference`, `VendorConnector`, `VendorNavigationStep`, `VendorReportDefinition`, `VendorReportParameter`, `School`, `VendorSchoolMapping`, `VendorCollectionJob`, `VendorCollectionEvent`, `VendorArtifact`, `AuditLog`.
- **23 T-SQL Stored Procedures**: `sp_Vendor_GetAll`, `sp_Vendor_GetById`, `sp_Vendor_Create`, `sp_Vendor_Update`, `sp_VendorNavigationStep_Save`, etc.
- **Initial Seed Data**: TransBingo Demo vendor (`VEND-01`), 13 navigation steps, and 3 school mappings.

---

## 5. Restore .NET Packages

Restore NuGet dependencies for the backend solution:

```bash
cd backend
dotnet restore SchoolRecon.sln
cd ..
```

---

## 6. Build the Backend

Compile the solution in Release mode:

```bash
cd backend
dotnet build SchoolRecon.sln --no-restore -c Release
cd ..
```

Ensure 0 errors and 0 warnings.

---

## 7. Start the Real ASP.NET Core API

Start the API service:

```bash
source .env
dotnet run --project backend/SchoolRecon.Api -c Release
```

Verify that the API is running:
- Liveness check: `curl -s http://localhost:5000/health` (Expects: `{"status":"HEALTHY",...}`)
- SQL Server Readiness check: `curl -s http://localhost:5000/health/ready` (Expects: `{"status":"READY","database":"HEALTHY",...}`)

---

## 8. Execute the One M2 Runtime Verification Command

To run the complete, automated 22-step verification procedure:

### On Linux / macOS:
```bash
./scripts/verify_m2_runtime.sh
```

### On Windows (PowerShell):
```powershell
.\scripts\verify_m2_runtime.ps1
```

The verification script executes all 22 sequential validation steps:
1. `[STEP 1/22]` Verify `dotnet` CLI exists.
2. `[STEP 2/22]` Verify .NET 8 SDK compatibility.
3. `[STEP 3/22]` Verify SQL Server host/port is reachable.
4. `[STEP 4/22]` Verify SQL Server authentication.
5. `[STEP 5/22]` Verify target database availability.
6. `[STEP 6/22]` Deploy/verify `database/migrations-or-deployment/deploy_all.sql`.
7. `[STEP 7/22]` Verify required 12 database tables.
8. `[STEP 8/22]` Verify all 23 expected T-SQL stored procedures.
9. `[STEP 9/22]` Run `dotnet restore`.
10. `[STEP 10/22]` Run `dotnet build`.
11. `[STEP 11/22]` Start real ASP.NET Core API.
12. `[STEP 12/22]` Verify `/health` and `/health/ready` endpoints.
13. `[STEP 13/22]` Execute real read API call (`GET /api/vendors/VEND-01` via Dapper).
14. `[STEP 14/22]` Read vendor execution configuration from SQL Server.
15. `[STEP 15/22]` Update a safe property via real API (`PUT /api/vendors/VEND-01/navigation-steps`).
16. `[STEP 16/22]` Reload updated configuration via real API.
17. `[STEP 17/22]` Confirm persistence in SQL Server.
18. `[STEP 18/22]` Verify complete `/api/vendors/VEND-01/execution-config` payload structure.
19. `[STEP 19/22]` Run Vendor Collection Agent consuming live SQL Server configuration.
20. `[STEP 20/22]` Verify collection job, events, and artifact metadata persisted to SQL Server.
21. `[STEP 21/22]` Run previous Vendor Collection regression tests.
22. `[STEP 22/22]` Return final M2 runtime result: `M2 RUNTIME ACCEPTANCE: PASS`.

---

## 9. Interpreting Results

- **`M2 RUNTIME ACCEPTANCE: PASS`**:  
  All 22 verification steps completed successfully. The application has executed live through ASP.NET Core -> Application Service -> Dapper Repository -> T-SQL Stored Procedure -> Microsoft SQL Server. Milestone 2 is officially `RUNTIME ACCEPTED`. Milestone 3 may begin.

- **`BLOCKED: <REASON>`**:  
  An environmental prerequisite is missing (e.g., .NET 8 SDK not installed, SQL Server unreachable, bad credentials). Fix the environment prerequisite and re-run.

- **`FAILED: <REASON>`**:  
  An assertion or execution failed during runtime. See troubleshooting section below.

---

## 10. Troubleshooting Common Failures

| Blocker / Failure Message | Root Cause | Solution |
| :--- | :--- | :--- |
| `BLOCKED: DOTNET_NOT_AVAILABLE` | .NET 8 SDK is not installed in PATH. | Install .NET 8 SDK from [dot.net](https://dotnet.microsoft.com/download/dotnet/8.0). |
| `BLOCKED: SQLSERVER_UNREACHABLE` | SQL Server is not running or firewall blocks port 1433. | Check Docker container (`docker ps`) or start SQL Server service. Verify `SQLSERVER_HOST` and `SQLSERVER_PORT`. |
| `BLOCKED: SQL_AUTHENTICATION_FAILED` | Incorrect `SQLSERVER_USER` or `SQLSERVER_PASSWORD`. | Update credentials in `.env` to match your SQL Server `sa` password. |
| `FAILED: DATABASE_DEPLOYMENT_FAILED` | Schema script syntax error or missing permissions. | Inspect `deploy_all.sql`. Ensure user has `db_owner` or `CREATE TABLE` / `CREATE PROCEDURE` permissions. |
| `FAILED: API_HEALTH_CHECK_FAILED` | API crashed on startup or `/health/ready` returned 503. | Inspect `/tmp/schoolrecon_api.log`. Ensure SQL Server connection string is valid and database is accessible. |
| `FAILED: DAPPER_EXECUTION_FAILED` | Stored procedure error or mapping mismatch. | Run `sqlcmd` to test procedure directly (`EXEC sp_Vendor_GetById 'VEND-01'`). |
| `FAILED: CONFIGURATION_PERSISTENCE_FAILED` | Stored procedure failed to persist updated steps. | Check SQL Server transaction log and ensure `sp_VendorNavigationStep_Save` is properly deployed. |
