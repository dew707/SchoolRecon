import React, { useState } from 'react';
import {
  Search,
  Bell,
  Calendar,
  User,
  Menu,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleMobileMenu: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onToggleMobileMenu,
  onNavigate
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 'N1',
      title: 'AI Investigation Completed',
      desc: 'EX-009821 for ABC School analyzed with 91% confidence.',
      time: '2m ago',
      type: 'ai'
    },
    {
      id: 'N2',
      title: 'Portal Login Failure',
      desc: 'XYZ School crawler reported invalid password.',
      time: '14m ago',
      type: 'error'
    },
    {
      id: 'N3',
      title: 'Recon Run REC-20260919',
      desc: 'Stage 3 (Reconciliation) reached 72% completion.',
      time: '22m ago',
      type: 'info'
    }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-slate-500 hover:text-slate-800 md:hidden rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <button
          onClick={onOpenSearch}
          className="w-full max-w-md flex items-center justify-between px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-400 transition-all text-left shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="truncate">Search school, run, TxID, exception...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Business Date, Live Indicator, Notifications, User */}
      <div className="flex items-center gap-3">
        {/* Business Date Selector */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Business Date:</span>
          <span className="font-bold text-[#14213D]">19 Sep 2026</span>
        </div>

        {/* Live Simulation Indicator */}
        <div
          onClick={() => onNavigate('live-run')}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 cursor-pointer transition-colors"
          title="Click to view Live Run Monitor"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
          </span>
          <span>Live Run (72%)</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#14213D]">Operational Alerts</span>
                <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 cursor-pointer transition-colors text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('audit');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View Full Audit Log →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#14213D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            MH
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-[#14213D] leading-none">Mehedi Hasan</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Operations Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
};
