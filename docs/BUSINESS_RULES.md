# SchoolRecon Business Rules

**Audit baseline:** 22 September 2026  
**Scope:** Phase 1 vendor/report-source onboarding, with Phase 2 constraints recorded only to prevent incompatible design.

## Phase separation

1. Vendor onboarding and verification is separate from reconciliation execution.
2. A configured vendor is not automatically ready for reconciliation.
3. Reconciliation eligibility requires successful, durable configuration verification. The current application does not yet implement that gate.

## Vendor identity and relationships

- A vendor has a stable ID and code, display name, connector type, and active state.
- A school is independent of a vendor. `VendorSchoolMapping` supplies the vendor-specific school code and label.
- Active/inactive state must be honored at vendor, connector, report-definition, and mapping levels where present.
- Vendor creation and editing must be end-to-end; a UI-only modal or a database-only procedure is not completion.

## Portal, authentication, and credentials

- Portal URL and connector login URL are distinct configuration values.
- Authentication configuration describes the method and a secure secret reference; passwords and API secrets must not be returned to the browser.
- Credential values must be resolved only by an approved secret provider at execution time.
- Credential metadata is not valid merely because a default DTO says it is configured.
- The existing credential architecture is protected during this phase. Security defects are documented for separate remediation.

## Report navigation and parameters

- Browser collection uses ordered, deterministic navigation steps.
- Step order, action, selector strategy/value, input source, timeout, retry count, required flag, and active flag affect execution.
- Report parameters vary by vendor and must remain ordered and vendor-specific.
- Parameter values may come from school mappings, business date, static configuration, or secret inputs.
- A UI must not present navigation or report configuration as editable unless those changes are actually persisted and subsequently consumed by execution.

## Report output and evidence

- Expected report format and filename pattern are configuration, not proof of the downloaded file type.
- A successful download must retain the original file, calculate SHA-256, and record artifact metadata.
- File verification must distinguish transport success, file presence, format validity, schema validity, and content checks.
- Generated demonstration workbooks are not evidence that an external vendor report was downloaded.

## Configuration verification

A complete verification run should record meaningful outcomes for at least:

1. connection/portal access
2. authentication when required
3. report navigation
4. parameter entry
5. report generation
6. file download
7. file and schema validation
8. artifact retention

Failure must identify the failed step and reason. Verification evidence must be durable and tied to the tested configuration version. Only a passing, current verification may make a vendor ready for reconciliation.

## Phase 2 compatibility constraints

- Each future reconciliation run owns an external vendor dataset and an internal TAP dataset for the same school/vendor/date scope.
- Original vendor files must remain traceable to the run.
- Internal TAP data must be staged or otherwise reproducibly tied to the same run.
- Normalization/mapping occurs before deterministic comparison.
- Results must distinguish matched, vendor-only, TAP-only, and other mismatch categories.
- Phase 1 must not invent a readiness mechanism that cannot later identify the verified vendor, school mapping, report definition, and source artifact.

## Evidence classification

- **FACT:** directly shown by live database metadata/data, executable source, or an executed test.
- **INFERENCE:** a reasonable conclusion not directly executed or observed.
- **BUSINESS CONFIRMATION REQUIRED:** a policy choice that code and schema cannot establish.
