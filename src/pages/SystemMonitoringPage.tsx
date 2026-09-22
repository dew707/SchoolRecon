import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Server,
  Cpu,
  Layers,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { HealthIndicator } from '../components/shared/HealthIndicator';
import { reconService } from '../services/reconService';
import { ServiceHealthItem, WorkerStatus, QueueStatus } from '../types';

export const SystemMonitoringPage: React.FC = () => {
  const [health, setHealth] = useState<{
    services: ServiceHealthItem[];
    workers: WorkerStatus;
    queues: QueueStatus;
  } | null>(null);

  useEffect(() => {
    reconService.getSystemHealth().then(setHealth);
  }, []);

  if (!health) return <div className="p-8 text-center text-slate-400">Checking system telemetry...</div>;

  const hasDeadLetter = health.queues.deadLetter > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring & System Health"
        subtitle="Infrastructure telemetry, background worker pools, and RabbitMQ message queues"
        badge={
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            All Core Services Online
          </span>
        }
      />

      {/* Dead Letter Queue Attention Alert */}
      {hasDeadLetter && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-center justify-between text-xs text-rose-900 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-sm">Dead Letter Queue Warning: {health.queues.deadLetter} Message Poisoned</span>
              <p className="text-rose-700 mt-0.5">
                A message in the vendor collection queue exceeded maximum retry attempts (3). Immediate review recommended.
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm">
            Inspect Poison Message
          </button>
        </div>
      )}

      {/* Service Health Grid matching Screen 15 */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Service Health (PaaS & Cloud)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {health.services.map((svc, idx) => (
            <HealthIndicator
              key={idx}
              name={svc.name}
              status={svc.status}
              latencyMs={svc.latencyMs}
              uptime={svc.uptime}
            />
          ))}
        </div>
      </div>

      {/* Worker Status & Queue Status Layout matching Screen 15 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Worker Status Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-[#14213D]">Worker Pool Status</h3>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-bold">14 / 14 Running</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-700">Portal Playwright Workers</span>
              <span className="font-mono font-bold text-blue-700">
                {health.workers.portalWorkers.active} / {health.workers.portalWorkers.total}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-700">Reconciliation Match Workers</span>
              <span className="font-mono font-bold text-emerald-700">
                {health.workers.reconWorkers.active} / {health.workers.reconWorkers.total}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-700">AI Investigation Workers</span>
              <span className="font-mono font-bold text-indigo-700">
                {health.workers.aiWorkers.active} / {health.workers.aiWorkers.total}
              </span>
            </div>
          </div>
        </div>

        {/* Queue Status Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#14213D]">RabbitMQ Queue Depths</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Live AMQP</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Vendor Collection</span>
              <span className="font-mono font-bold text-slate-800">{health.queues.vendorCollection} msgs</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">File Processing</span>
              <span className="font-mono font-bold text-slate-800">{health.queues.fileProcessing} msgs</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Reconciliation Pipeline</span>
              <span className="font-mono font-bold text-slate-800">{health.queues.reconciliation} msgs</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">AI Investigation Queue</span>
              <span className="font-mono font-bold text-indigo-700">{health.queues.aiInvestigation} msgs</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-rose-700 font-bold">Dead Letter Queue</span>
              <span className="font-mono font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                {health.queues.deadLetter} msg
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
