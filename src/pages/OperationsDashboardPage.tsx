import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  Download,
  Filter,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { KpiCard } from '../components/shared/KpiCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { FilterBar } from '../components/shared/FilterBar';
import { reconService, DashboardSummary } from '../services/reconService';
import { SchoolReconRun, ReconStatus } from '../types';

interface OperationsDashboardProps {
  onSelectSchool: (schoolId: string) => void;
  onNavigateRuns: () => void;
  onNavigateExceptions: () => void;
}

export const OperationsDashboardPage: React.FC<OperationsDashboardProps> = ({
  onSelectSchool,
  onNavigateRuns,
  onNavigateExceptions
}) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    setIsRefreshing(true);
    const res = await reconService.getDashboard();
    setData(res);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-400">Loading control center...</div>;

  const filteredSchools = data.schoolRows.filter(row => {
    const matchesSearch =
      row.schoolName.toLowerCase().includes(search.toLowerCase()) ||
      row.vendorName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Running') return row.overallStatus === ReconStatus.RUNNING;
    if (activeFilter === 'Failed') return row.overallStatus === ReconStatus.FAILED;
    if (activeFilter === 'Review Required') return row.overallStatus === ReconStatus.NEED_REVIEW;
    if (activeFilter === 'Completed') return row.overallStatus === ReconStatus.COMPLETED;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Reconciliation Control Center"
        subtitle="Operational overview for business date 18 September 2026"
        badge={
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Monitoring
          </span>
        }
        lastUpdated={data.lastUpdated}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        actions={
          <button
            onClick={onNavigateRuns}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span>All Runs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />

      {/* Top KPI Cards matching Page 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Schools Today"
          value={data.kpis.schoolsToday}
          subtext="Configured schools in batch"
          variant="default"
        />
        <KpiCard
          title="Completed"
          value={data.kpis.completed}
          subtext="81.7% fully matched"
          variant="success"
        />
        <KpiCard
          title="Processing"
          value={data.kpis.processing}
          subtext="Active portal workers"
          variant="info"
        />
        <KpiCard
          title="Need Review"
          value={data.kpis.needReview}
          subtext="Pending human approval"
          variant="warning"
          onClick={onNavigateExceptions}
        />
        <KpiCard
          title="Failed"
          value={data.kpis.failed}
          subtext="Requires intervention"
          variant="error"
        />
      </div>

      {/* Secondary Row: Progress & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Progress Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Progress</span>
              <span className="text-xs font-bold text-blue-600">{data.progress.percent}%</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-3 flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${(data.progress.completed / 148) * 100}%` }}
                title={`${data.progress.completed} Completed`}
              />
              <div
                className="bg-blue-500 h-full animate-pulse transition-all duration-500"
                style={{ width: `${(data.progress.running / 148) * 100}%` }}
                title={`${data.progress.running} Running`}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${(data.progress.waitingOrFailed / 148) * 100}%` }}
                title={`${data.progress.waitingOrFailed} Waiting / Failed`}
              />
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Completed Schools
                </span>
                <span className="font-bold text-slate-800">{data.progress.completed}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Running Pipeline
                </span>
                <span className="font-bold text-slate-800">{data.progress.running}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Waiting / Failed
                </span>
                <span className="font-bold text-slate-800">{data.progress.waitingOrFailed}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Next retry cycle: 03:00 AM</span>
            <span className="font-mono">REC-20260918</span>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Financial Summary</span>
            <button
              onClick={onNavigateExceptions}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View 616 Exceptions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[11px] text-slate-500 font-medium">System Amount</span>
              <div className="text-lg lg:text-xl font-bold text-[#14213D] mt-1">৳482.19M</div>
              <span className="text-[10px] text-emerald-600 font-medium">Internal TAP API</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[11px] text-slate-500 font-medium">Vendor Amount</span>
              <div className="text-lg lg:text-xl font-bold text-[#14213D] mt-1">৳482.18M</div>
              <span className="text-[10px] text-blue-600 font-medium">Portal Reports</span>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70">
              <span className="text-[11px] text-amber-800 font-medium">Difference</span>
              <div className="text-lg lg:text-xl font-bold text-amber-900 mt-1">৳391K</div>
              <span className="text-[10px] text-amber-700 font-medium">Net variance</span>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/70">
              <span className="text-[11px] text-rose-800 font-medium">Exceptions</span>
              <div className="text-lg lg:text-xl font-bold text-rose-900 mt-1">616</div>
              <span className="text-[10px] text-rose-700 font-medium">Unresolved breaks</span>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <span><strong>Rule Match Rate:</strong> 99.8% across 148 institutions</span>
            <span className="text-slate-500 text-[11px]">Audit snapshot frozen at 01:30:00</span>
          </div>
        </div>
      </div>

      {/* Main Component: Live Reconciliation Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#14213D]">Live School Reconciliation Status</h2>
            <p className="text-xs text-slate-500">Click any school row to inspect source reports and matching breaks</p>
          </div>

          <div className="flex items-center gap-2">
            <FilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Filter school or vendor..."
              tabs={[
                { label: 'All', value: 'All', count: 148 },
                { label: 'Running', value: 'Running', count: 12 },
                { label: 'Review', value: 'Review Required', count: 4 },
                { label: 'Failed', value: 'Failed', count: 3 },
                { label: 'Completed', value: 'Completed', count: 121 }
              ]}
              activeTab={activeFilter}
              onTabChange={setActiveFilter}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">School</th>
                <th className="py-3 px-3">Vendor Collection</th>
                <th className="py-3 px-3">System Collection</th>
                <th className="py-3 px-3">Validation</th>
                <th className="py-3 px-3">Reconciliation</th>
                <th className="py-3 px-3 text-center">Exceptions</th>
                <th className="py-3 px-3 text-right">Amount Diff</th>
                <th className="py-3 px-3">Elapsed</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.map(row => (
                <tr
                  key={row.id}
                  onClick={() => onSelectSchool(row.schoolId)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#14213D] group-hover:text-blue-600 transition-colors">
                      {row.schoolName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Vendor: {row.vendorName}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-medium text-slate-700">
                      {row.vendorCollectionStatus === 'Complete' ? 'Vendor Complete' : row.vendorCollectionStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-medium text-slate-700">
                      {row.systemCollectionStatus === 'Complete' ? 'System Complete' : row.systemCollectionStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`font-medium ${
                        row.validationStatus === 'Valid'
                          ? 'text-emerald-600'
                          : row.validationStatus === 'Blocked'
                          ? 'text-red-700 font-bold'
                          : 'text-amber-600'
                      }`}
                    >
                      {row.validationStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-medium text-slate-700">
                      {row.reconciliationStatus === 'Complete' ? 'Recon Complete' : row.reconciliationStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {row.exceptionsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {row.exceptionsCount} exceptions
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">0 exceptions</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-medium">
                    {row.amountDifference > 0 ? (
                      <span className="text-amber-700 font-bold">৳{row.amountDifference.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-400">৳0</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{row.elapsedTime}</td>

                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={row.overallStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredSchools.length} of 148 schools</span>
          <span className="font-medium">All financial data reconciled under BDT (৳)</span>
        </div>
      </div>
    </div>
  );
};
