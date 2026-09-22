import React, { useState } from 'react';
import { ArrowLeft, Check, AlertOctagon, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { TransactionComparison } from '../components/shared/TransactionComparison';
import { mockMatchCandidate } from '../mocks/mockData';
import { reconService } from '../services/reconService';

interface TransactionMatchingPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export const TransactionMatchingPage: React.FC<TransactionMatchingPageProps> = ({
  onBack,
  onComplete
}) => {
  const [candidate, setCandidate] = useState(mockMatchCandidate);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleConfirmMatch = async () => {
    const res = await reconService.confirmMatch(candidate.ruleId, candidate.vendorRef, candidate.systemRef);
    if (res.success) {
      setFeedback(res.message);
      setTimeout(() => onComplete(), 1200);
    }
  };

  const handleKeepException = async () => {
    const res = await reconService.keepException('EX-009821');
    if (res.success) {
      setFeedback(res.message);
      setTimeout(() => onComplete(), 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Investigation</span>
        </button>
      </div>

      <PageHeader
        title="Transaction Matching View"
        subtitle="Side-by-side reconciliation candidate evaluation and field delta verification"
        badge={
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Rule-Assisted Matcher
          </span>
        }
      />

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-in zoom-in-95">
          {feedback}
        </div>
      )}

      {/* Transaction Comparison Component matching Screen 8 */}
      <TransactionComparison
        candidate={candidate}
        onConfirmMatch={handleConfirmMatch}
        onKeepException={handleKeepException}
      />
    </div>
  );
};
