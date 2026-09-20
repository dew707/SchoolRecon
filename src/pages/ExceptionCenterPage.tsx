import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Filter,
  ArrowRight,
  Sparkles,
  Download,
  Search,
  CheckCircle2,
  Clock,
  HelpCircle
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { reconService } from '../services/reconService';
import { ReconException, ExceptionType, ExceptionStatus } from '../types';

interface ExceptionCenterPageProps {
  onSelectException: (exId: string) => void;
  onOpenMatching: (exId: string) => void;
}

export const ExceptionCenterPage: React.FC<ExceptionCenterPageProps> = ({
  onSelectException,
  onOpenMatching
}) => {
  const [exceptions, setExceptions] = useState<ReconException[]>([]);
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    reconService.getExceptions().then(setExceptions);
  }, []);

  const filtered = exceptions.filter(e => {
    if (schoolFilter !== 'All' && e.schoolName !== schoolFilter) return false;
    if (typeFilter !== 'All' && e.type !== typeFilter) return false;
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (search && !e.ref.toLowerCase().includes(search.toLowerCase()) && !e.schoolName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Exception Center"
        subtitle="616 open exceptions • ৳391,127 unresolved difference requiring operational review"
        badge={
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Action Required
          </span>
        }
        actions={
          <button
            onClick={() => onOpenMatching('EX-009821')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Candidate Matcher</span>
          </button>
        }
      />

      {/* Filter Bar with Multi-Criteria Dropdowns matching Page 6 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <input
              type="text"
              placeholder="Search Ref or School..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">School:</span>
            <select
              value={schoolFilter}
              onChange={e => setSchoolFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Schools</option>
              <option value="ABC School">ABC School</option>
              <option value="DPS School">DPS School</option>
              <option value="XYZ School">XYZ School</option>
              <option value="Uttara Model">Uttara Model</option>
              <option value="Scholastica">Scholastica</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value={ExceptionType.VENDOR_ONLY}>Vendor Only</option>
              <option value={ExceptionType.SYSTEM_ONLY}>System Only</option>
              <option value={ExceptionType.AMOUNT_MISMATCH}>Amount Mismatch</option>
              <option value={ExceptionType.DUPLICATE_VENDOR}>Duplicate Vendor</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value={ExceptionStatus.AI_ANALYZING}>AI Analysing</option>
              <option value={ExceptionStatus.REVIEW_REQUIRED}>Review Required</option>
              <option value={ExceptionStatus.OPEN}>Open</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          Showing {filtered.length} of {exceptions.length} exceptions
        </span>
      </div>

      {/* Exception Table matching Screen 6 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Ref</th>
                <th className="py-3 px-3">School</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Age</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(ex => (
                <tr
                  key={ex.id}
                  onClick={() => onSelectException(ex.id)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 group-hover:underline">
                    {ex.ref}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#14213D]">{ex.schoolName}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {ex.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800">
                    ৳{ex.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={ex.status} />
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{ex.age}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        ex.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : ex.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ex.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectException(ex.id);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200"
                    >
                      Investigate →
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
