export enum ReconStatus {
  COMPLETED = 'Completed',
  RUNNING = 'Running',
  NEED_REVIEW = 'Review Required',
  FAILED = 'Failed',
  WAITING = 'Waiting',
  BLOCKED = 'Blocked',
  PAUSED = 'Paused'
}

export enum PipelineStage {
  COLLECTION = 'Collection',
  VALIDATION = 'Validation',
  RECONCILIATION = 'Reconciliation',
  EXCEPTION_ANALYSIS = 'Exception Analysis'
}

export enum ExceptionType {
  VENDOR_ONLY = 'Vendor Only',
  SYSTEM_ONLY = 'System Only',
  AMOUNT_MISMATCH = 'Amount Mismatch',
  DUPLICATE_VENDOR = 'Duplicate Vendor',
  DUPLICATE_SYSTEM = 'Duplicate System',
  STATUS_MISMATCH = 'Status Mismatch',
  POSSIBLE_MATCH = 'Possible Match',
  UNRESOLVED = 'Unresolved'
}

export enum ExceptionPriority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum ExceptionStatus {
  OPEN = 'Open',
  AI_ANALYZING = 'AI Analysing',
  REVIEW_REQUIRED = 'Review Required',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected'
}

export enum HealthStatus {
  HEALTHY = 'Healthy',
  DEGRADED = 'Degraded',
  DOWN = 'Down'
}

export enum ConnectorType {
  PORTAL_CRAWLER = 'Browser Automation',
  API_CONNECTOR = 'API',
  MANUAL_UPLOAD = 'Manual Upload',
  SFTP = 'SFTP / File Transfer'
}

// --- VENDOR AUTOMATION & COLLECTION JOB TYPES ---

export type JobStatus =
  | 'QUEUED'
  | 'STARTING'
  | 'AUTHENTICATING'
  | 'NAVIGATING'
  | 'GENERATING_REPORT'
  | 'DOWNLOADING'
  | 'VALIDATING'
  | 'STORING'
  | 'COMPLETED'
  | 'FAILED'
  | 'NEEDS_ATTENTION';

export type SelectorStrategy = 'data-testid' | 'id' | 'name' | 'css' | 'text' | 'role';

export type StepAction = 'NAVIGATE' | 'FILL' | 'CLICK' | 'WAIT_FOR' | 'SELECT' | 'SET_DATE' | 'DOWNLOAD';

export interface VendorNavigationStep {
  id: string;
  sequence: number;
  action: StepAction;
  selectorStrategy: SelectorStrategy;
  selector: string;
  value?: string;
  description: string;
  timeoutMs: number;
  retryCount: number;
  isRequired: boolean;
}

export interface VendorCredentialReference {
  secretId: string;
  secretProvider: 'DevelopmentSecretProvider' | 'VaultSecretProvider' | 'AzureKeyVault' | 'AWSSecretsManager';
  vaultPath: string;
  usernameIdentifier: string;
  credentialConfigured: boolean;
  lastRotated: string;
}

export interface VendorReportDefinition {
  reportName: string;
  schoolParameter: string;
  dateParameter: string;
  dateFormat: string;
  expectedFileType: string;
  filenamePattern: string;
  downloadTimeoutSec: number;
  minExpectedFileSizeKb: number;
}

export interface VendorSchoolMapping {
  internalSchoolId: string;
  internalSchoolName: string;
  vendorSchoolCode: string;
  vendorSchoolLabel: string;
}

export interface ExecutionScreenshot {
  name: string;
  url: string;
  stepSequence: number;
  timestamp: string;
  description: string;
}

export interface CollectionEvent {
  timestamp: string;
  message: string;
  isSuccess?: boolean;
  isError?: boolean;
}

export interface AiBrowserSupervisorAlert {
  targetElement: string;
  detectedReplacement: string;
  confidence: number;
  suggestedSelector: string;
  approved?: boolean;
}

export interface VendorArtifact {
  id: string;
  vendorId: string;
  vendorName: string;
  schoolId: string;
  schoolName: string;
  businessDate: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  rowCount: number;
  totalAmount: number;
  sha256: string;
  collectedAt: string;
  collectionJobId: string;
  status: 'Valid' | 'Corrupt';
  previewData?: Array<Record<string, string | number>>;
}

export interface VendorCollectionJob {
  id: string;
  vendorId: string;
  vendorName: string;
  schoolId: string;
  schoolName: string;
  businessDate: string;
  status: JobStatus;
  mode: 'DEMO' | 'LIVE';
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  currentStepIndex: number;
  totalSteps: number;
  currentAction: string;
  currentUrl: string;
  browserStatus: 'LAUNCHING' | 'NAVIGATING' | 'READY' | 'DOWNLOADING' | 'CLOSED';
  latestScreenshotUrl?: string;
  screenshots: ExecutionScreenshot[];
  events: CollectionEvent[];
  failureReason?: string;
  aiSuggestion?: AiBrowserSupervisorAlert;
  artifact?: VendorArtifact;
}

export interface VendorReportReadyEvent {
  eventType: 'VENDOR_REPORT_READY';
  vendorId: string;
  schoolId: string;
  businessDate: string;
  artifactId: string;
  collectionJobId: string;
  rowCount: number;
  totalAmount: number;
  sha256: string;
  timestamp: string;
}

// --- STANDARD ENTITY MODELS ---

export interface School {
  id: string;
  code: string;
  name: string;
  vendorId: string;
  vendorName: string;
  internalSchoolId: string;
  merchantId: string;
  schedule: string;
  lastReconciliation: string;
  status: 'Active' | 'Paused' | 'Inactive';
  totalStudents: number;
  contactEmail: string;
  contactPhone: string;
}

export interface Vendor {
  id: string;
  name: string;
  code: string;
  connectorType: ConnectorType;
  schoolsCount: number;
  lastCollection: string;
  successRate: number;
  health: HealthStatus;
  portalUrl: string;
  loginUrl: string;
  authType: 'Username + Password' | 'Username + Password + OTP' | 'API Key' | 'Custom';
  credentialReference: VendorCredentialReference;
  lastVerified: string;
  reportDefinition: VendorReportDefinition;
  navigationSteps: VendorNavigationStep[];
  schoolMappings: VendorSchoolMapping[];
  isActive: boolean;
  rowVersion?: number;
}

export interface ReconRun {
  id: string;
  businessDate: string;
  status: ReconStatus;
  schoolsTotal: number;
  schoolsCompleted: number;
  schoolsRunning: number;
  schoolsNeedReview: number;
  schoolsFailed: number;
  exceptionsCount: number;
  matchedAmount: number;
  vendorAmount: number;
  systemAmount: number;
  differenceAmount: number;
  startTime: string;
  duration: string;
  progressPercent: number;
}

export interface SchoolReconRun {
  id: string;
  runId: string;
  schoolId: string;
  schoolName: string;
  vendorName: string;
  businessDate: string;
  vendorCollectionStatus: 'Complete' | 'Running' | 'Failed' | 'Waiting';
  systemCollectionStatus: 'Complete' | 'Running' | 'Failed' | 'Waiting';
  validationStatus: 'Valid' | 'Running' | 'Invalid' | 'Blocked';
  reconciliationStatus: 'Complete' | 'Running' | 'Review Required' | 'Blocked' | 'Failed';
  overallStatus: ReconStatus;
  exceptionsCount: number;
  amountDifference: number;
  elapsedTime: string;

  vendorReportFile: string;
  vendorRows: number;
  vendorAmount: number;
  vendorDownloadedAt: string;
  vendorFileStatus: 'Valid' | 'Corrupt' | 'Pending';

  systemRows: number;
  systemAmount: number;
  systemCollectedAt: string;
  systemSourceStatus: 'Valid' | 'Pending' | 'Error';

  exactMatches: number;
  systemOnlyCount: number;
  vendorOnlyCount: number;
  amountMismatchCount: number;
  duplicateCount: number;

  currentStage?: PipelineStage;
  currentAction?: string;
  activeJobName?: string;
}

export interface ReconException {
  id: string;
  ref: string;
  schoolId: string;
  schoolName: string;
  vendorId: string;
  vendorName: string;
  type: ExceptionType;
  vendorRef?: string;
  systemRef?: string;
  amount: number;
  difference: number;
  aiStatus: ExceptionStatus;
  age: string;
  priority: ExceptionPriority;
  status: ExceptionStatus;
  businessDate: string;
  createdAt: string;

  vendorEvidence?: {
    reference: string;
    studentId: string;
    studentName: string;
    amount: number;
    timestamp: string;
    status: string;
    file: string;
    rowNumber: number;
  };
  systemEvidence?: {
    txId: string;
    studentId: string;
    studentName: string;
    amount: number;
    timestamp: string;
    status: string;
    gatewayStatus: string;
    gatewayRef: string;
    paymentMethod: string;
  };
}

export interface AgentInvestigation {
  id: string;
  exceptionId: string;
  exceptionRef: string;
  schoolName: string;
  exceptionType: ExceptionType;
  status: 'In Progress' | 'Completed' | 'Human Review Needed';
  probableCause: string;
  confidence: number;
  recommendedAction: string;
  startedAt: string;
  duration: string;
  model: string;
  tokensUsed: number;
  timeline: {
    time: string;
    step: string;
    status: 'completed' | 'in-progress' | 'pending';
    detail?: string;
  }[];
  tools: {
    name: string;
    status: 'completed' | 'running' | 'pending';
  }[];
}

export interface ReconMatchCandidate {
  ruleId: string;
  ruleName: string;
  vendorRef: string;
  systemRef: string;
  vendorStudentId: string;
  systemStudentId: string;
  vendorAmount: number;
  systemAmount: number;
  businessDate: string;
  vendorTime: string;
  systemTime: string;
  timeDifferenceSec: number;
  matchScore: number;
  status: 'POSSIBLE MATCH' | 'CONFIRMED' | 'REJECTED';
}

export interface Artifact {
  id: string;
  date: string;
  schoolName: string;
  source: 'Vendor' | 'System (TAP)' | 'Settlement';
  fileName: string;
  fileType: 'XLSX' | 'CSV' | 'JSON' | 'PDF';
  rows: number;
  amount: number;
  sha256: string;
  status: 'Valid' | 'Processing' | 'Failed';
  fileSize: string;
  downloadedAt: string;
  relatedRunId: string;
  previewData?: Array<Record<string, string | number>>;
}

export interface ServiceHealthItem {
  name: string;
  status: HealthStatus;
  latencyMs: number;
  uptime: string;
}

export interface WorkerStatus {
  portalWorkers: { active: number; total: number };
  reconWorkers: { active: number; total: number };
  aiWorkers: { active: number; total: number };
}

export interface QueueStatus {
  vendorCollection: number;
  fileProcessing: number;
  reconciliation: number;
  aiInvestigation: number;
  deadLetter: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  timeOnly: string;
  event: string;
  schoolName?: string;
  runId: string;
  user: string;
  entity: string;
  result: string;
  details?: Record<string, any>;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  schoolsCount?: number;
  type: 'prep' | 'batch' | 'retry' | 'escalation';
  active: boolean;
}
