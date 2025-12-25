import React from 'react';
import { FileText } from 'lucide-react';
import { useTheme } from '../../../providers/ThemeContext';
import * as styles from '../DraftingDashboard.styles';
import { LegalDocument } from '../../../types/models';
import { formatDistanceToNow } from 'date-fns';

interface RecentDraftsProps {
  drafts: LegalDocument[];
  onSelect: (draft: LegalDocument) => void;
}

export const RecentDrafts: React.FC<RecentDraftsProps> = ({ drafts, onSelect }) => {
  const { theme } = useTheme();

  if (drafts.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No recent drafts found. Start a new draft to see it here.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {drafts.map((draft) => (
        <div 
          key={draft.id} 
          className={styles.getListItem(theme)}
          onClick={() => onSelect(draft)}
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className={styles.getItemTitle(theme)}>{draft.title}</h4>
              <p className={styles.getItemSubtitle(theme)}>
                {draft.case?.title || 'No Case Assigned'} • Last edited {formatDistanceToNow(new Date(draft.updatedAt || new Date()), { addSuffix: true })}
              </p>
            </div>
          </div>
          <span className={styles.getStatusBadge(theme, draft.status || 'draft')}>
            {(draft.status || 'draft').replace('_', ' ')}
          </span>
        </div>
      ))}
    </div>
  );
};
