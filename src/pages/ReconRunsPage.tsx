import React, { useState, useEffect } from 'react';
import { Layers, Calendar, Filter, ArrowRight, Play, Eye, RefreshCw, GitCompare } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { reconService } from '../services/reconService';
import { ReconRun, ReconStatus } from '../types';

interface ReconRunsPageProps {
  onSelectRun: (runId: string) => void;
  onOpenLiveMonitor: (runId: string) => void;
}

export const ReconRunsPage: React.FC<ReconRunsPageProps> = ({
  onSelectRun,
  onOpenLiveMonitor
}) => {
  const [runs, setRuns] = useState<ReconRun[]>([]);
  const [selectedDate, setSelectedDate] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [date1, setDate1] = useState('18 Sep 2026');
  const [date2, setDate2] = useState('17 Sep 2026');

  useEffect(() => {
    reconService.getReconRuns().then(setRuns);
  }, []);

  const filteredRuns = runs.filter(run => {
    if (selectedStatus !== 'All' && run.status !== selectedStatus) return false;
    if (selectedDate !== 'All' && !run.businessDate.includes(selectedDate)) return false;
    if (searchQuery && !run.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reconciliation Runs"
        subtitle="Historical batch executions and cross-system ledger reconciliation records"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-600" />
              <span>Compare Dates</span>
            </button>
            <button
              onClick={() => onOpenLiveMonitor('REC-20260919')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>View Live Run (REC-20260919)</span>
            </button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Business Date:</span>
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none"
            >
              <option value="All">All Dates</option>
              <option value="19 Sep 2026">19 Sep 2026</option>
              <option value="18 Sep 2026">18 Sep 2026</option>
              <option value="17 Sep 2026">17 Sep 2026</option>
              <option value="16 Sep 2026">16 Sep 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value={ReconStatus.COMPLETED}>Completed</option>
              <option value={ReconStatus.RUNNING}>Running</option>
              <option value={ReconStatus.FAILED}>Failed</option>
            </select>
          </div>

          <div className="w-48">
            <input
              type="text"
              placeholder="Search Run ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <span className="text-slate-400 text-[11px] font-mono">Showing {filteredRuns.length} runs</span>
      </div>

      {/* Historical Runs Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Run ID</th>
                <th className="py-3 px-3">Business Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Schools</th>
                <th className="py-3 px-3 text-center">Completed</th>
                <th className="py-3 px-3 text-center">Exceptions</th>
                <th className="py-3 px-3 text-right">Matched Amount</th>
                <th className="py-3 px-3 text-right">Difference</th>
                <th className="py-3 px-3">Started</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRuns.map(run => (
                <tr
                  key={run.id}
                  className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                  onClick={() => {
                    if (run.status === ReconStatus.RUNNING) {
                      onOpenLiveMonitor(run.id);
                    } else {
                      onSelectRun(run.id);
                    }
                  }}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 group-hover:underline">
                    {run.id}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-800">{run.businessDate}</td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={run.status} pulse={run.status === ReconStatus.RUNNING} />
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">{run.schoolsTotal}</td>
                  <td className="py-3.5 px-3 text-center text-emerald-700 font-bold">{run.schoolsCompleted}</td>
                  <td className="py-3.5 px-3 text-center">
                    {run.exceptionsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {run.exceptionsCount}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800">
                    ৳{(run.matchedAmount / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-700">
                    ৳{run.differenceAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{run.startTime}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{run.duration}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (run.status === ReconStatus.RUNNING) {
                          onOpenLiveMonitor(run.id);
                        } else {
                          onSelectRun(run.id);
                        }
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200"
                    >
                      {run.status === ReconStatus.RUNNING ? 'Monitor' : 'Inspect'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compare Dates Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-[#14213D]">Cross-Date Ledger Comparison</h3>
              </div>
              <button onClick={() => setIsCompareOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Base Date A</label>
                <select
                  value={date1}
                  onChange={e => setDate1(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                >
                  <option value="18 Sep 2026">18 Sep 2026 (REC-20260918)</option>
                  <option value="17 Sep 2026">17 Sep 2026 (REC-20260917)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Comparison Date B</label>
                <select
                  value={date2}
                  onChange={e => setDate2(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                >
                  <option value="17 Sep 2026">17 Sep 2026 (REC-20260917)</option>
                  <option value="16 Sep 2026">16 Sep 2026 (REC-20260916)</option>
                </select>
              </div>
            </div>

            {/* Comparison Metrics Grid */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Total Schools Processed:</span>
                <span className="font-bold text-slate-800">148 vs 148 (0% variance)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Matched Volume:</span>
                <span className="font-bold text-emerald-700">৳482.18M vs ৳465.35M (+3.6% growth)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Exception Volume:</span>
                <span className="font-bold text-rose-700">616 vs 312 (+97.4% increase)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Net Unresolved Difference:</span>
                <span className="font-bold text-amber-700">৳391,127 vs ৳145,000 (+৳246,127)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCompareOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
