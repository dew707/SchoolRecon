import {
  School,
  Vendor,
  ReconRun,
  SchoolReconRun,
  ReconException,
  AgentInvestigation,
  ReconMatchCandidate,
  Artifact,
  ServiceHealthItem,
  WorkerStatus,
  QueueStatus,
  AuditEvent,
  ScheduleItem,
  ReconStatus,
  PipelineStage,
  ExceptionType,
  ExceptionPriority,
  ExceptionStatus,
  HealthStatus,
  ConnectorType,
  VendorNavigationStep
} from '../types';

export const defaultTransBingoSteps: VendorNavigationStep[] = [
  { id: 'STEP-1', sequence: 1, action: 'NAVIGATE', selectorStrategy: 'css', selector: '/demo-vendor/login', description: 'Open Login URL', timeoutMs: 15000, retryCount: 2, isRequired: true },
  { id: 'STEP-2', sequence: 2, action: 'FILL', selectorStrategy: 'data-testid', selector: "username-input", value: '${USERNAME}', description: 'Enter username', timeoutMs: 5000, retryCount: 1, isRequired: true },
  { id: 'STEP-3', sequence: 3, action: 'FILL', selectorStrategy: 'data-testid', selector: "password-input", value: '${PASSWORD}', description: 'Enter password', timeoutMs: 5000, retryCount: 1, isRequired: true },
  { id: 'STEP-4', sequence: 4, action: 'CLICK', selectorStrategy: 'data-testid', selector: "login-btn", description: 'Click Login button', timeoutMs: 10000, retryCount: 2, isRequired: true },
  { id: 'STEP-5', sequence: 5, action: 'WAIT_FOR', selectorStrategy: 'data-testid', selector: "dashboard-view", description: 'Wait for Dashboard', timeoutMs: 15000, retryCount: 2, isRequired: true },
  { id: 'STEP-6', sequence: 6, action: 'CLICK', selectorStrategy: 'data-testid', selector: "menu-reports", description: 'Click Reports menu', timeoutMs: 5000, retryCount: 1, isRequired: true },
  { id: 'STEP-7', sequence: 7, action: 'CLICK', selectorStrategy: 'data-testid', selector: "menu-collection-report", description: 'Click Collection Report', timeoutMs: 8000, retryCount: 2, isRequired: true },
  { id: 'STEP-8', sequence: 8, action: 'SELECT', selectorStrategy: 'data-testid', selector: "school-select", value: '${SCHOOL_CODE}', description: 'Select School from dropdown', timeoutMs: 5000, retryCount: 1, isRequired: true },
  { id: 'STEP-9', sequence: 9, action: 'SET_DATE', selectorStrategy: 'data-testid', selector: "from-date", value: '${BUSINESS_DATE}', description: 'Set From Date = Business Date', timeoutMs: 5000, retryCount: 1, isRequired: true },
  { id: 'STEP-10', sequence: 10, action: 'SET_DATE', selectorStrategy: 'data-testid', selector: "to-date", value: '${BUSINESS_DATE}', description: 'Set To Date = Business Date', timeoutMs: 5000, retryCount: 1, isRequired: true },
  { id: 'STEP-11', sequence: 11, action: 'CLICK', selectorStrategy: 'data-testid', selector: "search-btn", description: 'Click Search', timeoutMs: 15000, retryCount: 2, isRequired: true },
  { id: 'STEP-12', sequence: 12, action: 'WAIT_FOR', selectorStrategy: 'data-testid', selector: "report-table", description: 'Wait for Report Result table', timeoutMs: 20000, retryCount: 2, isRequired: true },
  { id: 'STEP-13', sequence: 13, action: 'DOWNLOAD', selectorStrategy: 'data-testid', selector: "export-excel-btn", description: 'Click Export Excel', timeoutMs: 30000, retryCount: 2, isRequired: true },
];

export const mockVendors: Vendor[] = [
  {
    id: 'VEND-01',
    name: 'TransBingo Demo',
    code: 'TRANSBINGO',
    connectorType: ConnectorType.PORTAL_CRAWLER,
    schoolsCount: 28,
    lastCollection: '18 Sep 2026 01:04',
    successRate: 99.2,
    health: HealthStatus.HEALTHY,
    isActive: true,
    portalUrl: 'http://localhost:8085/demo-vendor',
    loginUrl: 'http://localhost:8085/demo-vendor/login',
    authType: 'Username + Password',
    credentialReference: {
      secretId: 'sec-transbingo-01',
      secretProvider: 'DevelopmentSecretProvider',
      vaultPath: 'vault://transbingo/demo/operator',
      usernameIdentifier: 'demo-operator',
      credentialConfigured: true,
      lastRotated: '18 Sep 2026 00:00:00 UTC'
    },
    lastVerified: '18 Sep 2026 00:45',
    reportDefinition: {
      reportName: 'Daily Collection Report',
      schoolParameter: 'schoolCode',
      dateParameter: 'date',
      dateFormat: 'DD/MM/YYYY',
      expectedFileType: 'XLSX',
      filenamePattern: 'TransBingo_Collection_*.xlsx',
      downloadTimeoutSec: 30,
      minExpectedFileSizeKb: 40
    },
    navigationSteps: defaultTransBingoSteps,
    schoolMappings: [
      { internalSchoolId: 'TAP_SCH_1004', internalSchoolName: 'Uttara Model High School', vendorSchoolCode: 'UTTARA_MDL', vendorSchoolLabel: 'Uttara Model High School' },
      { internalSchoolId: 'TAP_SCH_1001', internalSchoolName: 'ABC School', vendorSchoolCode: 'ABC_INT', vendorSchoolLabel: 'ABC School' },
      { internalSchoolId: 'TAP_SCH_1009', internalSchoolName: 'Dhaka Model School', vendorSchoolCode: 'DHAKA_MDL', vendorSchoolLabel: 'Dhaka Model School' }
    ]
  },
  {
    id: 'VEND-02',
    name: 'EduPay',
    code: 'EDUPAY',
    connectorType: ConnectorType.API_CONNECTOR,
    schoolsCount: 24,
    lastCollection: '18 Sep 2026 01:12',
    successRate: 98.2,
    health: HealthStatus.HEALTHY,
    isActive: true,
    portalUrl: 'https://api.edupay.com.bd/v2',
    loginUrl: 'https://api.edupay.com.bd/v2/auth/token',
    authType: 'API Key',
    credentialReference: {
      secretId: 'sec-edupay-02',
      secretProvider: 'DevelopmentSecretProvider',
      vaultPath: 'vault://edupay/prod/api_key_v2',
      usernameIdentifier: 'api_client_tap_recon',
      credentialConfigured: true,
      lastRotated: '18 Sep 2026 00:50:00 UTC'
    },
    lastVerified: '18 Sep 2026 00:50',
    reportDefinition: {
      reportName: 'Rest API Batch Reconciliation Feed',
      schoolParameter: 'institution_id',
      dateParameter: 'settlement_date',
      dateFormat: 'YYYY-MM-DD',
      expectedFileType: 'JSON',
      filenamePattern: 'edupay_settlement_*.json',
      downloadTimeoutSec: 15,
      minExpectedFileSizeKb: 10
    },
    navigationSteps: [],
    schoolMappings: []
  },
  {
    id: 'VEND-03',
    name: 'SchoolSoft',
    code: 'SCHOOLSOFT',
    connectorType: ConnectorType.PORTAL_CRAWLER,
    schoolsCount: 16,
    lastCollection: '18 Sep 2026 01:18',
    successRate: 96.1,
    health: HealthStatus.DEGRADED,
    isActive: true,
    portalUrl: 'https://admin.schoolsoft.net.bd',
    loginUrl: 'https://admin.schoolsoft.net.bd/login',
    authType: 'Username + Password',
    credentialReference: {
      secretId: 'sec-schoolsoft-03',
      secretProvider: 'DevelopmentSecretProvider',
      vaultPath: 'vault://schoolsoft/prod/bot_token',
      usernameIdentifier: 'ops_crawler_bot_03',
      credentialConfigured: true,
      lastRotated: '17 Sep 2026 23:30:00 UTC'
    },
    lastVerified: '17 Sep 2026 23:30',
    reportDefinition: {
      reportName: 'Fee Collection Detail Statement',
      schoolParameter: 'school_id',
      dateParameter: 'from_date',
      dateFormat: 'DD-MM-YYYY',
      expectedFileType: 'XLSX',
      filenamePattern: 'schoolsoft_statement_*.xlsx',
      downloadTimeoutSec: 30,
      minExpectedFileSizeKb: 20
    },
    navigationSteps: [],
    schoolMappings: []
  }
];

export const mockSchools: School[] = [
  {
    id: 'SCH-004',
    code: 'UTTARA_MDL',
    name: 'Uttara Model High School',
    vendorId: 'VEND-01',
    vendorName: 'TransBingo Demo',
    internalSchoolId: 'TAP_SCH_1004',
    merchantId: 'MCH_TRANS_8895',
    schedule: 'Daily 1 AM',
    lastReconciliation: '18 Sep 2026 01:05',
    status: 'Active',
    totalStudents: 4100,
    contactEmail: 'admin@uttaramodel.edu.bd',
    contactPhone: '+880 1911-567890'
  },
  {
    id: 'SCH-001',
    code: 'ABC_INT',
    name: 'ABC School',
    vendorId: 'VEND-01',
    vendorName: 'TransBingo Demo',
    internalSchoolId: 'TAP_SCH_1001',
    merchantId: 'MCH_TRANS_8892',
    schedule: 'Daily 1 AM',
    lastReconciliation: '18 Sep 2026 01:04',
    status: 'Active',
    totalStudents: 3450,
    contactEmail: 'accounts@abcschool.edu.bd',
    contactPhone: '+880 1711-234567'
  },
  {
    id: 'SCH-002',
    code: 'DPS_STS',
    name: 'DPS School',
    vendorId: 'VEND-02',
    vendorName: 'EduPay',
    internalSchoolId: 'TAP_SCH_1002',
    merchantId: 'MCH_EDUP_9910',
    schedule: 'Daily 1 AM',
    lastReconciliation: '18 Sep 2026 01:12',
    status: 'Active',
    totalStudents: 2890,
    contactEmail: 'bursar@dpsdhaka.org',
    contactPhone: '+880 1712-345678'
  },
  {
    id: 'SCH-003',
    code: 'XYZ_ACAD',
    name: 'XYZ School',
    vendorId: 'VEND-03',
    vendorName: 'SchoolSoft',
    internalSchoolId: 'TAP_SCH_1003',
    merchantId: 'MCH_SSOFT_7721',
    schedule: 'Daily 2 AM',
    lastReconciliation: '17 Sep 2026 02:15',
    status: 'Paused',
    totalStudents: 1420,
    contactEmail: 'finance@xyzacademy.com',
    contactPhone: '+880 1819-456789'
  }
];

export const mockReconRuns: ReconRun[] = [
  {
    id: 'REC-20260919',
    businessDate: '19 Sep 2026',
    status: ReconStatus.RUNNING,
    schoolsTotal: 148,
    schoolsCompleted: 107,
    schoolsRunning: 24,
    schoolsNeedReview: 10,
    schoolsFailed: 7,
    exceptionsCount: 428,
    matchedAmount: 384500000,
    vendorAmount: 412500000,
    systemAmount: 412800000,
    differenceAmount: 300000,
    startTime: '01:00:00',
    duration: '14m 21s (ongoing)',
    progressPercent: 72.3
  },
  {
    id: 'REC-20260918',
    businessDate: '18 Sep 2026',
    status: ReconStatus.COMPLETED,
    schoolsTotal: 148,
    schoolsCompleted: 144,
    schoolsRunning: 0,
    schoolsNeedReview: 3,
    schoolsFailed: 1,
    exceptionsCount: 616,
    matchedAmount: 481798873,
    vendorAmount: 482180000,
    systemAmount: 482190000,
    differenceAmount: 391127,
    startTime: '01:00:00',
    duration: '16m 38s',
    progressPercent: 100
  }
];

export const mockSchoolReconRuns: SchoolReconRun[] = [
  {
    id: 'SRR-004',
    runId: 'REC-20260918',
    schoolId: 'SCH-004',
    schoolName: 'Uttara Model High School',
    vendorName: 'TransBingo Demo',
    businessDate: '18 Sep 2026',
    vendorCollectionStatus: 'Complete',
    systemCollectionStatus: 'Complete',
    validationStatus: 'Valid',
    reconciliationStatus: 'Complete',
    overallStatus: ReconStatus.COMPLETED,
    exceptionsCount: 17,
    amountDifference: 12450,
    elapsedTime: '21s',
    vendorReportFile: 'TransBingo_Collection_20260918.xlsx',
    vendorRows: 1842,
    vendorAmount: 4821500,
    vendorDownloadedAt: '10:42:20',
    vendorFileStatus: 'Valid',
    systemRows: 1845,
    systemAmount: 4833950,
    systemCollectedAt: '01:02:18',
    systemSourceStatus: 'Valid',
    exactMatches: 1825,
    systemOnlyCount: 12,
    vendorOnlyCount: 5,
    amountMismatchCount: 0,
    duplicateCount: 0,
    currentStage: PipelineStage.RECONCILIATION,
    currentAction: 'Complete',
    activeJobName: 'COL-20260918-0001'
  },
  {
    id: 'SRR-001',
    runId: 'REC-20260918',
    schoolId: 'SCH-001',
    schoolName: 'ABC School',
    vendorName: 'TransBingo Demo',
    businessDate: '18 Sep 2026',
    vendorCollectionStatus: 'Complete',
    systemCollectionStatus: 'Complete',
    validationStatus: 'Valid',
    reconciliationStatus: 'Review Required',
    overallStatus: ReconStatus.NEED_REVIEW,
    exceptionsCount: 10,
    amountDifference: 5500,
    elapsedTime: '1m 24s',
    vendorReportFile: 'report_18092026.xlsx',
    vendorRows: 1782,
    vendorAmount: 8712990,
    vendorDownloadedAt: '01:02:22',
    vendorFileStatus: 'Valid',
    systemRows: 1785,
    systemAmount: 8718490,
    systemCollectedAt: '01:01:51',
    systemSourceStatus: 'Valid',
    exactMatches: 1775,
    systemOnlyCount: 6,
    vendorOnlyCount: 3,
    amountMismatchCount: 1,
    duplicateCount: 0,
    currentStage: PipelineStage.EXCEPTION_ANALYSIS,
    currentAction: 'AI Investigating Exceptions',
    activeJobName: 'ai_investigation_worker_01'
  }
];

export const mockExceptions: ReconException[] = [
  {
    id: 'EX-009821',
    ref: 'EX-009821',
    schoolId: 'SCH-001',
    schoolName: 'ABC School',
    vendorId: 'VEND-01',
    vendorName: 'TransBingo Demo',
    type: ExceptionType.VENDOR_ONLY,
    vendorRef: 'V019881',
    systemRef: 'TX018812',
    amount: 5500,
    difference: 5500,
    aiStatus: ExceptionStatus.AI_ANALYZING,
    age: '2h',
    priority: ExceptionPriority.HIGH,
    status: ExceptionStatus.AI_ANALYZING,
    businessDate: '18 Sep 2026',
    createdAt: '18 Sep 2026 01:04:12'
  }
];

export const mockMatchCandidate: ReconMatchCandidate = {
  ruleId: 'R004_STUDENT_AMOUNT_TIME',
  ruleName: 'Match by Student ID + Exact Amount + Window < 15s',
  vendorRef: 'V019881',
  systemRef: 'TX018812',
  vendorStudentId: '100921',
  systemStudentId: '100921',
  vendorAmount: 5500,
  systemAmount: 5500,
  businessDate: '18 Sep 2026',
  vendorTime: '09:31:12',
  systemTime: '09:31:18',
  timeDifferenceSec: 6,
  matchScore: 96.5,
  status: 'POSSIBLE MATCH'
};

export const mockAgentInvestigation: AgentInvestigation = {
  id: 'AI-INV-9821',
  exceptionId: 'EX-009821',
  exceptionRef: 'EX-009821',
  schoolName: 'ABC School',
  exceptionType: ExceptionType.VENDOR_ONLY,
  status: 'Completed',
  probableCause: 'Vendor callback appears missing from network delivery log.',
  confidence: 91,
  recommendedAction: 'Manual Review & Sync Settlement Entry',
  startedAt: '10:21:00',
  duration: '1m 23s',
  model: 'gpt-4o-financial-recon-v3',
  tokensUsed: 1420,
  timeline: [
    { time: '10:21', step: 'Loaded exception', status: 'completed', detail: 'Identified vendor reference V019881 from report_18092026.xlsx' },
    { time: '10:21', step: 'Retrieved TAP transaction', status: 'completed', detail: 'Fetched internal record TxID: TAP09182 for student 100921' },
    { time: '10:22', step: 'Gateway searched', status: 'completed', detail: 'Queried bKash settlement gateway API for order matching ৳5,500' },
    { time: '10:22', step: 'Payment success found', status: 'completed', detail: 'Payment gateway confirmed captured status' },
    { time: '10:22', step: 'Callback logs searched', status: 'completed', detail: 'Checked rabbitMQ and HTTP callback delivery logs for vendor endpoint' },
    { time: '10:23', step: 'Callback not found', status: 'completed', detail: 'No 200 OK webhook acknowledgement logged from vendor side' }
  ],
  tools: [
    { name: 'Transaction lookup', status: 'completed' },
    { name: 'Gateway lookup', status: 'completed' },
    { name: 'Callback search', status: 'completed' },
    { name: 'Reversal lookup', status: 'pending' },
    { name: 'Refund lookup', status: 'pending' }
  ]
};

export const mockArtifacts: Artifact[] = [
  {
    id: 'ART-001',
    date: '18 Sep 2026',
    schoolName: 'Uttara Model High School',
    source: 'Vendor',
    fileName: 'TransBingo_Collection_20260918.xlsx',
    fileType: 'XLSX',
    rows: 1842,
    amount: 4821500,
    sha256: '0a0bc010293a76d1d8ca80bbded61eed60805656e2eb42eedb447db652c9556e',
    status: 'Valid',
    fileSize: '78.2 KB',
    downloadedAt: '18 Sep 2026 10:42:20',
    relatedRunId: 'REC-20260918',
    previewData: [
      { Row: 1, Ref: 'TXN001', StudentID: 'STU1001', Name: 'Tanvir Rahman', Amount: 500, Date: '18/09/2026', Status: 'PAID' },
      { Row: 2, Ref: 'TXN002', StudentID: 'STU1002', Name: 'Sadia Sultana', Amount: 1000, Date: '18/09/2026', Status: 'PAID' },
      { Row: 3, Ref: 'TXN003', StudentID: 'STU1003', Name: 'Nabil Ahmed', Amount: 5500, Date: '18/09/2026', Status: 'PAID' },
      { Row: 4, Ref: 'TXN004', StudentID: 'STU1004', Name: 'Farhana Kabir', Amount: 4500, Date: '18/09/2026', Status: 'PAID' }
    ]
  },
  {
    id: 'ART-002',
    date: '18 Sep 2026',
    schoolName: 'ABC School',
    source: 'Vendor',
    fileName: 'report_18092026.xlsx',
    fileType: 'XLSX',
    rows: 1782,
    amount: 8712990,
    sha256: '5b44941314d3a71db24291fcab45fb935942cc93509bc171edf6f5da3a2a982d',
    status: 'Valid',
    fileSize: '79.2 KB',
    downloadedAt: '18 Sep 2026 01:02:22',
    relatedRunId: 'REC-20260918'
  }
];

export const mockHealthServices: ServiceHealthItem[] = [
  { name: 'API Gateway (.NET Core)', status: HealthStatus.HEALTHY, latencyMs: 24, uptime: '99.98%' },
  { name: 'SQL Server 2022 Cluster', status: HealthStatus.HEALTHY, latencyMs: 12, uptime: '99.99%' },
  { name: 'RabbitMQ Message Broker', status: HealthStatus.HEALTHY, latencyMs: 8, uptime: '99.95%' },
  { name: 'Redis Cache Cluster', status: HealthStatus.HEALTHY, latencyMs: 4, uptime: '100%' },
  { name: 'MinIO S3 Evidence Store', status: HealthStatus.HEALTHY, latencyMs: 18, uptime: '99.99%' },
  { name: 'OpenAI Agent Endpoint', status: HealthStatus.HEALTHY, latencyMs: 340, uptime: '99.85%' }
];

export const mockWorkerStatus: WorkerStatus = {
  portalWorkers: { active: 8, total: 8 },
  reconWorkers: { active: 4, total: 4 },
  aiWorkers: { active: 2, total: 2 }
};

export const mockQueueStatus: QueueStatus = {
  vendorCollection: 21,
  fileProcessing: 5,
  reconciliation: 12,
  aiInvestigation: 8,
  deadLetter: 1
};

export const mockAuditEvents: AuditEvent[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-09-18 10:21:03',
    timeOnly: '10:21:03',
    event: 'Reconciliation started',
    schoolName: 'ABC School',
    runId: 'REC-20260918',
    user: 'SYSTEM',
    entity: 'BatchRunner',
    result: 'Initiated 148 schools'
  }
];

export const mockScheduleItems: ScheduleItem[] = [
  { id: 'SCHED-1', time: '00:30', title: 'TAP data preparation', description: 'Extract API ledger & generate snapshot', type: 'prep', active: true },
  { id: 'SCHED-2', time: '01:00', title: '82 schools batch run', description: 'TransBingo & EduPay priority cluster', schoolsCount: 82, type: 'batch', active: true },
  { id: 'SCHED-3', time: '01:15', title: '37 schools batch run', description: 'SmartCampus & BrainCraft portals', schoolsCount: 37, type: 'batch', active: true },
  { id: 'SCHED-4', time: '01:30', title: '29 schools batch run', description: 'SchoolSoft & EduSheba SFTP cluster', schoolsCount: 29, type: 'batch', active: true },
  { id: 'SCHED-5', time: '03:00', title: 'Retry window', description: 'Automated retry for failed portal sessions', type: 'retry', active: true },
  { id: 'SCHED-6', time: '05:00', title: 'Escalation check', description: 'Notify on-call operations if unresolved diff > ৳50K', type: 'escalation', active: true }
];
