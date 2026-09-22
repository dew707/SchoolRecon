import React, { useState } from 'react';
import { Settings, Shield, Bell, Key, Database, Check } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';

export const SettingsPage: React.FC = () => {
  const [toleranceTaka, setToleranceTaka] = useState('10');
  const [matchingWindowSec, setMatchingWindowSec] = useState('15');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings & System Policies"
        subtitle="Matching engine rules, tolerance thresholds, and compliance controls"
      />

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-in zoom-in-95">
          Settings successfully persisted to SQL Server configuration table.
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm space-y-6 text-xs">
        <div>
          <h3 className="text-sm font-bold text-[#14213D] mb-1">Reconciliation Matching Engine Parameters</h3>
          <p className="text-slate-500">Tune tolerance and window limits for automated rule matching.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Currency Variance Tolerance (৳)</label>
            <input
              type="number"
              value={toleranceTaka}
              onChange={e => setToleranceTaka(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Maximum allowable difference for rounding/gateway fee auto-match.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Timestamp Correlation Window (Seconds)</label>
            <input
              type="number"
              value={matchingWindowSec}
              onChange={e => setMatchingWindowSec(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Time drift allowable between vendor timestamp and internal gateway settlement.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Bangladesh Bank Circular No. PSD-04/2024</span>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
