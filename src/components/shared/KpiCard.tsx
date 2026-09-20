import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  onClick
}) => {
  let valueColor = 'text-[#14213D]';
  let badgeColor = 'bg-slate-50 text-slate-600';

  if (variant === 'success') {
    valueColor = 'text-emerald-600';
    badgeColor = 'bg-emerald-50 text-emerald-700';
  } else if (variant === 'warning') {
    valueColor = 'text-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700';
  } else if (variant === 'error') {
    valueColor = 'text-rose-600';
    badgeColor = 'bg-rose-50 text-rose-700';
  } else if (variant === 'info') {
    valueColor = 'text-blue-600';
    badgeColor = 'bg-blue-50 text-blue-700';
  } else if (variant === 'purple') {
    valueColor = 'text-indigo-600';
    badgeColor = 'bg-indigo-50 text-indigo-700';
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${badgeColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-2xl lg:text-3xl font-bold tracking-tight ${valueColor}`}>{value}</span>
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
};
