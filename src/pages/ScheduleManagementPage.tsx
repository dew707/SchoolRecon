import React, { useState } from 'react';
import { CalendarClock, Clock, Edit2, Play, CheckCircle2, Sliders } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { mockScheduleItems } from '../mocks/mockData';

export const ScheduleManagementPage: React.FC = () => {
  const [schedules, setSchedules] = useState(mockScheduleItems);
  const [parallelSessions, setParallelSessions] = useState(10);
  const [startWindow, setStartWindow] = useState('01:00 - 01:20');
  const [retryWindow, setRetryWindow] = useState('03:00');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = () => {
    setIsEditModalOpen(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Reconciliation Schedule"
        subtitle="Automated batch orchestrator and portal concurrency rate limiting"
        badge={
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Cron: 0 1 * * *
          </span>
        }
        actions={
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Schedule</span>
          </button>
        }
      />

      {savedFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-in zoom-in-95">
          Schedule parameters updated in background orchestrator.
        </div>
      )}

      {/* Schedule Configuration Cards matching Screen 14 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Start Between</span>
          <div className="text-lg font-bold text-[#14213D] mt-1 font-mono">{startWindow}</div>
          <p className="text-[11px] text-slate-500 mt-1">Staggered portal crawl start times</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Max Parallel Portal Sessions</span>
          <div className="text-lg font-bold text-blue-600 mt-1 font-mono">{parallelSessions} workers</div>
          <p className="text-[11px] text-slate-500 mt-1">Prevents rate limiting from vendor portals</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Retry Window</span>
          <div className="text-lg font-bold text-amber-600 mt-1 font-mono">{retryWindow} AM</div>
          <p className="text-[11px] text-slate-500 mt-1">Automatic retry for failed portal sessions</p>
        </div>
      </div>

      {/* Visual Timeline Card matching Screen 14 */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#14213D]">Batch Execution Timeline</h3>
          <span className="text-xs font-mono text-slate-400">Timezone: UTC+06:00 (Dhaka)</span>
        </div>

        <div className="space-y-4 relative pl-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {schedules.map(item => (
            <div key={item.id} className="relative group flex items-start justify-between">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {item.time}
                  </span>
                  <span className="text-sm font-bold text-[#14213D]">{item.title}</span>
                  {item.schoolsCount && (
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      {item.schoolsCount} schools
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.description}</p>
              </div>

              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">Scheduled Daily</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-[#14213D]">Edit Schedule Configuration</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Start Window</label>
                <input
                  type="text"
                  value={startWindow}
                  onChange={e => setStartWindow(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Max Parallel Workers</label>
                <input
                  type="number"
                  value={parallelSessions}
                  onChange={e => setParallelSessions(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Retry Window (AM)</label>
                <input
                  type="text"
                  value={retryWindow}
                  onChange={e => setRetryWindow(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
