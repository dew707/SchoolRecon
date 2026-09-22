import React from 'react';
import { FileText, Database, ExternalLink } from 'lucide-react';

interface EvidenceCardProps {
  type: 'vendor' | 'system';
  title: string;
  reference: string;
  studentId: string;
  studentName?: string;
  amount: number;
  timestamp: string;
  status: string;
  extraMeta: { label: string; value: string | number }[];
  onViewSource?: () => void;
  sourceButtonLabel?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  type,
  title,
  reference,
  studentId,
  studentName,
  amount,
  timestamp,
  status,
  extraMeta,
  onViewSource,
  sourceButtonLabel = 'View source file'
}) => {
  const isVendor = type === 'vendor';
  const Icon = isVendor ? FileText : Database;
  const accentColor = isVendor ? 'text-blue-600' : 'text-emerald-600';
  const headerBg = isVendor ? 'bg-blue-50/70 border-blue-100' : 'bg-emerald-50/70 border-emerald-100';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full">
      <div className={`px-4 py-3 border-b flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${accentColor}`} />
          <h3 className="text-sm font-bold text-[#14213D]">{title}</h3>
        </div>
        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-white/80 border text-slate-700">
          {status}
        </span>
      </div>

      <div className="p-4 space-y-3 text-xs flex-1">
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Reference:</span>
          <span className="font-mono font-bold text-[#14213D] bg-slate-100 px-2 py-0.5 rounded">{reference}</span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Student ID:</span>
          <span className="font-mono text-slate-800">{studentId} {studentName ? `(${studentName})` : ''}</span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Amount:</span>
          <span className="font-bold text-sm text-[#14213D]">৳{amount.toLocaleString('en-US')}</span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Timestamp:</span>
          <span className="font-mono text-slate-700">{timestamp}</span>
        </div>

        {extraMeta.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-none">
            <span className="text-slate-500 font-medium">{item.label}:</span>
            <span className="text-slate-800 font-mono text-[11px] truncate max-w-[180px]">{item.value}</span>
          </div>
        ))}
      </div>

      {onViewSource && (
        <div className="p-3 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onViewSource}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{sourceButtonLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
