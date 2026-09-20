import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { ReconMatchCandidate } from '../../types';

interface TransactionComparisonProps {
  candidate: ReconMatchCandidate;
  onConfirmMatch: () => void;
  onKeepException: () => void;
}

export const TransactionComparison: React.FC<TransactionComparisonProps> = ({
  candidate,
  onConfirmMatch,
  onKeepException
}) => {
  const isStudentExact = candidate.vendorStudentId === candidate.systemStudentId;
  const isAmountExact = candidate.vendorAmount === candidate.systemAmount;
  const isTimeClose = candidate.timeDifferenceSec <= 15;
  const isRefDiff = candidate.vendorRef !== candidate.systemRef;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Match Rule Applied</span>
          <h3 className="text-sm font-bold text-blue-700 font-mono">{candidate.ruleId}</h3>
          <p className="text-xs text-slate-500">{candidate.ruleName}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Confidence Score</span>
          <div className="text-xl font-bold text-emerald-600">{candidate.matchScore}%</div>
        </div>
      </div>

      {/* Side by side field comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vendor Side */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Vendor Record</span>
            <span className="text-xs font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded">Ref: {candidate.vendorRef}</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Student ID:</span>
              <span className="font-mono font-bold text-slate-800">{candidate.vendorStudentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span className="font-bold text-slate-900">৳{candidate.vendorAmount.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Business Date:</span>
              <span className="text-slate-700">{candidate.businessDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time:</span>
              <span className="font-mono text-slate-700">{candidate.vendorTime}</span>
            </div>
          </div>
        </div>

        {/* TAP System Side */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">System (TAP) Record</span>
            <span className="text-xs font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">TxID: {candidate.systemRef}</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Student ID:</span>
              <span className="font-mono font-bold text-slate-800">{candidate.systemStudentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span className="font-bold text-slate-900">৳{candidate.systemAmount.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Business Date:</span>
              <span className="text-slate-700">{candidate.businessDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time:</span>
              <span className="font-mono text-slate-700">{candidate.systemTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Field Delta Analysis Pill Bar */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Field Delta Analysis</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Student ID: <strong>Exact</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Amount: <strong>Exact</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Date: <strong>Exact</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Time: <strong>{candidate.timeDifferenceSec}s diff</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1.5 rounded-lg">
            <X className="w-3.5 h-3.5 text-rose-600" />
            <span>Ref: <strong>Different</strong></span>
          </div>
        </div>
      </div>

      {/* Suggested Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200">
        <div>
          <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Automated Recommendation</span>
          <div className="text-sm font-bold text-blue-950">
            Suggested: <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">POSSIBLE MATCH</span>
          </div>
          <p className="text-xs text-blue-700 mt-0.5">High probability candidate. Confirming will clear exception and reconcile both ledgers.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onKeepException}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Keep Exception
          </button>
          <button
            onClick={onConfirmMatch}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Confirm Match
          </button>
        </div>
      </div>
    </div>
  );
};
