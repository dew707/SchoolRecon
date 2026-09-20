import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Ban,
  Sparkles,
  PauseCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { ReconStatus, ExceptionStatus, HealthStatus } from '../../types';

interface StatusBadgeProps {
  status: ReconStatus | ExceptionStatus | HealthStatus | string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', pulse = false }) => {
  const norm = (status || '').toLowerCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = HelpCircle;
  let iconColor = 'text-slate-500';

  if (norm.includes('complete') || norm.includes('valid') || norm.includes('success') || norm.includes('healthy') || norm.includes('active')) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    Icon = CheckCircle2;
    iconColor = 'text-emerald-600';
  } else if (norm.includes('run') || norm.includes('process') || norm.includes('download')) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
    Icon = Loader2;
    iconColor = 'text-blue-600 animate-spin';
  } else if (norm.includes('review') || norm.includes('warn') || norm.includes('degraded') || norm.includes('wait')) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertCircle;
    iconColor = 'text-amber-600';
  } else if (norm.includes('fail') || norm.includes('down') || norm.includes('corrupt') || norm.includes('error') || norm.includes('reject')) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = XCircle;
    iconColor = 'text-rose-600';
  } else if (norm.includes('block')) {
    bg = 'bg-red-50 text-red-800 border-red-300 font-semibold';
    Icon = Ban;
    iconColor = 'text-red-600';
  } else if (norm.includes('ai') || norm.includes('investig') || norm.includes('analy')) {
    bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    Icon = Sparkles;
    iconColor = 'text-indigo-600';
  } else if (norm.includes('pause')) {
    bg = 'bg-slate-100 text-slate-600 border-slate-300';
    Icon = PauseCircle;
    iconColor = 'text-slate-500';
  }

  const padClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs tracking-wide';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${padClass} ${bg}`}>
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      <span>{status}</span>
      {pulse && (
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
      )}
    </span>
  );
};
