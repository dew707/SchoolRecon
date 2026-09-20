# Security Architecture & Compliance Guidelines

## 1. Zero Plaintext Password Architecture
- Plaintext vendor portal credentials and banking API secrets must **NEVER** be stored in frontend code, git repositories, or client-side storage.
- All vendor credentials are substituted with HashiCorp Vault references (e.g. `vault://transbingo/prod/svc_recon`).
- Background workers resolve ephemeral credentials in isolated container memory and discard them immediately upon session termination.

## 2. Cryptographic Evidence Integrity
- Every artifact retrieved from an external portal or internal API is immediately hashed using **SHA-256**.
- The SHA-256 hash is recorded in SQL Server and embedded in the non-repudiation audit trail.
- Any discrepancy between the file checksum and database record flags the artifact as `Corrupt / Tampered`.

## 3. Financial Safety Controls (AI Advisory Boundary)
- Autonomous AI agents operate within a strictly read-only advisory sandbox.
- AI can:
  1. Parse exception records and correlate external gateway logs.
  2. Isolate probable root causes (missing webhooks, fee variance).
  3. Recommend operational adjustments.
- AI cannot:
  1. Auto-execute financial movements, refunds, or reversals.
  2. Modify general ledger journal entries without certified human review.

## 4. Regulatory Compliance
- Designed to comply with Bangladesh Bank Payment Systems Department guidelines (PSD Circular No. 04/2024).
- Comprehensive immutable audit trail (`AuditEvents`) recording timestamps, actors, run IDs, entity keys, and outcomes.
