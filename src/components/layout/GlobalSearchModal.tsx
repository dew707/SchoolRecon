import React, { useState, useEffect } from 'react';
import { Search, X, Layers, GraduationCap, AlertOctagon, Building2, ArrowRight } from 'lucide-react';
import { mockSchools, mockReconRuns, mockExceptions, mockVendors } from '../../mocks/mockData';
import { NavTab } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab, id?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled by parent or opened
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredSchools = q
    ? mockSchools.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
    : mockSchools.slice(0, 3);

  const filteredExceptions = q
    ? mockExceptions.filter(e => e.ref.toLowerCase().includes(q) || e.schoolName.toLowerCase().includes(q))
    : mockExceptions.slice(0, 3);

  const filteredRuns = q
    ? mockReconRuns.filter(r => r.id.toLowerCase().includes(q) || r.businessDate.toLowerCase().includes(q))
    : mockReconRuns.slice(0, 2);

  const filteredVendors = q
    ? mockVendors.filter(v => v.name.toLowerCase().includes(q) || v.code.toLowerCase().includes(q))
    : mockVendors.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search school, run, TxID, exception, vendor..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4 text-xs">
          {/* Schools Section */}
          {filteredSchools.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider mb-2 text-[10px]">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Schools</span>
              </div>
              <div className="space-y-1">
                {filteredSchools.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onNavigate('school-detail', s.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50/70 cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-blue-700">{s.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Code: {s.code} • Vendor: {s.vendorName}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exceptions Section */}
          {filteredExceptions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider mb-2 text-[10px]">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Exceptions</span>
              </div>
              <div className="space-y-1">
                {filteredExceptions.map(e => (
                  <div
                    key={e.id}
                    onClick={() => {
                      onNavigate('exception-investigation', e.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-rose-50/70 cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-rose-700">{e.ref} - {e.schoolName}</div>
                      <div className="text-[10px] text-slate-400">{e.type} • ৳{e.amount.toLocaleString()}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Runs Section */}
          {filteredRuns.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider mb-2 text-[10px]">
                <Layers className="w-3.5 h-3.5" />
                <span>Recon Runs</span>
              </div>
              <div className="space-y-1">
                {filteredRuns.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onNavigate('runs', r.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 font-mono">{r.id}</div>
                      <div className="text-[10px] text-slate-400">{r.businessDate} • Status: {r.status}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Press <strong>ESC</strong> to close</span>
          <span>Click any item to jump directly to its workspace</span>
        </div>
      </div>
    </div>
  );
};
