# Agent & Autonomous Worker Workflow Specification

## 1. Vendor Collection Agent (Browser Automation)
The Vendor Collection Agent is responsible for extracting statement artifacts from external vendor portals without public APIs.

```text
[1. Vault Secret Lookup]
         ↓
[2. Launch Headless Chromium]
         ↓
[3. Portal Handshake & Auth] (Assert post-login selector)
         ↓
[4. Menu Navigation] (Traverse DOM to Reports page)
         ↓
[5. Parameter Injection] (Inject School Code & Date)
         ↓
[6. Trigger Report Export] (Stream binary XLSX file)
         ↓
[7. Cryptographic Verification] (Calculate SHA-256 hash)
         ↓
[8. Schema & Financial Validation] (Parse rows, calculate sum)
         ↓
[9. Artifact Center Ingestion] (Archive to MinIO S3 & SQL metadata)
         ↓
[10. Signal Reconciliation Engine] (Handoff to Rule Matcher)
```

### Granular Diagnostic Actions
- **Test Login:** Executes steps 1–3, validates credentials and session persistence.
- **Test Navigation:** Executes steps 1–4, asserts DOM selectors on the report view.
- **Test Download:** Executes steps 1–6, verifies file streaming.
- **Run Full Test:** Executes steps 1–9 end-to-end, computing cryptographic proofs and registering artifacts.

---

## 2. AI Investigation Agent (Exception Analysis Supervisor)
The AI Investigation Agent acts as an autonomous forensic investigator for unmatched transactions.

```text
[Unmatched Exception Detected] (e.g. EX-009821, Vendor Only, ৳5,500)
         ↓
[Step 1: Load Exception Parameters]
         ↓
[Step 2: Internal TAP Gateway Lookup] (Search by Student ID 100921)
         ↓
[Step 3: Acquiring Bank Settlement Query] (Query bKash gateway status)
         ↓
[Step 4: Callback & Webhook Log Inspection] (Inspect RabbitMQ delivery logs)
         ↓
[Step 5: Root Cause Classification] (Probable Cause: Missing vendor webhook)
         ↓
[Step 6: Confidence Calculation] (Score: 91%)
         ↓
[Step 7: Formulate Recommendation] (Manual Review / Post Adjustment)
         ↓
[Step 8: Human-in-the-Loop Sign-Off] (Operator accepts, rejects, or routes)
```

**Safety Principle:** AI is strictly advisory. It never automatically mutates balances or executes fund movements.
