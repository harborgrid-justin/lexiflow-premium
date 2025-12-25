import React, { useEffect, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { useTheme } from '../../providers/ThemeContext';
import * as styles from './DraftingDashboard.styles';
import { RecentDrafts } from './components/RecentDrafts';
import { TemplateGallery } from './components/TemplateGallery';
import { ApprovalQueue } from './components/ApprovalQueue';
import { DraftingStats } from './components/DraftingStats';
import { api } from '../../api';
import { LegalDocument } from '../../types/models';
import { DraftingStats as StatsType } from '../../api/domains/drafting.api';
import { useToast } from '../../providers/ToastContext';

const DraftingDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  
  const [recentDrafts, setRecentDrafts] = useState<LegalDocument[]>([]);
  const [templates, setTemplates] = useState<LegalDocument[]>([]);
  const [approvals, setApprovals] = useState<LegalDocument[]>([]);
  const [stats, setStats] = useState<StatsType>({ drafts: 0, templates: 0, pendingReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [draftsData, templatesData, approvalsData, statsData] = await Promise.all([
          api.drafting.getRecentDrafts(),
          api.drafting.getTemplates(),
          api.drafting.getPendingApprovals(),
          api.drafting.getStats()
        ]);

        setRecentDrafts(draftsData);
        setTemplates(templatesData);
        setApprovals(approvalsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load drafting dashboard data:', error);
        addToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [addToast]);

  const handleCreateDraft = () => {
    // Navigate to document assembly wizard
    // history.push('/documents/assembly/new');
    addToast('Starting new draft...', 'info');
  };

  const handleSelectDraft = (draft: LegalDocument) => {
    addToast(`Opening draft: ${draft.title}`, 'info');
  };

  const handleSelectTemplate = (template: LegalDocument) => {
    addToast(`Creating from template: ${template.title}`, 'info');
  };

  const handleReview = (doc: LegalDocument) => {
    addToast(`Reviewing: ${doc.title}`, 'info');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={styles.getDashboardContainer(theme)}>
      {/* Header */}
      <div className={styles.getHeaderContainer(theme)}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className={styles.getTitle(theme)}>Drafting & Assembly</h1>
        </div>
        <div className={styles.getActionContainer(theme)}>
          <button 
            className={styles.getActionButton(theme, 'secondary')}
            onClick={() => addToast('Upload template feature coming soon', 'info')}
          >
            Upload Template
          </button>
          <button 
            className={styles.getActionButton(theme, 'primary')}
            onClick={handleCreateDraft}
          >
            <Plus className="h-4 w-4" />
            <span>New Draft</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.getContentGrid(theme)}>
        {/* Main Column */}
        <div className={styles.getMainColumn(theme)}>
          <DraftingStats stats={stats} />

          <div className={styles.getCard(theme)}>
            <div className={styles.getCardHeader(theme)}>
              <h3 className={styles.getCardTitle(theme)}>Recent Drafts</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">View All</button>
            </div>
            <div className={styles.getCardContent(theme)}>
              <RecentDrafts drafts={recentDrafts} onSelect={handleSelectDraft} />
            </div>
          </div>

          <div className="mt-6">
            <div className={styles.getCard(theme)}>
              <div className={styles.getCardHeader(theme)}>
                <h3 className={styles.getCardTitle(theme)}>Template Gallery</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">Browse Library</button>
              </div>
              <div className={styles.getCardContent(theme)}>
                <TemplateGallery templates={templates} onSelect={handleSelectTemplate} />
              </div>
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className={styles.getSideColumn(theme)}>
          <div className={styles.getCard(theme)}>
            <div className={styles.getCardHeader(theme)}>
              <h3 className={styles.getCardTitle(theme)}>Approval Queue</h3>
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-amber-900 dark:text-amber-300">
                {approvals.length} Pending
              </span>
            </div>
            <div className={styles.getCardContent(theme)}>
              <ApprovalQueue approvals={approvals} onReview={handleReview} />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Quick Tips</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-disc list-inside">
              <li>Use templates to ensure compliance with local rules.</li>
              <li>Save drafts frequently; auto-save runs every 5 minutes.</li>
              <li>Submit for review to notify senior partners automatically.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftingDashboard;
