# Database Schema & Conventions (SQL Server 2022)

## 1. Naming & Type Conventions
- **Tables:** Plural PascalCase (e.g. `Schools`, `ReconRuns`, `ReconExceptions`).
- **Primary Keys:** `Id` (GUID or deterministic VARCHAR identifier, e.g. `REC-20260918`).
- **Foreign Keys:** `[Entity]Id` (e.g. `SchoolId`, `VendorId`, `RunId`).
- **Currency Columns:** `DECIMAL(18, 2)` (BDT currency precision).
- **Timestamps:** `DATETIMEOFFSET` stored in UTC.

---

## 2. Core Relational Tables

### Table: `Vendors`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | VARCHAR(64) | PK | Unique vendor ID (e.g. `VEND-01`) |
| `Name` | NVARCHAR(150) | NOT NULL | Display name (e.g. TransBingo) |
| `Code` | VARCHAR(50) | NOT NULL, UNIQUE | Connector code |
| `ConnectorType` | VARCHAR(50) | NOT NULL | `PORTAL_CRAWLER`, `API`, `SFTP` |
| `PortalUrl` | NVARCHAR(500) | NULL | Target URL |
| `CredentialRef` | NVARCHAR(255) | NOT NULL | Vault reference |
| `Status` | VARCHAR(30) | NOT NULL | `Active`, `Paused` |

### Table: `Schools`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | VARCHAR(64) | PK | Unique school ID (e.g. `SCH-001`) |
| `Code` | VARCHAR(50) | NOT NULL, UNIQUE | Institutional code (e.g. `ABC_INT`) |
| `Name` | NVARCHAR(200) | NOT NULL | Institution name |
| `VendorId` | VARCHAR(64) | FK -> Vendors | Associated vendor adapter |
| `InternalSchoolId`| VARCHAR(64) | NOT NULL | TAP internal ledger ID |
| `MerchantId` | VARCHAR(64) | NOT NULL | Acquiring bank merchant ID |
| `Schedule` | VARCHAR(50) | NOT NULL | Batch cron trigger |

### Table: `ReconRuns`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | VARCHAR(64) | PK | Run ID (e.g. `REC-20260918`) |
| `BusinessDate` | DATE | NOT NULL | Reconciled transaction date |
| `Status` | VARCHAR(50) | NOT NULL | `Completed`, `Running`, `Failed` |
| `SchoolsTotal` | INT | NOT NULL | Total batch institutions (148) |
| `SchoolsCompleted`| INT | NOT NULL | Finished count |
| `MatchedAmount`| DECIMAL(18, 2) | NOT NULL | Total matched BDT |
| `DifferenceAmount`| DECIMAL(18, 2)| NOT NULL | Unresolved variance |
| `StartedAt` | DATETIMEOFFSET | NOT NULL | Batch start timestamp |
| `CompletedAt` | DATETIMEOFFSET | NULL | Batch completion timestamp |

### Table: `Artifacts`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | VARCHAR(64) | PK | Artifact ID (e.g. `ART-001`) |
| `SchoolId` | VARCHAR(64) | FK -> Schools | Target school |
| `RunId` | VARCHAR(64) | FK -> ReconRuns | Batch execution run |
| `FileName` | NVARCHAR(255) | NOT NULL | Downloaded file name |
| `FileType` | VARCHAR(20) | NOT NULL | `XLSX`, `CSV`, `JSON` |
| `RowCount` | INT | NOT NULL | Number of records |
| `TotalAmount` | DECIMAL(18, 2) | NOT NULL | Total financial sum |
| `Sha256Checksum` | VARCHAR(64) | NOT NULL | Cryptographic SHA-256 |
| `StoragePath` | NVARCHAR(500) | NOT NULL | MinIO S3 object key |
| `Status` | VARCHAR(30) | NOT NULL | `Valid`, `Corrupt` |
