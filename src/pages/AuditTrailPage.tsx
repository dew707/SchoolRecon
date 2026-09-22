import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  ExternalLink,
  CheckCircle2,
  FileCode
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { reconService } from '../services/reconService';
import { AuditEvent } from '../types';

export const AuditTrailPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  useEffect(() => {
    reconService.getAuditEvents(search).then(setEvents);
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        subtitle="Immutable event logs for every crawler run, validation step, matching decision, and operator override"
        badge={
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Read-Only Immutable Log
          </span>
        }
      />

      {/* Multi-Parameter Search Input matching Screen 16 */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between text-xs">
        <div className="relative w-full max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search run, school, TxID, user, worker, exception ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>
        <span className="text-slate-400 font-mono text-[11px] hidden sm:inline-block">
          Showing {events.length} audit logs
        </span>
      </div>

      {/* Audit Table matching Screen 16 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-3">Event</th>
                <th className="py-3 px-3">School</th>
                <th className="py-3 px-3">Run ID</th>
                <th className="py-3 px-3">User / System</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3">Result</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map(ev => (
                <tr
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono text-slate-600">{ev.timeOnly}</td>
                  <td className="py-3.5 px-3 font-bold text-[#14213D] group-hover:text-blue-600">
                    {ev.event}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-700">{ev.schoolName || '--'}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">{ev.runId}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-slate-700">
                      {ev.user}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">{ev.entity}</td>
                  <td className="py-3.5 px-3 text-emerald-700 font-medium">{ev.result}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEvent(ev);
                      }}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#14213D]">{selectedEvent.event}</h3>
                <span className="text-[11px] text-slate-400 font-mono">{selectedEvent.timestamp}</span>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Event ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedEvent.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Actor:</span>
                <span className="font-mono font-bold text-blue-700">{selectedEvent.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Entity:</span>
                <span className="font-mono text-slate-800">{selectedEvent.entity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Run ID:</span>
                <span className="font-mono text-slate-800">{selectedEvent.runId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Outcome / Result:</span>
                <span className="font-bold text-emerald-700">{selectedEvent.result}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
              <pre>{JSON.stringify({
                eventId: selectedEvent.id,
                timestamp: selectedEvent.timestamp,
                actor: selectedEvent.user,
                action: selectedEvent.event,
                target: selectedEvent.entity,
                securityContext: 'HMAC-SHA256 Signed'
              }, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
