import React from 'react';
import { Check, ArrowRight, Loader2, AlertCircle, Ban } from 'lucide-react';

interface Step {
  title: string;
  status: 'complete' | 'running' | 'waiting' | 'failed' | 'blocked';
  subtitle?: string;
}

interface ProgressStepProps {
  steps: Step[];
}

export const ProgressStep: React.FC<ProgressStepProps> = ({ steps }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          let circleBg = 'bg-slate-100 text-slate-400 border-slate-300';
          let textColor = 'text-slate-500';
          let icon = <span>{idx + 1}</span>;

          if (step.status === 'complete') {
            circleBg = 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
            textColor = 'text-emerald-800 font-semibold';
            icon = <Check className="w-4 h-4 stroke-[3]" />;
          } else if (step.status === 'running') {
            circleBg = 'bg-blue-600 text-white border-blue-700 ring-4 ring-blue-100 animate-pulse';
            textColor = 'text-blue-800 font-bold';
            icon = <Loader2 className="w-4 h-4 animate-spin" />;
          } else if (step.status === 'failed') {
            circleBg = 'bg-rose-500 text-white border-rose-600';
            textColor = 'text-rose-800 font-bold';
            icon = <AlertCircle className="w-4 h-4" />;
          } else if (step.status === 'blocked') {
            circleBg = 'bg-red-700 text-white border-red-800';
            textColor = 'text-red-900 font-bold';
            icon = <Ban className="w-4 h-4" />;
          }

          return (
            <React.Fragment key={step.title}>
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${circleBg} shrink-0`}>
                  {icon}
                </div>
                <div>
                  <div className={`text-xs ${textColor}`}>{step.title}</div>
                  {step.subtitle && <div className="text-[11px] text-slate-400 capitalize">{step.subtitle}</div>}
                </div>
              </div>
              {!isLast && (
                <div className="hidden md:flex items-center text-slate-300 px-2">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
