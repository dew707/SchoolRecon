# Comprehensive Test Plan

## 1. Test Strategy & Objectives
Verify the accuracy, performance, security, and financial integrity of the SchoolRecon system across:
1. **Frontend Verification:** Responsiveness, navigation, state consistency across all 16 screens.
2. **Vendor Collection Agent:** Automated Playwright browser navigation, form authentication, and real file download.
3. **Evidence Validation:** SHA-256 cryptographic verification and openpyxl spreadsheet parsing.
4. **Reconciliation Engine:** Deterministic rule-based matching and exception isolation.

---

## 2. Test Cases Matrix

| Test ID | Area | Scenario | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-01** | Frontend | Navigate across all 16 screens | All views render without errors matching design tokens. |
| **TC-02** | Vendor Config | Execute "Test Login" | Resolves vault token, connects to portal, logs in, returns steps. |
| **TC-03** | Vendor Config | Execute "Test Navigation" | Navigates to `/portal/reports`, confirms form DOM elements. |
| **TC-04** | Vendor Config | Execute "Test Download" | Downloads `report_18092026.xlsx`, returns valid byte stream. |
| **TC-05** | Vendor Config | Execute "Run Full Test" | Downloads real file, verifies 1,782 rows, ৳8,712,990 sum, SHA-256. |
| **TC-06** | Artifact Center | Ingest real XLSX statement | Displays in table, provides in-UI preview of top 4 rows. |
| **TC-07** | Matching Engine| Compare candidate `EX-009821` | Rule `R004_STUDENT_AMOUNT_TIME` matches with 6s drift. |
| **TC-08** | AI Supervisor | Request deep investigation | AI searches raw logs, returns updated trace timeline item. |
| **TC-09** | Security | Verify Vault references | No plaintext passwords found in client source or bundle. |
