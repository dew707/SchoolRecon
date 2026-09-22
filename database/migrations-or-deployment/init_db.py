#!/usr/bin/env python3
import sqlite3
import os
import sys
import shutil
from datetime import datetime, timezone

TARGET_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'school_recon.db'))
LOCAL_DB_PATH = '/tmp/school_recon.db'

def get_connection():
    if os.path.exists(TARGET_DB_PATH) and not os.path.exists(LOCAL_DB_PATH):
        try:
            shutil.copy(TARGET_DB_PATH, LOCAL_DB_PATH)
        except Exception as e:
            print(f"Warning copying from target: {e}")
    conn = sqlite3.connect(LOCAL_DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def sync_to_target():
    if os.path.exists(LOCAL_DB_PATH):
        try:
            shutil.copy(LOCAL_DB_PATH, TARGET_DB_PATH)
        except Exception as e:
            print(f"Warning syncing to target: {e}")

def init_database():
    print(f"Initializing SchoolRecon database at: {LOCAL_DB_PATH} (syncing to {TARGET_DB_PATH})")
    if os.path.exists(LOCAL_DB_PATH):
        os.remove(LOCAL_DB_PATH)

    conn = sqlite3.connect(LOCAL_DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    cursor = conn.cursor()

    # 1. Tables
    cursor.executescript('''
    CREATE TABLE IF NOT EXISTS Vendor (
        VendorId TEXT PRIMARY KEY,
        VendorCode TEXT NOT NULL UNIQUE,
        VendorName TEXT NOT NULL,
        PortalUrl TEXT,
        ConnectorType TEXT NOT NULL,
        IsActive INTEGER NOT NULL DEFAULT 1,
        CreatedAt TEXT NOT NULL,
        CreatedBy TEXT NOT NULL DEFAULT 'SYSTEM',
        UpdatedAt TEXT NOT NULL,
        UpdatedBy TEXT NOT NULL DEFAULT 'SYSTEM',
        RowVersion INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS VendorCredentialReference (
        VendorCredentialReferenceId TEXT PRIMARY KEY,
        VendorId TEXT NOT NULL,
        Environment TEXT NOT NULL,
        SecretProvider TEXT NOT NULL,
        SecretReference TEXT NOT NULL,
        AuthenticationType TEXT NOT NULL,
        IsConfigured INTEGER NOT NULL DEFAULT 1,
        CreatedAt TEXT NOT NULL,
        UpdatedAt TEXT NOT NULL,
        FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS VendorConnector (
        VendorConnectorId TEXT PRIMARY KEY,
        VendorId TEXT NOT NULL,
        ConnectorName TEXT NOT NULL,
        LoginUrl TEXT NOT NULL,
        ConnectorType TEXT NOT NULL,
        DefaultTimeoutSeconds INTEGER NOT NULL DEFAULT 30,
        MaxRetryCount INTEGER NOT NULL DEFAULT 2,
        IsActive INTEGER NOT NULL DEFAULT 1,
        CreatedAt TEXT NOT NULL,
        UpdatedAt TEXT NOT NULL,
        FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS VendorNavigationStep (
        VendorNavigationStepId TEXT PRIMARY KEY,
        VendorConnectorId TEXT NOT NULL,
        SequenceNo INTEGER NOT NULL,
        StepCode TEXT NOT NULL,
        ActionType TEXT NOT NULL,
        SelectorStrategy TEXT NOT NULL,
        SelectorValue TEXT NOT NULL,
        InputSource TEXT,
        StaticValue TEXT,
        Description TEXT NOT NULL,
        TimeoutSeconds INTEGER NOT NULL DEFAULT 15,
        RetryCount INTEGER NOT NULL DEFAULT 1,
        IsRequired INTEGER NOT NULL DEFAULT 1,
        IsActive INTEGER NOT NULL DEFAULT 1,
        CreatedAt TEXT NOT NULL,
        UpdatedAt TEXT NOT NULL,
        FOREIGN KEY (VendorConnectorId) REFERENCES VendorConnector(VendorConnectorId) ON DELETE CASCADE,
        UNIQUE (VendorConnectorId, SequenceNo)
    );

    CREATE TABLE IF NOT EXISTS VendorReportDefinition (
        VendorReportDefinitionId TEXT PRIMARY KEY,
        VendorId TEXT NOT NULL,
        VendorConnectorId TEXT NOT NULL,
        ReportCode TEXT NOT NULL,
        ReportName TEXT NOT NULL,
        DateFormat TEXT NOT NULL,
        ExpectedFileType TEXT NOT NULL,
        ExpectedFilenamePattern TEXT NOT NULL,
        DownloadTimeoutSeconds INTEGER NOT NULL DEFAULT 30,
        MinimumFileSizeBytes INTEGER NOT NULL DEFAULT 0,
        IsActive INTEGER NOT NULL DEFAULT 1,
        CreatedAt TEXT NOT NULL,
        UpdatedAt TEXT NOT NULL,
        FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId),
        FOREIGN KEY (VendorConnectorId) REFERENCES VendorConnector(VendorConnectorId)
    );

    CREATE TABLE IF NOT EXISTS VendorReportParameter (
        VendorReportParameterId TEXT PRIMARY KEY,
        VendorReportDefinitionId TEXT NOT NULL,
        ParameterCode TEXT NOT NULL,
        ParameterType TEXT NOT NULL,
        SelectorStrategy TEXT,
        SelectorValue TEXT,
        ValueSource TEXT NOT NULL,
        StaticValue TEXT,
        SequenceNo INTEGER NOT NULL,
        IsRequired INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (VendorReportDefinitionId) REFERENCES VendorReportDefinition(VendorReportDefinitionId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS School (
        SchoolId TEXT PRIMARY KEY,
        SchoolCode TEXT NOT NULL UNIQUE,
        SchoolName TEXT NOT NULL,
        IsActive INTEGER NOT NULL DEFAULT 1,
        CreatedAt TEXT NOT NULL,
        UpdatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS VendorSchoolMapping (
        VendorSchoolMappingId TEXT PRIMARY KEY,
        VendorId TEXT NOT NULL,
        SchoolId TEXT NOT NULL,
        VendorSchoolCode TEXT NOT NULL,
        VendorSchoolName TEXT NOT NULL,
        IsActive INTEGER NOT NULL DEFAULT 1,
        CreatedAt TEXT NOT NULL,
        UpdatedAt TEXT NOT NULL,
        FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId),
        FOREIGN KEY (SchoolId) REFERENCES School(SchoolId),
        UNIQUE (VendorId, SchoolId)
    );

    CREATE TABLE IF NOT EXISTS VendorCollectionJob (
        VendorCollectionJobId TEXT PRIMARY KEY,
        JobReference TEXT NOT NULL UNIQUE,
        VendorId TEXT NOT NULL,
        SchoolId TEXT NOT NULL,
        BusinessDate TEXT NOT NULL,
        Status TEXT NOT NULL,
        StartedAt TEXT NOT NULL,
        CompletedAt TEXT,
        AttemptCount INTEGER NOT NULL DEFAULT 1,
        ArtifactId TEXT,
        FailureCode TEXT,
        FailureMessage TEXT,
        CreatedAt TEXT NOT NULL,
        CreatedBy TEXT NOT NULL DEFAULT 'SYSTEM',
        FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId),
        FOREIGN KEY (SchoolId) REFERENCES School(SchoolId)
    );

    CREATE TABLE IF NOT EXISTS VendorCollectionEvent (
        VendorCollectionEventId TEXT PRIMARY KEY,
        VendorCollectionJobId TEXT NOT NULL,
        SequenceNo INTEGER NOT NULL,
        EventType TEXT NOT NULL,
        Stage TEXT NOT NULL,
        Message TEXT NOT NULL,
        OccurredAt TEXT NOT NULL,
        IsError INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (VendorCollectionJobId) REFERENCES VendorCollectionJob(VendorCollectionJobId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS VendorArtifact (
        VendorArtifactId TEXT PRIMARY KEY,
        VendorCollectionJobId TEXT NOT NULL,
        VendorId TEXT NOT NULL,
        SchoolId TEXT NOT NULL,
        BusinessDate TEXT NOT NULL,
        OriginalFilename TEXT NOT NULL,
        StoredFilename TEXT NOT NULL,
        StorageLocation TEXT NOT NULL,
        ContentType TEXT NOT NULL,
        FileSizeBytes INTEGER NOT NULL,
        RowCount INTEGER NOT NULL,
        TotalAmount REAL NOT NULL,
        Sha256 TEXT NOT NULL,
        CreatedAt TEXT NOT NULL,
        FOREIGN KEY (VendorCollectionJobId) REFERENCES VendorCollectionJob(VendorCollectionJobId),
        FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId),
        FOREIGN KEY (SchoolId) REFERENCES School(SchoolId)
    );

    CREATE TABLE IF NOT EXISTS AuditLog (
        AuditLogId TEXT PRIMARY KEY,
        Entity TEXT NOT NULL,
        EntityId TEXT NOT NULL,
        Action TEXT NOT NULL,
        ChangedBy TEXT NOT NULL,
        ChangedAt TEXT NOT NULL,
        OldValues TEXT,
        NewValues TEXT
    );
    ''')

    now = datetime.now(timezone.utc).isoformat()

    # 2. Seed Schools
    schools = [
        ('SCH-004', 'UTTARA_MDL', 'Uttara Model High School', 1, now, now),
        ('SCH-001', 'ABC_INT', 'ABC School', 1, now, now),
        ('SCH-009', 'DHAKA_MDL', 'Dhaka Model School', 1, now, now)
    ]
    cursor.executemany('''
    INSERT OR IGNORE INTO School (SchoolId, SchoolCode, SchoolName, IsActive, CreatedAt, UpdatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', schools)

    # 3. Seed Vendors
    vendors = [
        ('VEND-01', 'TRANSBINGO', 'TransBingo Demo', 'http://localhost:8085/demo-vendor', 'Browser Automation', 1, now, 'MIGRATION', now, 'MIGRATION', 1),
        ('VEND-02', 'EDUPAY', 'EduPay', 'https://api.edupay.com.bd/v2', 'API', 1, now, 'MIGRATION', now, 'MIGRATION', 1),
        ('VEND-03', 'SCHOOLSOFT', 'SchoolSoft', 'https://schoolsoft.com.bd/portal', 'Browser Automation', 1, now, 'MIGRATION', now, 'MIGRATION', 1)
    ]
    cursor.executemany('''
    INSERT OR IGNORE INTO Vendor (VendorId, VendorCode, VendorName, PortalUrl, ConnectorType, IsActive, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy, RowVersion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', vendors)

    # 4. Seed Credentials (References ONLY, NO passwords)
    creds = [
        ('sec-transbingo-01', 'VEND-01', 'DEMO', 'DevelopmentSecretProvider', 'vault://transbingo/demo/operator', 'Username + Password', 1, now, now),
        ('sec-edupay-02', 'VEND-02', 'PRODUCTION', 'DevelopmentSecretProvider', 'vault://edupay/prod/api_key_v2', 'API Key', 1, now, now),
        ('sec-schoolsoft-03', 'VEND-03', 'PRODUCTION', 'DevelopmentSecretProvider', 'vault://schoolsoft/prod/operator', 'Username + Password', 1, now, now)
    ]
    cursor.executemany('''
    INSERT OR IGNORE INTO VendorCredentialReference (VendorCredentialReferenceId, VendorId, Environment, SecretProvider, SecretReference, AuthenticationType, IsConfigured, CreatedAt, UpdatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', creds)

    # 5. Seed Connectors
    connectors = [
        ('CONN-01', 'VEND-01', 'TransBingo Portal Crawler', 'http://localhost:8085/demo-vendor/login', 'Browser Automation', 30, 2, 1, now, now),
        ('CONN-02', 'VEND-02', 'EduPay REST Ingestion Adapter', 'https://api.edupay.com.bd/v2/auth/token', 'API', 15, 3, 1, now, now),
        ('CONN-03', 'VEND-03', 'SchoolSoft Web Crawler', 'https://schoolsoft.com.bd/portal/login', 'Browser Automation', 25, 2, 1, now, now)
    ]
    cursor.executemany('''
    INSERT OR IGNORE INTO VendorConnector (VendorConnectorId, VendorId, ConnectorName, LoginUrl, ConnectorType, DefaultTimeoutSeconds, MaxRetryCount, IsActive, CreatedAt, UpdatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', connectors)

    # 6. Seed 13 Navigation Steps for CONN-01
    cursor.execute("DELETE FROM VendorNavigationStep WHERE VendorConnectorId = 'CONN-01'")
    steps = [
        ('STEP-1',  'CONN-01', 1,  'STEP_NAVIGATE_LOGIN',   'NAVIGATE',  'css',         '/demo-vendor/login',     'STATIC',           '/demo-vendor/login',     'Open Login URL', 15, 2, 1, 1, now, now),
        ('STEP-2',  'CONN-01', 2,  'STEP_FILL_USERNAME',     'FILL',      'data-testid', 'username-input',         'SECRET_USERNAME',  None,                     'Enter username', 5, 1, 1, 1, now, now),
        ('STEP-3',  'CONN-01', 3,  'STEP_FILL_PASSWORD',     'FILL',      'data-testid', 'password-input',         'SECRET_PASSWORD',  None,                     'Enter password', 5, 1, 1, 1, now, now),
        ('STEP-4',  'CONN-01', 4,  'STEP_CLICK_LOGIN',       'CLICK',     'data-testid', 'login-btn',              None,               None,                     'Click Login button', 10, 2, 1, 1, now, now),
        ('STEP-5',  'CONN-01', 5,  'STEP_WAIT_DASHBOARD',    'WAIT_FOR',  'data-testid', 'dashboard-view',         None,               None,                     'Wait for Dashboard', 15, 2, 1, 1, now, now),
        ('STEP-6',  'CONN-01', 6,  'STEP_CLICK_REPORTS_MENU','CLICK',     'data-testid', 'menu-reports',           None,               None,                     'Click Reports menu', 5, 1, 1, 1, now, now),
        ('STEP-7',  'CONN-01', 7,  'STEP_CLICK_COL_REPORT',  'CLICK',     'data-testid', 'menu-collection-report', None,               None,                     'Click Collection Report', 8, 2, 1, 1, now, now),
        ('STEP-8',  'CONN-01', 8,  'STEP_SELECT_SCHOOL',     'SELECT',    'data-testid', 'school-select',          'SCHOOL_MAPPING',   None,                     'Select School from dropdown', 5, 1, 1, 1, now, now),
        ('STEP-9',  'CONN-01', 9,  'STEP_SET_FROM_DATE',     'SET_DATE',  'data-testid', 'from-date',              'BUSINESS_DATE',    None,                     'Set From Date = Business Date', 5, 1, 1, 1, now, now),
        ('STEP-10', 'CONN-01', 10, 'STEP_SET_TO_DATE',       'SET_DATE',  'data-testid', 'to-date',                'BUSINESS_DATE',    None,                     'Set To Date = Business Date', 5, 1, 1, 1, now, now),
        ('STEP-11', 'CONN-01', 11, 'STEP_CLICK_SEARCH',      'CLICK',     'data-testid', 'search-btn',             None,               None,                     'Click Search', 15, 2, 1, 1, now, now),
        ('STEP-12', 'CONN-01', 12, 'STEP_WAIT_REPORT_TABLE', 'WAIT_FOR',  'data-testid', 'report-table',           None,               None,                     'Wait for Report Result table', 20, 2, 1, 1, now, now),
        ('STEP-13', 'CONN-01', 13, 'STEP_DOWNLOAD_XLSX',     'DOWNLOAD',  'data-testid', 'export-excel-btn',       None,               None,                     'Click Export Excel', 30, 2, 1, 1, now, now)
    ]
    cursor.executemany('''
    INSERT INTO VendorNavigationStep (
        VendorNavigationStepId, VendorConnectorId, SequenceNo, StepCode, ActionType,
        SelectorStrategy, SelectorValue, InputSource, StaticValue, Description,
        TimeoutSeconds, RetryCount, IsRequired, IsActive, CreatedAt, UpdatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', steps)

    # 7. Seed Report Definition
    cursor.execute('''
    INSERT OR IGNORE INTO VendorReportDefinition (
        VendorReportDefinitionId, VendorId, VendorConnectorId, ReportCode, ReportName,
        DateFormat, ExpectedFileType, ExpectedFilenamePattern, DownloadTimeoutSeconds,
        MinimumFileSizeBytes, IsActive, CreatedAt, UpdatedAt
    )
    VALUES ('REPDEF-01', 'VEND-01', 'CONN-01', 'DAILY_COLLECTION_REPORT', 'Daily Collection Report',
            'DD/MM/YYYY', 'XLSX', 'TransBingo_Collection_*.xlsx', 30, 40960, 1, ?, ?)
    ''', (now, now))

    # 8. Seed Report Parameters
    cursor.execute("DELETE FROM VendorReportParameter WHERE VendorReportDefinitionId = 'REPDEF-01'")
    params = [
        ('RPARAM-01', 'REPDEF-01', 'schoolCode', 'STRING', 'data-testid', 'school-select', 'SCHOOL_MAPPING', None, 1, 1),
        ('RPARAM-02', 'REPDEF-01', 'date',       'DATE',   'data-testid', 'from-date',     'BUSINESS_DATE',  None, 2, 1)
    ]
    cursor.executemany('''
    INSERT INTO VendorReportParameter (
        VendorReportParameterId, VendorReportDefinitionId, ParameterCode, ParameterType,
        SelectorStrategy, SelectorValue, ValueSource, StaticValue, SequenceNo, IsRequired
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', params)

    # 9. Seed School Mappings
    cursor.execute("DELETE FROM VendorSchoolMapping WHERE VendorId = 'VEND-01'")
    mappings = [
        ('MAP-01', 'VEND-01', 'SCH-004', 'UTTARA_MDL', 'Uttara Model High School', 1, now, now),
        ('MAP-02', 'VEND-01', 'SCH-001', 'ABC_INT', 'ABC School', 1, now, now),
        ('MAP-03', 'VEND-01', 'SCH-009', 'DHAKA_MDL', 'Dhaka Model School', 1, now, now)
    ]
    cursor.executemany('''
    INSERT INTO VendorSchoolMapping (
        VendorSchoolMappingId, VendorId, SchoolId, VendorSchoolCode, VendorSchoolName,
        IsActive, CreatedAt, UpdatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', mappings)

    conn.commit()
    conn.close()
    sync_to_target()
    print("Database initialized and synced successfully.")

if __name__ == '__main__':
    init_database()
