import { useTheme } from '@/contexts/theme/ThemeContext';
import { GeneratedDocument } from '@api/domains/drafting';
import { formatDistanceToNow } from 'date-fns';
import { Clock, FileText } from 'lucide-react';
import React from 'react';
import * as styles from '../DraftingDashboard.styles';

interface RecentDraftsProps {
  drafts: GeneratedDocument[];
  onSelect: (draft: GeneratedDocument) => void;
}

export const RecentDrafts: React.FC<RecentDraftsProps> = ({ drafts, onSelect }) => {
  const { theme } = useTheme();

  // Defensive check: ensure drafts is an array
  const draftsList = Array.isArray(drafts) ? drafts : [];

  if (draftsList.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No recent drafts found. Start a new draft to see it here.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {draftsList.map((draft) => (
        <div
          key={draft.id}
          className={styles.getListItem(theme)}
          onClick={() => onSelect(draft)}
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={styles.getItemTitle(theme)}>{(draft as { title?: string }).title}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <p className={styles.getItemSubtitle(theme)}>
                  {(draft.case as { title?: string })?.title || 'No Case Assigned'}
                </p>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(draft.updatedAt || new Date()), { addSuffix: true })}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {draft.wordCount.toLocaleString()} words
                </span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                  {draft.template?.name || 'Unknown Template'}
                </span>
              </div>
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
