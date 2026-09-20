import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  Clock,
  CircleDot,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Globe,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { KpiCard } from '../components/shared/KpiCard';
import { StatusBadge } from '../components/shared/StatusBadge';

interface AiAgentCenterPageProps {
  onNavigateException: (exId: string) => void;
  onNavigateVendors?: () => void;
}

export const AiAgentCenterPage: React.FC<AiAgentCenterPageProps> = ({
  onNavigateException,
  onNavigateVendors
}) => {
  const [activeSupervisorTab, setActiveSupervisorTab] = useState<'BrowserSupervisor' | 'Exceptions'>('BrowserSupervisor');

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agent Center & Supervisors"
        subtitle="Autonomous background supervisors for portal collection crawlers and transaction break investigations"
        badge={
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Active Supervisors
          </span>
        }
      />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Browser Crawlers Active"
          value="8 Workers"
          subtext="Portal collection fleet"
          variant="info"
        />
        <KpiCard
          title="Artifacts Collected"
          value="148 Files"
          subtext="100% SHA-256 verified"
          variant="success"
        />
        <KpiCard
          title="AI Investigations"
          value="212"
          subtext="Exception root-causes"
          variant="purple"
        />
        <KpiCard
          title="Human Sign-offs"
          value="14 Pending"
          subtext="Advisory actions"
          variant="warning"
        />
      </div>

      {/* Supervisor Mode Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveSupervisorTab('BrowserSupervisor')}
          className={`px-4 py-2 border-b-2 flex items-center gap-2 transition-all ${
            activeSupervisorTab === 'BrowserSupervisor'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Vendor Collection Browser Supervisor</span>
        </button>

        <button
          onClick={() => setActiveSupervisorTab('Exceptions')}
          className={`px-4 py-2 border-b-2 flex items-center gap-2 transition-all ${
            activeSupervisorTab === 'Exceptions'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Exception Break Investigation Supervisor</span>
        </button>
      </div>

      {/* VIEW 1: Browser Collection Supervisor */}
      {activeSupervisorTab === 'BrowserSupervisor' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-[#14213D]">Browser Collection Supervisor Telemetry</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Playwright Worker Pool: 8/8 Healthy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Active Agent Strategy</span>
                <div className="font-bold text-slate-800 text-sm mt-1">Autonomous Portal Crawl & Extract</div>
                <p className="text-[11px] text-slate-400 mt-1">Executes 13-step deterministic browser workflow.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">SecretProvider Guard</span>
                <div className="font-bold text-emerald-700 text-sm mt-1">Active (Zero Plaintext to React)</div>
                <p className="text-[11px] text-slate-400 mt-1">Vault credential injection on worker process memory only.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Artifact Gatekeeper</span>
                <div className="font-bold text-blue-700 text-sm mt-1">SHA-256 + Schema Verified</div>
                <p className="text-[11px] text-slate-400 mt-1">1,842 rows / ৳4,821,500 checked before matching handoff.</p>
              </div>
            </div>

            {/* Active Crawler Fleet Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 border-b font-bold text-xs text-slate-700">
                Active Portal Crawler Fleet (Live Status)
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-500 text-[10px] font-bold uppercase">
                  <tr>
                    <th className="p-2.5 px-4">Vendor</th>
                    <th className="p-2.5">Target Institution</th>
                    <th className="p-2.5">Current Agent Action</th>
                    <th className="p-2.5">Worker</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 px-4 font-bold text-[#14213D] font-sans">TransBingo Demo</td>
                    <td className="p-2.5 font-sans">Uttara Model High School (UTTARA_MDL)</td>
                    <td className="p-2.5 text-blue-600">COLLECTION COMPLETED: TransBingo_Collection_20260918.xlsx</td>
                    <td className="p-2.5 text-slate-500">crawler_worker_01</td>
                    <td className="p-2.5 text-center font-sans"><StatusBadge status="Completed" /></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 px-4 font-bold text-[#14213D] font-sans">EduPay</td>
                    <td className="p-2.5 font-sans">DPS School (DPS_STS)</td>
                    <td className="p-2.5 text-blue-600">API Batch Settlement Pull</td>
                    <td className="p-2.5 text-slate-500">api_worker_02</td>
                    <td className="p-2.5 text-center font-sans"><StatusBadge status="Completed" /></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 px-4 font-bold text-[#14213D] font-sans">SchoolSoft</td>
                    <td className="p-2.5 font-sans">XYZ School (XYZ_ACAD)</td>
                    <td className="p-2.5 text-amber-600">Login Retry Window (Bad Credentials)</td>
                    <td className="p-2.5 text-slate-500">crawler_worker_04</td>
                    <td className="p-2.5 text-center font-sans"><StatusBadge status="Blocked" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {onNavigateVendors && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onNavigateVendors}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>Configure Vendor Crawlers in Vendor Management</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Exception Break Investigation Supervisor */}
      {activeSupervisorTab === 'Exceptions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600 animate-spin" />
                <h3 className="text-sm font-bold text-[#14213D]">Current Active Exception Job</h3>
              </div>
              <button
                onClick={() => onNavigateException('EX-009821')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>Open in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-700">EX-009821</span>
                  <span className="font-semibold text-slate-700">ABC School</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Vendor Only
                  </span>
                </div>
                <p className="text-slate-500 mt-1">
                  Investigating transaction ৳5,500 missing from TAP core ledger.
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-slate-400">Model: gpt-4o-financial-recon-v3</span>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Tool Execution Sequence</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Loaded exception parameters & vendor file reference</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Retrieved TAP transaction history for Student ID 100921</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Checked bKash acquiring gateway API status (Confirmed SETTLED)</span>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 flex items-center gap-2 font-bold animate-pulse">
                  <CircleDot className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Searching rabbitMQ callback delivery logs & webhook ACK status...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety & Compliance Card */}
      <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex items-start gap-3 text-xs text-blue-950">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Financial Safety & Non-Automated Settlement Control</h4>
          <p className="mt-0.5 text-blue-800 leading-relaxed">
            AI supervisors operate in an advisory capacity. While browser crawlers execute configured deterministic navigation steps, AI assists only when unexpected portal changes occur and requires explicit human approval before connector rules are updated.
          </p>
        </div>
      </div>
    </div>
  );
};
