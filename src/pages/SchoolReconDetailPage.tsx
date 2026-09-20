import React, { useState } from 'react';
import {
  FileText,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  ExternalLink,
  Download,
  Filter
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ProgressStep } from '../components/shared/ProgressStep';
import { mockSchoolReconRuns } from '../mocks/mockData';
import { ReconStatus } from '../types';

interface SchoolReconDetailPageProps {
  schoolId?: string;
  onNavigateException: (exId: string) => void;
  onNavigateArtifacts: () => void;
}

export const SchoolReconDetailPage: React.FC<SchoolReconDetailPageProps> = ({
  schoolId = 'SCH-001',
  onNavigateException,
  onNavigateArtifacts
}) => {
  const school = mockSchoolReconRuns.find(s => s.schoolId === schoolId) || mockSchoolReconRuns[0];
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const steps = [
    { title: 'Vendor Collection', status: 'complete' as const, subtitle: 'report_18092026.xlsx' },
    { title: 'System Collection', status: 'complete' as const, subtitle: '1,785 API rows' },
    { title: 'Validation', status: 'complete' as const, subtitle: 'Checksum Valid' },
    { title: 'Reconciliation', status: 'complete' as const, subtitle: '1,775 matches' },
    { title: 'Exceptions', status: 'failed' as const, subtitle: '10 breaks' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={school.schoolName}
        subtitle={`Business Date: ${school.businessDate} • Run ID: ${school.runId}`}
        badge={<StatusBadge status={school.overallStatus} />}
        actions={
          <button
            onClick={() => onNavigateException('EX-009821')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
          >
            <span>View 10 Exceptions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />

      {/* Visual Pipeline Flow Step Indicator */}
      <ProgressStep steps={steps} />

      {/* Side by Side Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vendor Source Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-[#14213D]">Vendor Source ({school.vendorName})</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Valid File
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">File Name:</span>
              <span className="font-mono font-bold text-slate-800">{school.vendorReportFile}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Total Rows:</span>
              <span className="font-bold text-slate-800">{school.vendorRows.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Total Amount:</span>
              <span className="font-bold text-blue-700 text-sm">৳{school.vendorAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Downloaded At:</span>
              <span className="font-mono text-slate-600">{school.vendorDownloadedAt}</span>
            </div>
          </div>

          <button
            onClick={onNavigateArtifacts}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Source File</span>
          </button>
        </div>

        {/* TAP System Source Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#14213D]">TAP System Source (Core API)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Valid API Stream
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Extraction Method:</span>
              <span className="font-mono font-bold text-slate-800">API Collection Snapshot</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Total Rows:</span>
              <span className="font-bold text-slate-800">{school.systemRows.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Total Amount:</span>
              <span className="font-bold text-emerald-700 text-sm">৳{school.systemAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Collected At:</span>
              <span className="font-mono text-slate-600">{school.systemCollectedAt}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateException('EX-009821')}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Transactions</span>
          </button>
        </div>
      </div>

      {/* Reconciliation Results Metric Selector (Clickable Categories) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#14213D]">Reconciliation Result Breakdown</h3>
          <p className="text-xs text-slate-500">Click any result category below to filter the transaction discrepancy list</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div
            onClick={() => setSelectedFilter('exact')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedFilter === 'exact'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500">Exact Match</div>
            <div className="text-xl font-bold text-emerald-700 mt-1">{school.exactMatches}</div>
            <span className="text-[10px] text-emerald-600 font-medium">99.4% match rate</span>
          </div>

          <div
            onClick={() => setSelectedFilter('systemOnly')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedFilter === 'systemOnly'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500">System Only</div>
            <div className="text-xl font-bold text-amber-700 mt-1">{school.systemOnlyCount}</div>
            <span className="text-[10px] text-amber-600 font-medium">Missing in vendor</span>
          </div>

          <div
            onClick={() => setSelectedFilter('vendorOnly')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedFilter === 'vendorOnly'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-rose-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500">Vendor Only</div>
            <div className="text-xl font-bold text-rose-700 mt-1">{school.vendorOnlyCount}</div>
            <span className="text-[10px] text-rose-600 font-medium">Missing in TAP API</span>
          </div>

          <div
            onClick={() => setSelectedFilter('amountMismatch')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedFilter === 'amountMismatch'
                ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20'
                : 'bg-slate-50 border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500">Amount Mismatch</div>
            <div className="text-xl font-bold text-purple-700 mt-1">{school.amountMismatchCount}</div>
            <span className="text-[10px] text-purple-600 font-medium">Fee deduction variance</span>
          </div>

          <div
            onClick={() => setSelectedFilter('duplicate')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedFilter === 'duplicate'
                ? 'bg-slate-200 border-slate-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500">Duplicate</div>
            <div className="text-xl font-bold text-slate-700 mt-1">{school.duplicateCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">Zero duplicate records</span>
          </div>
        </div>
      </div>

      {/* Discrepancy Table for this school */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Selected Filter: {selectedFilter.toUpperCase()} RECORDS (Click row to investigate)
          </h4>
          <span className="text-xs font-semibold text-blue-600">Showing 4 sample transactions</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-4">Ref ID</th>
              <th className="py-2.5 px-3">Student ID</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3 text-right">Vendor Amount</th>
              <th className="py-2.5 px-3 text-right">System Amount</th>
              <th className="py-2.5 px-3 text-right">Difference</th>
              <th className="py-2.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr
              onClick={() => onNavigateException('EX-009821')}
              className="hover:bg-rose-50/40 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4 font-mono font-bold text-rose-700">EX-009821</td>
              <td className="py-3 px-3 font-mono">100921 (Tanvir Hossain)</td>
              <td className="py-3 px-3 font-semibold text-rose-600">Vendor Only</td>
              <td className="py-3 px-3 text-right font-bold text-slate-800">৳5,500</td>
              <td className="py-3 px-3 text-right text-slate-400">--</td>
              <td className="py-3 px-3 text-right font-bold text-rose-700">৳5,500</td>
              <td className="py-3 px-4 text-center">
                <button className="px-2 py-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded">
                  Investigate →
                </button>
              </td>
            </tr>
            <tr className="hover:bg-amber-50/40 cursor-pointer transition-colors">
              <td className="py-3 px-4 font-mono font-bold text-amber-700">EX-009828</td>
              <td className="py-3 px-3 font-mono">100924 (Rezaul Karim)</td>
              <td className="py-3 px-3 font-semibold text-amber-600">System Only</td>
              <td className="py-3 px-3 text-right text-slate-400">--</td>
              <td className="py-3 px-3 text-right font-bold text-slate-800">৳3,200</td>
              <td className="py-3 px-3 text-right font-bold text-amber-700">৳3,200</td>
              <td className="py-3 px-4 text-center">
                <button className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded">
                  Investigate →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
