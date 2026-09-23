import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  AlertTriangle,
  Lock,
  Play,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Server,
  FileSpreadsheet,
  Globe,
  Sliders,
  Calendar,
  Layers,
  Key,
  Database,
  Eye,
  AlertCircle,
  FileCheck,
  AlertOctagon,
  Check,
  X,
  Clock,
  Download,
  Camera,
  Bot,
  Plus,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Pencil
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { mockVendors } from '../mocks/mockData';
import { reconService } from '../services/reconService';
import {
  Vendor,
  VendorNavigationStep,
  VendorCollectionJob,
  JobStatus,
  StepAction,
  SelectorStrategy,
  VendorConnectorConfig
} from '../types';

interface VendorConfigPageProps {
  vendorId?: string;
  onBack: () => void;
  onNavigateArtifacts?: () => void;
}

export const VendorConfigPage: React.FC<VendorConfigPageProps> = ({
  vendorId = 'VEND-01',
  onBack,
  onNavigateArtifacts
}) => {
  const [vendor, setVendor] = useState<Vendor>(
    () => mockVendors.find(v => v.id === vendorId) || mockVendors[0]
  );

  const [activeTab, setActiveTab] = useState<
    'General' | 'Authentication' | 'Navigation' | 'Report' | 'Testing'
  >('Testing');

  // Test Selection Form
  const [selectedSchoolCode, setSelectedSchoolCode] = useState('UTTARA_MDL');
  const [selectedBusinessDate, setSelectedBusinessDate] = useState('18-Sep-2026');
  const [selectedScenario, setSelectedScenario] = useState('normal');

  // Active Job Telemetry State
  const [activeJob, setActiveJob] = useState<VendorCollectionJob | null>(null);
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState<number>(0);
  const [aiApprovalNotice, setAiApprovalNotice] = useState<string | null>(null);

  // Persistence & Save State (SQL Server / ASP.NET Core REST API)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error' | 'conflict'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [rowVersion, setRowVersion] = useState<number>(vendor.rowVersion || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [environment, setEnvironment] = useState(vendor.credentialReference.environment || 'DEMO');
  const [connector, setConnector] = useState<VendorConnectorConfig>({
    vendorConnectorId: '', vendorId, connectorName: '', loginUrl: vendor.loginUrl,
    connectorType: vendor.connectorType, defaultTimeoutSeconds: 30, maxRetryCount: 2,
    isActive: true, rowVersion: vendor.rowVersion || 1
  });

  // Load latest configuration from SQL Server via API on mount
  const [savedSteps, setSavedSteps] = useState<VendorNavigationStep[]>(vendor.navigationSteps || []);
  const [editingStep, setEditingStep] = useState<VendorNavigationStep | null>(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([reconService.getVendor(vendorId), reconService.getNavigationSteps(vendorId)])
      .then(([v, navigationSteps]) => {
        if (!v) throw new Error(`Vendor '${vendorId}' was not found.`);
        setVendor(v);
        setSteps(navigationSteps);
        setSavedSteps(navigationSteps);
        if (v.rowVersion) setRowVersion(v.rowVersion);
      })
      .catch(err => {
        setSaveState('error');
        setStatusMessage(err.message || 'Unable to load vendor.');
      })
      .finally(() => setIsLoading(false));
  }, [vendorId]);

  useEffect(() => {
    Promise.all([
      reconService.getVendorConnector(vendorId),
      reconService.getCredentialReference(vendorId, environment)
    ]).then(([loadedConnector, credential]) => {
      if (loadedConnector) setConnector(loadedConnector);
      if (credential) {
        setVendor(current => ({ ...current, authType: credential.authenticationType, credentialReference: credential }));
        setRowVersion(credential.rowVersion);
      } else {
        setVendor(current => ({
          ...current,
          authType: 'Username + Password',
          credentialReference: {
            secretId: '', vendorId, environment, authenticationType: 'Username + Password',
            secretProvider: 'DevelopmentSecretProvider', vaultPath: '', credentialConfigured: false,
            rowVersion: current.rowVersion || rowVersion
          }
        }));
      }
    }).catch(err => {
      setSaveState('error');
      setStatusMessage(err.message || 'Unable to load portal/authentication configuration.');
    });
  }, [vendorId, environment]);

  const handleSaveConfiguration = async () => {
    setSaveState('saving');
    setStatusMessage(null);
    try {
      if (activeTab === 'Authentication') {
        const savedConnector = await reconService.saveVendorConnector(vendorId, { ...connector, rowVersion });
        const credentialPayload = {
          ...vendor.credentialReference,
          vendorId,
          environment,
          authenticationType: vendor.authType || 'Username + Password',
          rowVersion: savedConnector.rowVersion
        };
        await reconService.saveCredentialReference(vendorId, credentialPayload);
        const [reloadedConnector, reloadedCredential] = await Promise.all([
          reconService.getVendorConnector(vendorId),
          reconService.getCredentialReference(vendorId, environment)
        ]);
        if (!reloadedConnector || !reloadedCredential) throw new Error('Configuration was saved but could not be reloaded.');
        setConnector(reloadedConnector);
        setVendor(current => ({ ...current, loginUrl: reloadedConnector.loginUrl, authType: reloadedCredential.authenticationType, credentialReference: reloadedCredential }));
        setRowVersion(reloadedCredential.rowVersion);
        setSaveState('saved');
        setStatusMessage('Portal and authentication metadata was saved and reloaded from SQL Server.');
        setTimeout(() => setSaveState('idle'), 4000);
        return;
      }

      if (activeTab === 'Navigation') {
        const normalized = steps.map((step, index) => ({ ...step, sequence: index + 1 }));
        const saved = await reconService.saveNavigationSteps(vendorId, normalized);
        setSteps(saved);
        setSavedSteps(saved);
        setSaveState('saved');
        setStatusMessage('Navigation workflow was saved atomically and reloaded from SQL Server.');
        setTimeout(() => setSaveState('idle'), 4000);
        return;
      }

      const payload: Vendor = {
        ...vendor,
        rowVersion: rowVersion,
        navigationSteps: steps
      };
      await reconService.updateVendor(payload);
      const reloaded = await reconService.getVendor(vendorId);
      if (!reloaded) throw new Error('Vendor was saved but could not be reloaded.');
      setVendor(reloaded);
      setSteps(reloaded.navigationSteps || []);
      if (reloaded.rowVersion) setRowVersion(reloaded.rowVersion);
      setSaveState('saved');
      setStatusMessage('Vendor basic information was saved and reloaded from the backend.');
      setTimeout(() => setSaveState('idle'), 4000);
    } catch (err: any) {
      if (err.message?.includes('Concurrency conflict') || err.message?.includes('modified by another operator')) {
        setSaveState('conflict');
        setStatusMessage('Concurrency Conflict: Configuration was modified by another operator. Reloading latest from SQL Server.');
        const reloaded = await reconService.getVendor(vendorId);
        if (reloaded) {
          setVendor(reloaded);
          setSteps(reloaded.navigationSteps || []);
          if (reloaded.rowVersion) setRowVersion(reloaded.rowVersion);
        }
      } else {
        setSaveState('error');
        setStatusMessage(err.message || 'Validation error: Invalid configuration parameters.');
      }
    }
  };

  // Steps state
  const [steps, setSteps] = useState<VendorNavigationStep[]>(vendor.navigationSteps || []);

  const resequence = (items: VendorNavigationStep[]) => items.map((step, index) => ({ ...step, sequence: index + 1 }));
  const moveStep = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    setSteps(resequence(next));
  };
  const duplicateStep = (index: number) => {
    const source = steps[index];
    const copy = { ...source, id: '', stepCode: `${source.stepCode || 'STEP'}_COPY` };
    const next = [...steps];
    next.splice(index + 1, 0, copy);
    setSteps(resequence(next));
    setEditingStep({ ...copy, sequence: index + 2 });
  };
  const newStep = (): VendorNavigationStep => ({
    id: '', sequence: steps.length + 1, stepCode: '', action: 'CLICK', selectorStrategy: 'data-testid',
    selector: '', description: '', timeoutMs: 15000, retryCount: 1, isRequired: true, isActive: true
  });
  const commitEditedStep = () => {
    if (!editingStep) return;
    const next = [...steps];
    const existing = editingStep.id ? next.findIndex(s => s.id === editingStep.id) : -1;
    const sequenceIndex = Math.max(0, editingStep.sequence - 1);
    if (existing >= 0) next[existing] = editingStep;
    else if (sequenceIndex < next.length && next[sequenceIndex].id === '') next[sequenceIndex] = editingStep;
    else next.splice(sequenceIndex, 0, editingStep);
    setSteps(resequence(next));
    setEditingStep(null);
  };

  const schoolOptions = [
    { code: 'UTTARA_MDL', name: 'Uttara Model High School' },
    { code: 'ABC_INT', name: 'ABC School' },
    { code: 'DHAKA_MDL', name: 'Dhaka Model School' }
  ];

  const handleRunFullTest = async (testType: 'portal' | 'login' | 'navigation' | 'download' | 'full') => {
    const schoolObj = schoolOptions.find(s => s.code === selectedSchoolCode) || schoolOptions[0];
    const jobId = `COL-20260918-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialJob: VendorCollectionJob = {
      id: jobId,
      vendorId: vendor.id,
      vendorName: vendor.name,
      schoolId: 'SCH-004',
      schoolName: schoolObj.name,
      businessDate: selectedBusinessDate,
      status: 'STARTING',
      mode: 'DEMO',
      startedAt: new Date().toLocaleTimeString(),
      durationSeconds: 0,
      currentStepIndex: 1,
      totalSteps: 13,
      currentAction: 'Starting collection agent...',
      currentUrl: 'http://localhost:8085/demo-vendor/login',
      browserStatus: 'LAUNCHING',
      screenshots: [],
      events: [{ timestamp: new Date().toLocaleTimeString(), message: `Job ${jobId} queued (Scenario: ${selectedScenario})` }]
    };

    setActiveJob(initialJob);
    setActiveTab('Testing');

    // Simulate real-time progress steps leading up to final result
    const logEvent = (msg: string, isSuccess = false, isError = false) => {
      setActiveJob(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          events: [...prev.events, { timestamp: new Date().toLocaleTimeString(), message: msg, isSuccess, isError }]
        };
      });
    };

    // Trigger backend agent
    try {
      const result = await reconService.executeCollectionAgentJob({
        jobId,
        vendorId: vendor.id,
        schoolCode: selectedSchoolCode,
        schoolName: schoolObj.name,
        businessDate: selectedBusinessDate,
        scenario: selectedScenario,
        testType,
        onProgress: update => {
          setActiveJob(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              ...update,
              events: [...prev.events, ...(update.events || [])]
            };
          });
        }
      });

      setActiveJob(result);
      if (result.screenshots && result.screenshots.length > 0) {
        setSelectedScreenshotIndex(result.screenshots.length - 1);
      }
    } catch (err: any) {
      logEvent(`Execution error: ${err.message}`, false, true);
    }
  };

  const handleApproveAiSuggestion = () => {
    if (!activeJob?.aiSuggestion) return;
    setAiApprovalNotice(
      `Approved: Updated step 7 selector to "${activeJob.aiSuggestion.suggestedSelector}". Connector configuration saved.`
    );
    setActiveJob(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'COMPLETED',
        failureReason: undefined,
        events: [
          ...prev.events,
          {
            timestamp: new Date().toLocaleTimeString(),
            message: `Operator approved AI suggestion: "${activeJob.aiSuggestion?.detectedReplacement}"`,
            isSuccess: true
          }
        ]
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vendors</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            DEMO VENDOR CONNECTOR (v{rowVersion})
          </span>
          <StatusBadge status={vendor.isActive ? 'Active' : 'Inactive'} />

          {/* SAVE CONFIGURATION BUTTON */}
          <button
            onClick={handleSaveConfiguration}
            disabled={saveState === 'saving' || isLoading}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
              saveState === 'saving'
                ? 'bg-blue-400 text-white cursor-wait'
                : saveState === 'saved'
                ? 'bg-emerald-600 text-white'
                : saveState === 'conflict'
                ? 'bg-amber-600 text-white animate-pulse'
                : saveState === 'error'
                ? 'bg-rose-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            {saveState === 'saving' && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
            {saveState === 'saved' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {saveState === 'conflict' && <AlertTriangle className="w-3.5 h-3.5" />}
            {saveState === 'error' && <AlertOctagon className="w-3.5 h-3.5" />}
            {saveState === 'idle' && <Save className="w-3.5 h-3.5" />}

            <span>
              {saveState === 'saving'
                ? 'SAVING TO SQL...'
                : saveState === 'saved'
                ? 'SAVED TO SQL ✓'
                : saveState === 'conflict'
                ? 'CONCURRENCY CONFLICT'
                : saveState === 'error'
                ? 'VALIDATION ERROR'
                : 'SAVE CONFIGURATION'}
            </span>
          </button>
        </div>
      </div>

      <PageHeader
        title={`${vendor.name} — Connector Configuration`}
        subtitle="Automated browser crawler rules, Vault credential integration, and live Playwright execution agent"
      />

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
            saveState === 'saved'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : saveState === 'conflict'
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-600 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'Testing', label: '⚡ Connector Test & Live Agent' },
          { id: 'General', label: '1. General' },
          { id: 'Authentication', label: '2. Authentication' },
          { id: 'Navigation', label: `3. Navigation Workflow (${steps.length} Steps)` },
          { id: 'Report', label: '4. Report Schema & Parameters' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Connector Test & Live Agent Execution View */}
      {activeTab === 'Testing' && (
        <div className="space-y-6">
          {/* Top Test Control Bar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#14213D]">Connector Execution Panel — BACKEND-DEPENDENT / NOT IMPLEMENTED</h3>
                <p className="text-xs text-slate-500">
                  Execution controls are disabled. T04 configures workflow only and does not claim browser execution.
                </p>
              </div>

              {/* Mode indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Execution Mode:</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  DEMO PORTAL (PORT 8085)
                </span>
              </div>
            </div>

            {/* Target Parameters & Scenario Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target School</label>
                <select
                  value={selectedSchoolCode}
                  onChange={e => setSelectedSchoolCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {schoolOptions.map(s => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Date</label>
                <input
                  type="text"
                  value={selectedBusinessDate}
                  onChange={e => setSelectedBusinessDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  placeholder="18-Sep-2026"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Test Scenario (Demonstration)</label>
                <select
                  value={selectedScenario}
                  onChange={e => setSelectedScenario(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-blue-700"
                >
                  <option value="normal">Normal Success (Full Ingestion)</option>
                  <option value="invalid_password">Failure: Invalid Password</option>
                  <option value="portal_unreachable">Failure: Portal Unreachable</option>
                  <option value="login_element_changed">Failure: Login Element Changed</option>
                  <option value="report_menu_changed">Failure: Report Menu Changed (AI Supervisor)</option>
                  <option value="download_timeout">Failure: Download Timeout</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled title="Backend-dependent; not implemented"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg border border-slate-300 cursor-not-allowed"
                >
                  TEST PORTAL
                </button>
                <button
                  disabled title="Backend-dependent; not implemented"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg border border-slate-300 cursor-not-allowed"
                >
                  TEST LOGIN
                </button>
                <button
                  disabled title="Backend-dependent; not implemented"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg border border-slate-300 cursor-not-allowed"
                >
                  TEST NAVIGATION
                </button>
                <button
                  disabled title="Backend-dependent; not implemented"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg border border-slate-300 cursor-not-allowed"
                >
                  TEST DOWNLOAD
                </button>
              </div>

              <button
                disabled title="Backend-dependent; not implemented"
                className="px-5 py-2 text-xs font-bold text-slate-400 bg-slate-100 border rounded-xl cursor-not-allowed flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>RUN FULL TEST (XLSX INGESTION)</span>
              </button>
            </div>
          </div>

          {/* AI Supervisor Approval Notice if triggered */}
          {aiApprovalNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-between animate-in zoom-in-95">
              <span>{aiApprovalNotice}</span>
              <button onClick={() => setAiApprovalNotice(null)} className="text-emerald-700">✕</button>
            </div>
          )}

          {/* Live Agent Execution & Visual Observability (Split 50/50) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 6 cols: Live Agent Execution Log Console */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Collection Job</span>
                    <h3 className="text-sm font-bold text-[#14213D] font-mono">
                      {activeJob?.id || 'COL-20260918-0001'}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        activeJob?.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : activeJob?.status === 'FAILED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : activeJob?.status === 'NEEDS_ATTENTION'
                          ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                          : activeJob?.status === 'STARTING'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      STATUS: {activeJob?.status || 'IDLE'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] py-2 border-b border-slate-100 text-slate-600">
                  <div>Vendor: <strong className="text-slate-800">{vendor.name}</strong></div>
                  <div>School: <strong className="text-slate-800">{activeJob?.schoolName || 'Uttara Model'}</strong></div>
                  <div>Date: <strong className="text-slate-800">{activeJob?.businessDate || selectedBusinessDate}</strong></div>
                </div>

                {/* Live Activity Terminal */}
                <div className="mt-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Live Agent Activity</span>
                    <span className="font-mono">Duration: {activeJob?.durationSeconds || 0}s</span>
                  </div>

                  <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] space-y-1.5 h-64 overflow-y-auto">
                    {!activeJob?.events || activeJob.events.length === 0 ? (
                      <div className="text-slate-500 text-center py-10">
                        Ready for execution. Click "RUN FULL TEST" to observe the agent.
                      </div>
                    ) : (
                      activeJob.events.map((ev, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-slate-500 shrink-0">{ev.timestamp}</span>
                          <span
                            className={
                              ev.isSuccess
                                ? 'text-emerald-400 font-bold'
                                : ev.isError
                                ? 'text-rose-400 font-bold'
                                : 'text-slate-200'
                            }
                          >
                            {ev.message}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* AI Browser Supervisor Alert Box (if triggered) */}
                {activeJob?.aiSuggestion && (
                  <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3 animate-in zoom-in-95 text-xs text-amber-950">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>NEEDS ATTENTION — AI Browser Supervisor Alert</span>
                    </div>

                    <p className="text-amber-800">
                      Target element <strong>"{activeJob.aiSuggestion.targetElement}"</strong> was not found in the portal navigation DOM.
                    </p>

                    <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                      <div className="text-[11px] text-slate-500">Possible replacement detected:</div>
                      <div className="font-bold text-slate-800">{activeJob.aiSuggestion.detectedReplacement}</div>
                      <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                        Confidence: {activeJob.aiSuggestion.confidence}%
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleApproveAiSuggestion}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                      >
                        [Approve Suggested Mapping]
                      </button>
                      <button
                        onClick={() => {
                          setActiveJob(prev => prev ? { ...prev, status: 'FAILED' } : null);
                        }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                      >
                        [Reject]
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Artifact Result Card (Upon Completion) */}
              {activeJob?.artifact && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-xs text-emerald-950 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>COLLECTION COMPLETED — Artifact Stored</span>
                    </div>
                    <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      EVENT: VENDOR_REPORT_READY
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>File: <strong className="font-mono">{activeJob.artifact.fileName}</strong></div>
                    <div>Format: <strong>{activeJob.artifact.fileType}</strong> ({activeJob.artifact.fileSize})</div>
                    <div>Rows: <strong>{activeJob.artifact.rowCount.toLocaleString()}</strong> records</div>
                    <div>Total Amount: <strong>৳{activeJob.artifact.totalAmount.toLocaleString()}</strong></div>
                    <div className="col-span-2">
                      SHA-256: <span className="font-mono text-[10px] break-all">{activeJob.artifact.sha256}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => alert(`Downloaded artifact ${activeJob.artifact?.fileName} (Verified SHA-256)`)}
                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 font-bold rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Artifact</span>
                    </button>
                    {onNavigateArtifacts && (
                      <button
                        onClick={onNavigateArtifacts}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                      >
                        View in Artifact Center →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right 6 cols: Visual Browser Observability & Screenshots */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-[#14213D]">Browser Session Observability</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Step {activeJob?.currentStepIndex || 0} / {activeJob?.totalSteps || 13}
                </span>
              </div>

              {/* Status Header */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current URL:</span>
                  <span className="font-bold text-slate-800 truncate max-w-xs">{activeJob?.currentUrl || 'http://localhost:8085/demo-vendor/login'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Action:</span>
                  <span className="text-blue-700 font-bold">{activeJob?.currentAction || 'Idle'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Browser Status:</span>
                  <span className="text-emerald-700 font-bold">{activeJob?.browserStatus || 'CLOSED'}</span>
                </div>
              </div>

              {/* Screenshot Visual Stage Preview */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span>Execution Evidence Screenshot</span>
                  <span>{activeJob?.screenshots?.length || 0} captures</span>
                </div>

                {activeJob?.screenshots && activeJob.screenshots.length > 0 ? (
                  <div className="space-y-3">
                    {/* Active Screenshot Display */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                      <div className="bg-slate-800 text-white px-3 py-1.5 text-[10px] font-mono flex justify-between items-center">
                        <span>{activeJob.screenshots[selectedScreenshotIndex]?.name}</span>
                        <span>{activeJob.screenshots[selectedScreenshotIndex]?.description}</span>
                      </div>
                      <div className="p-4 flex items-center justify-center min-h-[220px] bg-slate-50">
                        <div className="w-full bg-white rounded-lg border border-slate-200 p-4 shadow-sm text-xs space-y-2">
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="font-bold text-slate-800 font-mono text-[11px]">
                              Capture: {activeJob.screenshots[selectedScreenshotIndex]?.name}
                            </span>
                            <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              VERIFIED STAGE
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {activeJob.screenshots[selectedScreenshotIndex]?.description}
                          </p>
                          <div className="text-[10px] text-slate-400 font-mono pt-1">
                            Recorded at: {activeJob.screenshots[selectedScreenshotIndex]?.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Screenshot Thumbnail Strip */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {activeJob.screenshots.map((s, idx) => (
                        <button
                          key={s.name}
                          onClick={() => setSelectedScreenshotIndex(idx)}
                          className={`px-2.5 py-1.5 text-[10px] font-mono rounded-lg border text-left shrink-0 transition-all ${
                            selectedScreenshotIndex === idx
                              ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div>{s.name}</div>
                          <div className="text-[9px] text-slate-400 truncate max-w-[90px]">{s.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-400 text-xs">
                    No screenshots captured yet. Click "RUN FULL TEST" to see Playwright captures.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL */}
      {activeTab === 'General' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 max-w-3xl text-xs">
          {isLoading && <div className="text-slate-500">Loading vendor…</div>}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Vendor Code</label>
            <input type="text" readOnly value={vendor.code} className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg font-mono" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Vendor Name</label>
            <input
              type="text"
              value={vendor.name}
              onChange={e => setVendor({ ...vendor, name: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Portal URL</label>
            <input
              type="text"
              value={vendor.portalUrl}
              onChange={e => setVendor({ ...vendor, portalUrl: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Connector Type</label>
              <select
                value={vendor.connectorType}
                onChange={e => setVendor({ ...vendor, connectorType: e.target.value as any })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                <option value="Browser Automation">Browser Automation (Playwright)</option>
                <option value="API">Direct REST API</option>
                <option value="Manual Upload">Manual Upload</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={vendor.isActive ? 'Active' : 'Inactive'}
                onChange={e => setVendor({ ...vendor, isActive: e.target.value === 'Active' })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTHENTICATION */}
      {activeTab === 'Authentication' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 max-w-3xl text-xs">
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 flex items-start gap-2.5 text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Zero-Plaintext Security Architecture</span>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                Passwords are never stored in React or returned across APIs. The frontend displays only configuration metadata.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Connector Name</label>
              <input
                type="text"
                value={connector.connectorName}
                onChange={e => setConnector({ ...connector, connectorName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <label className="flex items-end gap-2 pb-2 font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={connector.isActive}
                onChange={e => setConnector({ ...connector, isActive: e.target.checked })}
              />
              Connector is active
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Login URL</label>
            <input
              type="text"
              value={connector.loginUrl}
              onChange={e => setConnector({ ...connector, loginUrl: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Environment</label>
              <select value={environment} onChange={e => setEnvironment(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium">
                <option value="DEMO">Development / Demo</option>
                <option value="UAT">UAT</option>
                <option value="PRODUCTION">Production</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Authentication Type</label>
              <select
                value={vendor.authType}
                onChange={e => setVendor({ ...vendor, authType: e.target.value as any, credentialReference: { ...vendor.credentialReference, authenticationType: e.target.value as any } })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                <option value="Username + Password">Username + Password</option>
                <option value="Username + Password + OTP">Username + Password + OTP</option>
                <option value="API Key">API Key</option>
                <option value="Bearer Token">Bearer Token</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">Secret Provider Abstraction</span>
              <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                credentialConfigured: {String(vendor.credentialReference.credentialConfigured)}
              </span>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Secret ID</label>
              <input
                type="text"
                value={vendor.credentialReference.secretId}
                onChange={e => setVendor({ ...vendor, credentialReference: { ...vendor.credentialReference, secretId: e.target.value } })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Secret Provider</label>
              <select value={vendor.credentialReference.secretProvider} onChange={e => setVendor({ ...vendor, credentialReference: { ...vendor.credentialReference, secretProvider: e.target.value as any } })} className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-700">
                <option value="DevelopmentSecretProvider">DevelopmentSecretProvider</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Credential Secret Reference (Vault Path)</label>
              <input
                type="text"
                value={vendor.credentialReference.vaultPath}
                onChange={e => setVendor({ ...vendor, credentialReference: { ...vendor.credentialReference, vaultPath: e.target.value } })}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-700"
              />
            </div>

            <label className="flex items-center gap-2 font-semibold text-slate-700">
              <input type="checkbox" checked={vendor.credentialReference.credentialConfigured} onChange={e => setVendor({ ...vendor, credentialReference: { ...vendor.credentialReference, credentialConfigured: e.target.checked } })} />
              Reference metadata is active
            </label>
          </div>
        </div>
      )}

      {/* TAB 4: NAVIGATION WORKFLOW */}
      {activeTab === 'Navigation' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-xs">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#14213D]">What will the collection agent do?</h3>
              <p className="text-slate-500">Define the ordered workflow. Execution and test controls are not implemented in T04.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSteps(savedSteps.map(s => ({ ...s })))} className="px-3 py-2 border rounded-lg font-bold text-slate-600">Discard changes</button>
              <button onClick={() => setEditingStep(newStep())} className="px-3 py-2 rounded-lg bg-blue-600 text-white font-bold flex items-center gap-1"><Plus size={14}/> Add step</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-2.5 px-3">#</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Instruction</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 text-center">Timeout</th>
                  <th className="p-2.5 text-center">State</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {steps.map((s, index) => (
                  <tr key={`${s.id || 'new'}-${s.sequence}`} className="hover:bg-slate-50">
                    <td className="p-2.5 px-3 font-bold text-slate-700">{s.sequence}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">
                        {s.action}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-slate-800 max-w-[280px]">
                      <div>{s.selector}</div>
                      {s.inputSource && <div className="text-[10px] text-blue-600">{s.inputSource === 'STATIC' ? s.staticValue : s.inputSource}</div>}
                    </td>
                    <td className="p-2.5 font-sans text-slate-600">{s.description}</td>
                    <td className="p-2.5 text-center text-slate-500">{s.timeoutMs / 1000}s</td>
                    <td className="p-2.5 text-center">
                      <button onClick={() => setSteps(steps.map((x, i) => i === index ? { ...x, isActive: x.isActive === false } : x))} className={`font-bold ${s.isActive === false ? 'text-slate-400' : 'text-emerald-600'}`}>{s.isActive === false ? 'DISABLED' : 'ENABLED'}</button>
                      <div className="text-[10px] text-slate-400">{s.isRequired ? 'Required' : 'Optional'}</div>
                    </td>
                    <td className="p-2.5"><div className="flex justify-end gap-1">
                      <button title="Move up" disabled={index === 0} onClick={() => moveStep(index, -1)} className="p-1 disabled:opacity-30"><ArrowUp size={14}/></button>
                      <button title="Move down" disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)} className="p-1 disabled:opacity-30"><ArrowDown size={14}/></button>
                      <button title="Edit" onClick={() => setEditingStep({ ...s })} className="p-1"><Pencil size={14}/></button>
                      <button title="Duplicate" onClick={() => duplicateStep(index)} className="p-1"><Copy size={14}/></button>
                      <button title="Delete" onClick={() => setSteps(resequence(steps.filter((_, i) => i !== index)))} className="p-1 text-rose-600"><Trash2 size={14}/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editingStep && (
            <div className="fixed inset-0 z-50 bg-slate-950/40 flex justify-end" onMouseDown={() => setEditingStep(null)}>
              <div className="w-full max-w-xl h-full overflow-y-auto bg-white p-6 shadow-2xl space-y-4" onMouseDown={e => e.stopPropagation()}>
                <div className="flex justify-between items-center"><div><h3 className="font-bold text-base">Navigation step</h3><p className="text-slate-500">Configure one deterministic business action.</p></div><button onClick={() => setEditingStep(null)}><X size={18}/></button></div>
                <label className="block"><span className="font-bold">Step code</span><input value={editingStep.stepCode || ''} onChange={e => setEditingStep({...editingStep, stepCode:e.target.value})} className="mt-1 w-full border rounded-lg p-2" placeholder="LOGIN_USERNAME"/></label>
                <label className="block"><span className="font-bold">Description</span><input value={editingStep.description} onChange={e => setEditingStep({...editingStep, description:e.target.value})} className="mt-1 w-full border rounded-lg p-2" placeholder="Enter the configured username"/></label>
                <label className="block"><span className="font-bold">Action</span><select value={editingStep.action} onChange={e => setEditingStep({...editingStep, action:e.target.value as StepAction, inputSource: undefined, staticValue: undefined})} className="mt-1 w-full border rounded-lg p-2">{(['NAVIGATE','FILL','CLICK','WAIT_FOR','SELECT','SET_DATE','SEARCH','DOWNLOAD'] as StepAction[]).map(x=><option key={x}>{x}</option>)}</select></label>
                {editingStep.action !== 'NAVIGATE' && <label className="block"><span className="font-bold">How to find the page element</span><select value={editingStep.selectorStrategy} onChange={e => setEditingStep({...editingStep, selectorStrategy:e.target.value as SelectorStrategy})} className="mt-1 w-full border rounded-lg p-2">{['data-testid','id','name','css','text','role'].map(x=><option key={x}>{x}</option>)}</select></label>}
                <label className="block"><span className="font-bold">{editingStep.action === 'NAVIGATE' ? 'Destination or path' : 'Element selector'}</span><input value={editingStep.selector} onChange={e => setEditingStep({...editingStep, selector:e.target.value})} className="mt-1 w-full border rounded-lg p-2"/></label>
                {(['FILL','SELECT','SET_DATE'] as StepAction[]).includes(editingStep.action) && <>
                  <label className="block"><span className="font-bold">Value source</span><select value={editingStep.inputSource || ''} onChange={e => setEditingStep({...editingStep, inputSource:e.target.value as VendorNavigationStep['inputSource'], staticValue:e.target.value === 'STATIC' ? editingStep.staticValue : undefined})} className="mt-1 w-full border rounded-lg p-2"><option value="">Choose a source</option><option value="STATIC">Static value</option><option value="{{schoolCode}}">Runtime: school code</option><option value="{{vendorSchoolCode}}">Runtime: vendor school code</option><option value="{{businessDate}}">Runtime: business date</option><option value="{{fromDate}}">Runtime: from date</option><option value="{{toDate}}">Runtime: to date</option>{editingStep.action === 'FILL' && <><option value="CREDENTIAL_USERNAME">Credential field: username</option><option value="CREDENTIAL_PASSWORD">Credential field: password</option></>}</select></label>
                  {editingStep.inputSource === 'STATIC' && <label className="block"><span className="font-bold">Static value</span><input value={editingStep.staticValue || ''} onChange={e => setEditingStep({...editingStep, staticValue:e.target.value})} className="mt-1 w-full border rounded-lg p-2"/><span className="text-[10px] text-rose-600">Never enter usernames, passwords, tokens, PINs, OTPs, or API keys.</span></label>}
                </>}
                <div className="grid grid-cols-2 gap-3"><label><span className="font-bold">Timeout (ms)</span><input type="number" min="1000" max="300000" value={editingStep.timeoutMs} onChange={e => setEditingStep({...editingStep, timeoutMs:Number(e.target.value)})} className="mt-1 w-full border rounded-lg p-2"/></label><label><span className="font-bold">Retries</span><input type="number" min="0" max="10" value={editingStep.retryCount} onChange={e => setEditingStep({...editingStep, retryCount:Number(e.target.value)})} className="mt-1 w-full border rounded-lg p-2"/></label></div>
                <div className="flex gap-6"><label><input type="checkbox" checked={editingStep.isRequired} onChange={e => setEditingStep({...editingStep,isRequired:e.target.checked})}/> Required step</label><label><input type="checkbox" checked={editingStep.isActive !== false} onChange={e => setEditingStep({...editingStep,isActive:e.target.checked})}/> Enabled</label></div>
                <div className="flex justify-end gap-2 pt-3 border-t"><button onClick={() => setEditingStep(null)} className="px-4 py-2 border rounded-lg font-bold">Cancel</button><button onClick={commitEditedStep} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Apply step</button></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: REPORT SCHEMA */}
      {activeTab === 'Report' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 max-w-3xl text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Report Name</label>
            <input
              type="text"
              readOnly
              value={vendor.reportDefinition.reportName}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Expected File Type</label>
              <input
                type="text"
                readOnly
                value={vendor.reportDefinition.expectedFileType}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Expected Filename Pattern</label>
              <input
                type="text"
                readOnly
                value={vendor.reportDefinition.filenamePattern}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date Format Token</label>
              <input
                type="text"
                readOnly
                value={vendor.reportDefinition.dateFormat}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Download Timeout</label>
              <input
                type="text"
                readOnly
                value={`${vendor.reportDefinition.downloadTimeoutSec} Seconds`}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
