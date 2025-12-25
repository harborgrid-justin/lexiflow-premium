import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../providers/ThemeContext';
import * as styles from '../DraftingDashboard.styles';
import { LegalDocument } from '../../../types/models';
import { formatDistanceToNow } from 'date-fns';

interface ApprovalQueueProps {
  approvals: LegalDocument[];
  onReview: (doc: LegalDocument) => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ approvals, onReview }) => {
  const { theme } = useTheme();

  if (approvals.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
        <CheckCircle className="h-8 w-8 text-emerald-500 mb-2 opacity-50" />
        <p>You're all caught up! No pending approvals.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {approvals.map((doc) => (
        <div 
          key={doc.id} 
          className={styles.getListItem(theme)}
          onClick={() => onReview(doc)}
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className={styles.getItemTitle(theme)}>{doc.title}</h4>
              <p className={styles.getItemSubtitle(theme)}>
                Submitted by {doc.creator?.firstName || 'Unknown'} {doc.creator?.lastName || ''} • {formatDistanceToNow(new Date(doc.updatedAt || new Date()), { addSuffix: true })}
              </p>
            </div>
          </div>
          <button className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-md transition-colors">
            Review
          </button>
        </div>
      ))}
    </div>
  );
};
