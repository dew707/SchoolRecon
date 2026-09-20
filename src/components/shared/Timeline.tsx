import React from 'react';
import { CheckCircle2, Clock, AlertCircle, CircleDot } from 'lucide-react';

interface TimelineItem {
  time: string;
  step: string;
  status: 'completed' | 'in-progress' | 'pending';
  detail?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {items.map((item, idx) => {
        let Icon = CheckCircle2;
        let iconColor = 'text-emerald-500 bg-white';

        if (item.status === 'in-progress') {
          Icon = CircleDot;
          iconColor = 'text-blue-600 bg-white animate-pulse';
        } else if (item.status === 'pending') {
          Icon = Clock;
          iconColor = 'text-slate-300 bg-white';
        }

        return (
          <div key={idx} className="relative group">
            <span className={`absolute -left-6 top-0.5 p-0.5 rounded-full ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono font-semibold text-slate-500">{item.time}</span>
              <span className="text-sm font-medium text-[#14213D]">{item.step}</span>
            </div>
            {item.detail && (
              <p className="mt-0.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
                {item.detail}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
