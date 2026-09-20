# Project Charter: SchoolRecon (School Reconciliation Control Center)

## 1. Problem Statement
In the Bangladesh educational sector, thousands of private, English medium, and public institutions collect student tuition, examination fees, and admission dues across multiple fragmented payment aggregator channels (e.g., TransBingo, EduPay, SchoolSoft, SmartCampus, bKash, Nagad, DBBL Rocket, Bank Cards).

At the end of each business cycle:
1. External vendor portals provide ad-hoc collection reports (often Excel XLSX or CSV statements).
2. Internal core payment engines (TAP) record captured API authorizations.
3. Operations teams face massive reconciliation discrepancies due to late callbacks, dropped webhooks, currency rounding variances, and manual portal collection delays.
4. Unreconciled breaks result in uncredited student ledgers, settlement lockups, and audit non-compliance.

## 2. Objective & Solution Scope
**SchoolRecon** is an institutional-grade financial reconciliation control center designed to:
- **Automate Collection:** Orchestrate headless browser workers (Playwright) and API connectors to extract statements daily across 148+ institutions.
- **Normalize & Validate:** Cryptographically verify every file (SHA-256) and structure data into standardized transactional schemas.
- **Rule-Based Reconciliation:** Compare vendor statements against internal payment gateway records using deterministic rules (e.g. `R004_STUDENT_AMOUNT_TIME`).
- **AI Investigation:** Deploy autonomous AI supervisors to investigate root causes of breaks (missing webhooks, fee variance, timing drift) and present high-confidence advisory recommendations.
- **Operational Oversight:** Provide an intuitive 16-screen control center dashboard for real-time monitoring, break resolution, and non-repudiation audit trails.

## 3. Core Operational Metrics
- **Current Institution Scope:** 148 registered schools in Bangladesh.
- **Daily Reconciled Volume:** ~৳482.19 Million BDT.
- **Target Reconciliation Match Rate:** > 99.5%.
- **Active Vendors:** 12 portals, REST APIs, and SFTP adapters.
