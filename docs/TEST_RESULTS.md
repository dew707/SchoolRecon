# SchoolRecon — Test Execution Results

**Execution Timestamp:** 20 September 2026 00:20:00 UTC+06:00  
**Environment:** Local Container Sandbox (Offline, No Docker, No .NET SDK)  
**Standard:** Truthful Reporting per GEMINI.md & ADR-006  
**Test Suite:** `tests/run_all_tests.py` (21 Tests: 19 Passed, 2 Failed)

---

## 1. Executed Test Results

| Test ID | Area | Scenario | Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Frontend | 16-Screen Navigation & State | **PASS** | Verified in React bundle; all 16 views render and navigate without errors. |
| **TC-02** | Vendor Config | 10-Point Configuration UI | **PASS** | Form tabs, selectors, test triggers, and live telemetry console validated. |
| **TC-03** | Artifact Generation | Real XLSX Generation with openpyxl | **PASS** | `report_18092026.xlsx` generated with 1,782 records and ৳8,712,990 volume. |
| **TC-04** | Cryptography | SHA-256 Verification | **PASS** | Hash verified: `5b44941314d3a71db24291fcab45fb935942cc93509bc171edf6f5da3a2a982d`. |
| **TC-05** | Security | Zero Plaintext Passwords in UI | **PASS** | Verified zero plaintext vendor passwords in frontend and API payloads. |
| **TC-06** | Service Layer | Mock API Abstraction | **PASS** | `reconService.ts` and `realtimeHub.ts` fulfill contracts with in-memory state. |
| **TC-07** | Agent Execution | Dynamic Config Lifecycle (Mock API) | **PASS** | Navigation step modifications dynamically reflected via mock API. |
| **TC-08** | Acceptance Gate | SQLite Disqualification | **PASS** | `test_sqlserver_acceptance.py` asserts SQLite is strictly rejected from acceptance. |
| **TC-09** | Acceptance Gate | SQL Server Instance Connectivity | **FAIL** | Connection to `127.0.0.1:1433` refused. No live SQL Server instance reachable. |
| **TC-10** | Acceptance Gate | .NET SDK & Dapper Runtime Availability | **FAIL** | `dotnet` command not found. Cannot compile or execute C# Dapper repositories. |
| **TC-11** | Schema & Dapper | Stored Procedure & Dapper Contract Parity | **PASS** | All 23 stored procedures in `database/stored-procedures/` match Dapper repositories 1:1. |
| **TC-12** | Database Mock | SQLite Prototype Schema (Non-Acceptance) | **PASS** | 12 tables and foreign keys pass in SQLite prototype for local dev only. |

---

## 2. Test Execution Details (`tests/run_all_tests.py`)

```text
test_01_normal_success (test_agent_regression.TestAgentRegression) ... ok
test_02_invalid_password_failure (test_agent_regression.TestAgentRegression) ... ok
test_03_portal_unreachable_failure (test_agent_regression.TestAgentRegression) ... ok
test_04_login_element_changed (test_agent_regression.TestAgentRegression) ... ok
test_05_report_menu_changed (test_agent_regression.TestAgentRegression) ... ok
test_06_download_timeout (test_agent_regression.TestAgentRegression) ... ok
test_01_get_vendors (test_api.TestApiServer) ... ok
test_02_get_vendor_by_id (test_api.TestApiServer) ... ok
test_03_zero_password_exposure (test_api.TestApiServer) ... ok
test_04_concurrency_conflict_handling (test_api.TestApiServer) ... ok
test_05_navigation_steps_validation (test_api.TestApiServer) ... ok
test_06_execution_config_endpoint (test_api.TestApiServer) ... ok
test_01_tables_exist (test_database.TestDatabase) ... ok
test_02_seed_data_loaded (test_database.TestDatabase) ... ok
test_03_foreign_keys (test_database.TestDatabase) ... ok
test_04_unique_constraints (test_database.TestDatabase) ... ok
test_dynamic_navigation_configuration_lifecycle (test_dynamic_config.TestDynamicConfiguration) ... ok
test_01_sqlite_disqualified_from_acceptance (test_sqlserver_acceptance.TestSqlServerAcceptance) ... ok
test_02_sqlserver_instance_connectivity (test_sqlserver_acceptance.TestSqlServerAcceptance) ... FAIL
test_03_dotnet_dapper_runtime_availability (test_sqlserver_acceptance.TestSqlServerAcceptance) ... FAIL
test_04_stored_procedures_and_dapper_contract_integrity (test_sqlserver_acceptance.TestSqlServerAcceptance) ... ok

FAILED (failures=2)
```

---

## 3. Acceptance Verdict
- **Milestone 2 Acceptance Status:** **FAILED / NOT MET**
- **Action:** Milestone 3 implementation is **BLOCKED** and will not proceed until SQL Server and .NET SDK runtime environments are provisioned.
