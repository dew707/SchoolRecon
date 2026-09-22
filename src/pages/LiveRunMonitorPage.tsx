import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowRight,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { realtimeHub } from '../services/realtimeHub';

interface LiveRunMonitorPageProps {
  onSelectSchool: (schoolId: string) => void;
}

export const LiveRunMonitorPage: React.FC<LiveRunMonitorPageProps> = ({ onSelectSchool }) => {
  const [progress, setProgress] = useState(72.3);
  const [completedSchools, setCompletedSchools] = useState(107);
  const [elapsed, setElapsed] = useState('14m 21s');

  const [activeJobs, setActiveJobs] = useState([
    { school: 'ABC School', stage: 'Collection', action: 'Downloading', file: 'report.xlsx', started: '10:14:10', duration: '1m 21s' },
    { school: 'DPS School', stage: 'Collection', action: 'Logging in', file: '--', started: '10:15:08', duration: '23s' },
    { school: 'XYZ School', stage: 'Validation', action: 'Generating report', file: 'xyz_raw_data.csv', started: '10:14:43', duration: '48s' },
    { school: 'Uttara Model', stage: 'Reconciliation', action: 'Comparing 2,430 rows', file: 'recon_buffer.bin', started: '10:13:20', duration: '2m 11s' },
    { school: 'Scholastica', stage: 'Exception Analysis', action: 'AI Callback Lookup', file: '--', started: '10:14:50', duration: '41s' }
  ]);

  useEffect(() => {
    const unsub = realtimeHub.subscribe('RunProgressUpdate', data => {
      setProgress(data.progressPercent);
      setCompletedSchools(data.completedSchools);
    });

    const unsub2 = realtimeHub.subscribe('SchoolJobProgress', data => {
      setActiveJobs(prev => {
        const next = [...prev];
        next[0] = {
          ...next[0],
          school: data.schoolName,
          action: data.action,
          duration: `${data.elapsedSeconds}s`
        };
        return next;
      });
    });

    return () => {
      unsub();
      unsub2();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Live Run REC-20260919"
        subtitle="Real-time execution telemetry and active portal worker threads"
        badge={
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            RUNNING
          </span>
        }
        actions={
          <div className="text-right">
            <div className="text-xs text-slate-400 font-mono">Elapsed Time</div>
            <div className="text-sm font-bold text-[#14213D] font-mono">{elapsed}</div>
          </div>
        }
      />

      {/* Main Run Progress Hero Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Run Progress</span>
            <div className="text-2xl lg:text-3xl font-bold text-[#14213D] mt-1">
              {progress}% <span className="text-xs font-normal text-slate-500">({completedSchools} / 148 schools)</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Active Workers: 14 Threads
            </span>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-blue-600 h-full transition-all duration-300 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Major Pipeline Stages Grid matching Page 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stage 1: Collection */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">1. Collection</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Active</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </span>
              <span>131</span>
            </div>
            <div className="flex items-center justify-between text-blue-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Downloading
              </span>
              <span>17</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Pending</span>
              <span>0</span>
            </div>
          </div>
        </div>

        {/* Stage 2: Validation */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">2. Validation</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Validated
              </span>
              <span>124</span>
            </div>
            <div className="flex items-center justify-between text-amber-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Waiting
              </span>
              <span>7</span>
            </div>
            <div className="flex items-center justify-between text-rose-600 font-semibold">
              <span>Corrupt/Failed</span>
              <span>0</span>
            </div>
          </div>
        </div>

        {/* Stage 3: Reconciliation */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">3. Reconciliation</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Active</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </span>
              <span>107</span>
            </div>
            <div className="flex items-center justify-between text-blue-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Matching
              </span>
              <span>17</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Waiting</span>
              <span>7</span>
            </div>
          </div>
        </div>

        {/* Stage 4: Exception Analysis */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">4. Exception AI</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Agent
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Analyzed
              </span>
              <span>42</span>
            </div>
            <div className="flex items-center justify-between text-indigo-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Investigating
              </span>
              <span>8</span>
            </div>
            <div className="flex items-center justify-between text-amber-600 font-semibold">
              <span>Human Review</span>
              <span>4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active School Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#14213D]">Active School Jobs</h3>
            <p className="text-xs text-slate-500">Live thread view of current portal downloads and match workers</p>
          </div>
          <span className="text-xs font-mono text-slate-400">WebSocket / SignalR: Connected</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">School</th>
                <th className="py-3 px-3">Current Stage</th>
                <th className="py-3 px-3">Current Action</th>
                <th className="py-3 px-3">File / Job Buffer</th>
                <th className="py-3 px-3">Started</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeJobs.map((job, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#14213D]">{job.school}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {job.stage}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span>{job.action}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{job.file}</td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{job.started}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600 text-[11px]">{job.duration}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onSelectSchool('SCH-001')}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
