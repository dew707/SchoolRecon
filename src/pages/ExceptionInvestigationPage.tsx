import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { EvidenceCard } from '../components/shared/EvidenceCard';
import { Timeline } from '../components/shared/Timeline';
import { reconService } from '../services/reconService';
import { ReconException, AgentInvestigation } from '../types';

interface ExceptionInvestigationProps {
  exceptionId?: string;
  onBack: () => void;
  onOpenMatching: () => void;
  onNavigateArtifacts: () => void;
}

export const ExceptionInvestigationPage: React.FC<ExceptionInvestigationProps> = ({
  exceptionId = 'EX-009821',
  onBack,
  onOpenMatching,
  onNavigateArtifacts
}) => {
  const [exception, setException] = useState<ReconException | null>(null);
  const [investigation, setInvestigation] = useState<AgentInvestigation | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    reconService.getException(exceptionId).then(res => setException(res || null));
    reconService.getAgentInvestigation(exceptionId).then(res => setInvestigation(res || null));
  }, [exceptionId]);

  if (!exception || !investigation) {
    return <div className="p-8 text-center text-slate-400">Loading investigation workspace...</div>;
  }

  const handleAcceptFinding = async () => {
    await reconService.acceptAgentFinding(investigation.id);
    setActionFeedback('Finding accepted: Reconciled adjustment scheduled.');
  };

  const handleManualReview = async () => {
    await reconService.sendToManualReview(exception.id);
    setActionFeedback('Exception routed to Senior Operations Queue.');
  };

  const handleInvestigateMore = async () => {
    const res = await reconService.investigateMore(investigation.id);
    if (res.success) {
      setInvestigation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          timeline: [...prev.timeline, res.newTimelineItem]
        };
      });
      setActionFeedback('AI Agent spawned deep ledger log search worker.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Breadcrumbs and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exception Center</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMatching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Open Side-by-Side Matcher</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <PageHeader
        title={`Exception ${exception.ref}`}
        subtitle={`${exception.schoolName} • ${exception.type} transaction`}
        badge={<StatusBadge status={exception.status} pulse />}
      />

      {/* Action Notification Banner if triggered */}
      {actionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center justify-between animate-in fade-in">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* 3-Column Desktop Layout matching Screen 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Vendor Evidence & System TAP Evidence (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <EvidenceCard
            type="vendor"
            title="Vendor Evidence"
            reference={exception.vendorEvidence?.reference || 'V019881'}
            studentId={exception.vendorEvidence?.studentId || '100921'}
            studentName={exception.vendorEvidence?.studentName}
            amount={exception.vendorEvidence?.amount || 5500}
            timestamp={exception.vendorEvidence?.timestamp || '09:31:12'}
            status={exception.vendorEvidence?.status || 'PAID'}
            extraMeta={[
              { label: 'File', value: exception.vendorEvidence?.file || 'report_18092026.xlsx' },
              { label: 'Row Number', value: exception.vendorEvidence?.rowNumber || 421 }
            ]}
            onViewSource={onNavigateArtifacts}
            sourceButtonLabel="View source file"
          />

          <EvidenceCard
            type="system"
            title="TAP Evidence"
            reference={exception.systemEvidence?.txId || 'TAP09182'}
            studentId={exception.systemEvidence?.studentId || '100921'}
            studentName={exception.systemEvidence?.studentName}
            amount={exception.systemEvidence?.amount || 5500}
            timestamp={exception.systemEvidence?.timestamp || '09:31:18'}
            status={exception.systemEvidence?.status || 'SUCCESS'}
            extraMeta={[
              { label: 'Gateway Status', value: exception.systemEvidence?.gatewayStatus || 'SETTLED' },
              { label: 'Gateway Ref', value: exception.systemEvidence?.gatewayRef || 'GW_BKASH_887192' },
              { label: 'Payment Method', value: exception.systemEvidence?.paymentMethod || 'bKash Online' }
            ]}
            onViewSource={onOpenMatching}
            sourceButtonLabel="View transaction match"
          />
        </div>

        {/* CENTER COLUMN: Investigation Timeline (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#14213D]">Investigation Timeline</h3>
              <span className="text-[10px] font-mono text-slate-400">Real-time trace</span>
            </div>

            <Timeline items={investigation.timeline} />
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Duration: {investigation.duration}</span>
            <span className="font-mono">Tokens: {investigation.tokensUsed}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Investigation & Actions (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-[#14213D]">AI Investigation</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Advisory Only
              </span>
            </div>

            {/* Probable Cause */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Probable Cause</span>
              <p className="text-xs font-semibold text-[#14213D] mt-1 leading-relaxed">
                {investigation.probableCause}
              </p>
            </div>

            {/* Confidence Gauge */}
            <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-950">Confidence:</span>
              <span className="text-lg font-black text-indigo-700">{investigation.confidence}%</span>
            </div>

            {/* Recommended Action */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Recommended action</span>
              <p className="text-xs font-bold text-blue-700 mt-1">{investigation.recommendedAction}</p>
            </div>

            {/* AI Tools Checked Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tools executed</span>
              <div className="space-y-1.5 text-xs">
                {investigation.tools.map((tool, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-600">
                    <span>{tool.name}</span>
                    {tool.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Operational Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <button
              onClick={handleAcceptFinding}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Accept Finding</span>
            </button>

            <button
              onClick={handleInvestigateMore}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Investigate More</span>
            </button>

            <button
              onClick={handleManualReview}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Send to Manual Review</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
