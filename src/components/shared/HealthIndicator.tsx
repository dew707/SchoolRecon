import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { HealthStatus } from '../../types';

interface HealthIndicatorProps {
  name: string;
  status: HealthStatus;
  latencyMs?: number;
  uptime?: string;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  name,
  status,
  latencyMs,
  uptime
}) => {
  let color = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = CheckCircle2;

  if (status === HealthStatus.DEGRADED) {
    color = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
  } else if (status === HealthStatus.DOWN) {
    color = 'bg-rose-500';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = XCircle;
  }

  return (
    <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`} />
          <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`} />
        </span>
        <div>
          <h4 className="text-sm font-semibold text-[#14213D]">{name}</h4>
          {uptime && <p className="text-[11px] text-slate-400">Uptime {uptime}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {latencyMs !== undefined && (
          <span className="text-xs font-mono text-slate-500">{latencyMs} ms</span>
        )}
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${badgeColor}`}>
          <Icon className="w-3.5 h-3.5" />
          {status}
        </span>
      </div>
    </div>
  );
};
