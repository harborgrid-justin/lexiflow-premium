import React, { useEffect, useState } from 'react';
import { Plus, FileText, FolderOpen, Settings as SettingsIcon, Layout } from 'lucide-react';
import { useTheme } from '../../providers/ThemeContext';
import * as styles from './DraftingDashboard.styles';
import { RecentDrafts } from './components/RecentDrafts';
import { TemplateGallery } from './components/TemplateGallery';
import { ApprovalQueue } from './components/ApprovalQueue';
import { DraftingStats } from './components/DraftingStats';
import { TemplateEditor } from './components/TemplateEditor';
import { DocumentGenerator } from './components/DocumentGenerator';
import { draftingApi, GeneratedDocument, DraftingTemplate } from '../../api/domains/drafting.api';
import { DraftingStats as StatsType } from '../../api/domains/drafting.api';
import { useToast } from '../../providers/ToastContext';

type View = 'dashboard' | 'template-editor' | 'document-generator' | 'template-library';

const DraftingDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  
  const [view, setView] = useState<View>('dashboard');
  const [recentDrafts, setRecentDrafts] = useState<GeneratedDocument[]>([]);
  const [templates, setTemplates] = useState<DraftingTemplate[]>([]);
  const [approvals, setApprovals] = useState<GeneratedDocument[]>([]);
  const [stats, setStats] = useState<StatsType>({ drafts: 0, templates: 0, pendingReviews: 0, myTemplates: 0 });
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<DraftingTemplate | undefined>(undefined);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (view === 'dashboard') {
      loadData();
    }
  }, [view]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [draftsData, templatesData, approvalsData, statsData] = await Promise.all([
        draftingApi.getRecentDrafts(),
        draftingApi.getTemplates(),
        draftingApi.getPendingApprovals(),
        draftingApi.getStats()
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

  const handleCreateDraft = () => {
    setSelectedTemplateId(undefined);
    setView('document-generator');
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(undefined);
    setView('template-editor');
  };

  const handleSelectDraft = (draft: GeneratedDocument) => {
    addToast(`Opening draft: ${draft.title}`, 'info');
    // TODO: Navigate to document editor
  };

  const handleSelectTemplate = (template: DraftingTemplate) => {
    setSelectedTemplateId(template.id);
    setView('document-generator');
  };

  const handleEditTemplate = (template: DraftingTemplate) => {
    setEditingTemplate(template);
    setView('template-editor');
  };

  const handleReview = (doc: GeneratedDocument) => {
    addToast(`Reviewing: ${doc.title}`, 'info');
    // TODO: Navigate to review interface
  };

  const handleTemplateSaved = (template: DraftingTemplate) => {
    addToast('Template saved successfully', 'success');
    setView('dashboard');
    loadData();
  };

  const handleDocumentGenerated = (doc: GeneratedDocument) => {
    addToast('Document generated successfully', 'success');
    setView('dashboard');
    loadData();
  };

  if (view === 'template-editor') {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleTemplateSaved}
        onCancel={() => setView('dashboard')}
      />
    );
  }

  if (view === 'document-generator') {
    return (
      <DocumentGenerator
        templateId={selectedTemplateId}
        onComplete={handleDocumentGenerated}
        onCancel={() => setView('dashboard')}
      />
    );
  }

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
          <div>
            <h1 className={styles.getTitle(theme)}>Drafting & Assembly</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enterprise document automation with template management
            </p>
          </div>
        </div>
        <div className={styles.getActionContainer(theme)}>
          <button 
            className={styles.getActionButton(theme, 'secondary')}
            onClick={handleCreateTemplate}
          >
            <FolderOpen className="h-4 w-4" />
            <span>New Template</span>
          </button>
          <button 
            className={styles.getActionButton(theme, 'secondary')}
            onClick={() => setView('template-library')}
          >
            <Layout className="h-4 w-4" />
            <span>Template Library</span>
          </button>
          <button 
            className={styles.getActionButton(theme, 'primary')}
            onClick={handleCreateDraft}
          >
            <Plus className="h-4 w-4" />
            <span>Generate Document</span>
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
              <button 
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                onClick={() => addToast('View all feature coming soon', 'info')}
              >
                View All
              </button>
            </div>
            <div className={styles.getCardContent(theme)}>
              <RecentDrafts drafts={recentDrafts} onSelect={handleSelectDraft} />
            </div>
          </div>

          <div className="mt-6">
            <div className={styles.getCard(theme)}>
              <div className={styles.getCardHeader(theme)}>
                <h3 className={styles.getCardTitle(theme)}>Template Gallery</h3>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  onClick={() => setView('template-library')}
                >
                  Browse Library
                </button>
              </div>
              <div className={styles.getCardContent(theme)}>
                <TemplateGallery 
                  templates={templates} 
                  onSelect={handleSelectTemplate}
                  onEdit={handleEditTemplate}
                />
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
              <li>Variables like {`{{case.title}}`} auto-populate from case data.</li>
              <li>Insert clause library items for consistent language.</li>
              <li>Submit for review to notify senior partners automatically.</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <h4 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">
              Integration Points
            </h4>
            <ul className="text-sm text-emerald-800 dark:text-emerald-200 space-y-2">
              <li>✓ Case Management: Auto-populate case data</li>
              <li>✓ Clause Library: Reusable legal clauses</li>
              <li>✓ Document Manager: Direct save integration</li>
              <li>✓ E-Filing: One-click court filing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftingDashboard;

