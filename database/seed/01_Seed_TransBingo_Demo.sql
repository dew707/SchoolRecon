-- Seed Data: TransBingo Demo Configuration (Migrated from mockData.ts)
-- ZERO plaintext passwords in SQL. Only secret references stored.

-- 1. School Master Data
IF NOT EXISTS (SELECT 1 FROM School WHERE SchoolId = 'SCH-004')
BEGIN
    INSERT INTO School (SchoolId, SchoolCode, SchoolName, IsActive)
    VALUES ('SCH-004', 'UTTARA_MDL', 'Uttara Model High School', 1);
END;

IF NOT EXISTS (SELECT 1 FROM School WHERE SchoolId = 'SCH-001')
BEGIN
    INSERT INTO School (SchoolId, SchoolCode, SchoolName, IsActive)
    VALUES ('SCH-001', 'ABC_INT', 'ABC School', 1);
END;

IF NOT EXISTS (SELECT 1 FROM School WHERE SchoolId = 'SCH-009')
BEGIN
    INSERT INTO School (SchoolId, SchoolCode, SchoolName, IsActive)
    VALUES ('SCH-009', 'DHAKA_MDL', 'Dhaka Model School', 1);
END;

-- 2. Vendor Record
IF NOT EXISTS (SELECT 1 FROM Vendor WHERE VendorId = 'VEND-01')
BEGIN
    INSERT INTO Vendor (VendorId, VendorCode, VendorName, PortalUrl, ConnectorType, IsActive, CreatedBy, UpdatedBy, RowVersion)
    VALUES ('VEND-01', 'TRANSBINGO', 'TransBingo Demo', 'http://localhost:8085/demo-vendor', 'Browser Automation', 1, 'MIGRATION', 'MIGRATION', 1);
END;

-- 3. Vendor Credential Reference (Reference only - no secret/password)
IF NOT EXISTS (SELECT 1 FROM VendorCredentialReference WHERE VendorCredentialReferenceId = 'sec-transbingo-01')
BEGIN
    INSERT INTO VendorCredentialReference (
        VendorCredentialReferenceId, VendorId, Environment, SecretProvider,
        SecretReference, AuthenticationType, IsConfigured
    )
    VALUES (
        'sec-transbingo-01', 'VEND-01', 'DEMO', 'DevelopmentSecretProvider',
        'vault://transbingo/demo/operator', 'Username + Password', 1
    );
END;

-- 4. Vendor Connector
IF NOT EXISTS (SELECT 1 FROM VendorConnector WHERE VendorConnectorId = 'CONN-01')
BEGIN
    INSERT INTO VendorConnector (
        VendorConnectorId, VendorId, ConnectorName, LoginUrl,
        ConnectorType, DefaultTimeoutSeconds, MaxRetryCount, IsActive
    )
    VALUES (
        'CONN-01', 'VEND-01', 'TransBingo Portal Crawler', 'http://localhost:8085/demo-vendor/login',
        'Browser Automation', 30, 2, 1
    );
END;

-- 5. 13 Navigation Steps for TransBingo Portal Crawler
DELETE FROM VendorNavigationStep WHERE VendorConnectorId = 'CONN-01';

INSERT INTO VendorNavigationStep (VendorNavigationStepId, VendorConnectorId, SequenceNo, StepCode, ActionType, SelectorStrategy, SelectorValue, InputSource, StaticValue, Description, TimeoutSeconds, RetryCount, IsRequired, IsActive)
VALUES 
('STEP-1',  'CONN-01', 1,  'STEP_NAVIGATE_LOGIN',   'NAVIGATE',  'css',         '/demo-vendor/login',     'STATIC',           '/demo-vendor/login',     'Open Login URL', 15, 2, 1, 1),
('STEP-2',  'CONN-01', 2,  'STEP_FILL_USERNAME',     'FILL',      'data-testid', 'username-input',         'SECRET_USERNAME',  NULL,                     'Enter username', 5, 1, 1, 1),
('STEP-3',  'CONN-01', 3,  'STEP_FILL_PASSWORD',     'FILL',      'data-testid', 'password-input',         'SECRET_PASSWORD',  NULL,                     'Enter password', 5, 1, 1, 1),
('STEP-4',  'CONN-01', 4,  'STEP_CLICK_LOGIN',       'CLICK',     'data-testid', 'login-btn',              NULL,               NULL,                     'Click Login button', 10, 2, 1, 1),
('STEP-5',  'CONN-01', 5,  'STEP_WAIT_DASHBOARD',    'WAIT_FOR',  'data-testid', 'dashboard-view',         NULL,               NULL,                     'Wait for Dashboard', 15, 2, 1, 1),
('STEP-6',  'CONN-01', 6,  'STEP_CLICK_REPORTS_MENU','CLICK',     'data-testid', 'menu-reports',           NULL,               NULL,                     'Click Reports menu', 5, 1, 1, 1),
('STEP-7',  'CONN-01', 7,  'STEP_CLICK_COL_REPORT',  'CLICK',     'data-testid', 'menu-collection-report', NULL,               NULL,                     'Click Collection Report', 8, 2, 1, 1),
('STEP-8',  'CONN-01', 8,  'STEP_SELECT_SCHOOL',     'SELECT',    'data-testid', 'school-select',          'SCHOOL_MAPPING',   NULL,                     'Select School from dropdown', 5, 1, 1, 1),
('STEP-9',  'CONN-01', 9,  'STEP_SET_FROM_DATE',     'SET_DATE',  'data-testid', 'from-date',              'BUSINESS_DATE',    NULL,                     'Set From Date = Business Date', 5, 1, 1, 1),
('STEP-10', 'CONN-01', 10, 'STEP_SET_TO_DATE',       'SET_DATE',  'data-testid', 'to-date',                'BUSINESS_DATE',    NULL,                     'Set To Date = Business Date', 5, 1, 1, 1),
('STEP-11', 'CONN-01', 11, 'STEP_CLICK_SEARCH',      'CLICK',     'data-testid', 'search-btn',             NULL,               NULL,                     'Click Search', 15, 2, 1, 1),
('STEP-12', 'CONN-01', 12, 'STEP_WAIT_REPORT_TABLE', 'WAIT_FOR',  'data-testid', 'report-table',           NULL,               NULL,                     'Wait for Report Result table', 20, 2, 1, 1),
('STEP-13', 'CONN-01', 13, 'STEP_DOWNLOAD_XLSX',     'DOWNLOAD',  'data-testid', 'export-excel-btn',       NULL,               NULL,                     'Click Export Excel', 30, 2, 1, 1);

-- 6. Report Definition
IF NOT EXISTS (SELECT 1 FROM VendorReportDefinition WHERE VendorReportDefinitionId = 'REPDEF-01')
BEGIN
    INSERT INTO VendorReportDefinition (
        VendorReportDefinitionId, VendorId, VendorConnectorId, ReportCode,
        ReportName, DateFormat, ExpectedFileType, ExpectedFilenamePattern,
        DownloadTimeoutSeconds, MinimumFileSizeBytes, IsActive
    )
    VALUES (
        'REPDEF-01', 'VEND-01', 'CONN-01', 'DAILY_COLLECTION_REPORT',
        'Daily Collection Report', 'DD/MM/YYYY', 'XLSX', 'TransBingo_Collection_*.xlsx',
        30, 40960, 1
    );
END;

-- 7. Report Parameters
DELETE FROM VendorReportParameter WHERE VendorReportDefinitionId = 'REPDEF-01';

INSERT INTO VendorReportParameter (
    VendorReportParameterId, VendorReportDefinitionId, ParameterCode,
    ParameterType, SelectorStrategy, SelectorValue, ValueSource, StaticValue, SequenceNo, IsRequired
)
VALUES 
('RPARAM-01', 'REPDEF-01', 'schoolCode', 'STRING', 'data-testid', 'school-select', 'SCHOOL_MAPPING', NULL, 1, 1),
('RPARAM-02', 'REPDEF-01', 'date',       'DATE',   'data-testid', 'from-date',     'BUSINESS_DATE',  NULL, 2, 1);

-- 8. School Mappings
DELETE FROM VendorSchoolMapping WHERE VendorId = 'VEND-01';

INSERT INTO VendorSchoolMapping (
    VendorSchoolMappingId, VendorId, SchoolId, VendorSchoolCode, VendorSchoolName, IsActive
)
VALUES
('MAP-01', 'VEND-01', 'SCH-004', 'UTTARA_MDL', 'Uttara Model High School', 1),
('MAP-02', 'VEND-01', 'SCH-001', 'ABC_INT',    'ABC School', 1),
('MAP-03', 'VEND-01', 'SCH-009', 'DHAKA_MDL',  'Dhaka Model School', 1);

GO
