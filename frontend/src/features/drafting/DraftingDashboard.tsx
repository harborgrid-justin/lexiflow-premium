import React, { useEffect, useState } from 'react';
import { Plus, FileText, FolderOpen, BarChart3, Clock } from 'lucide-react';
import { useTheme } from '@providers/ThemeContext';
import { TabNavigation } from '@/components/organisms';
import { PageHeader } from '@/components/organisms';
import { cn } from '@/utils/cn';
import { RecentDrafts } from './components/RecentDrafts';
import { TemplateGallery } from './components/TemplateGallery';
import { ApprovalQueue } from './components/ApprovalQueue';
import { DraftingStats } from './components/DraftingStats';
import { TemplateEditor } from './components/TemplateEditor';
import { DocumentGenerator } from './components/DocumentGenerator';
import { draftingApi, GeneratedDocument, DraftingTemplate } from '@api/domains/drafting.api';
import { DraftingStats as StatsType } from '@api/domains/drafting.api';
import { useToast } from '@providers/ToastContext';

type View = 'overview' | 'recent' | 'templates' | 'approvals';
type EditorView = 'template-editor' | 'document-generator' | null;

const DraftingDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<View>('overview');
  const [editorView, setEditorView] = useState<EditorView>(null);
  const [recentDrafts, setRecentDrafts] = useState<GeneratedDocument[]>([]);
  const [templates, setTemplates] = useState<DraftingTemplate[]>([]);
  const [approvals, setApprovals] = useState<GeneratedDocument[]>([]);
  const [stats, setStats] = useState<StatsType>({ drafts: 0, templates: 0, pendingReviews: 0, myTemplates: 0 });
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<DraftingTemplate | undefined>(undefined);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!editorView) {
      loadData();
    }
  }, [editorView, activeTab]);

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
    setEditorView('document-generator');
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(undefined);
    setEditorView('template-editor');
  };

  const handleSelectDraft = (draft: GeneratedDocument) => {
    addToast(`Opening draft: ${draft.title}`, 'info');
    // TODO: Navigate to document editor
  };

  const handleSelectTemplate = (template: DraftingTemplate) => {
    setSelectedTemplateId(template.id);
    setEditorView('document-generator');
  };

  const handleEditTemplate = (template: DraftingTemplate) => {
    setEditingTemplate(template);
    setEditorView('template-editor');
  };

  const handleReview = (doc: GeneratedDocument) => {
    addToast(`Reviewing: ${doc.title}`, 'info');
    // TODO: Navigate to review interface
  };

  const handleTemplateSaved = () => {
    addToast('Template saved successfully', 'success');
    setEditorView(null);
    setActiveTab('templates');
    loadData();
  };

  const handleDocumentGenerated = () => {
    addToast('Document generated successfully', 'success');
    setEditorView(null);
    setActiveTab('recent');
    loadData();
  };

  if (editorView === 'template-editor') {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleTemplateSaved}
        onCancel={() => setEditorView(null)}
      />
    );
  }

  if (editorView === 'document-generator') {
    return (
      <DocumentGenerator
        templateId={selectedTemplateId}
        onComplete={handleDocumentGenerated}
        onCancel={() => setEditorView(null)}
      />
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'recent', label: 'Recent Drafts', icon: Clock },
    { id: 'templates', label: 'Templates', icon: FolderOpen },
    { id: 'approvals', label: 'Approvals', icon: FileText },
  ];

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-full", theme.background)}>
        <div className={cn("animate-spin rounded-full h-8 w-8 border-b-2", theme.primary.text)}></div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      {/* Header Section */}
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Drafting & Assembly"
          subtitle="Enterprise document automation with template management"
          actions={
            <div className="flex items-center gap-2">
              <button 
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  theme.action.secondary.bg,
                  theme.action.secondary.text,
                  theme.action.secondary.border,
                  theme.action.secondary.hover
                )}
                onClick={handleCreateTemplate}
              >
                <FolderOpen className="h-4 w-4" />
                <span>New Template</span>
              </button>
              <button 
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  theme.action.primary.bg,
                  theme.action.primary.text,
                  theme.action.primary.hover
                )}
                onClick={handleCreateDraft}
              >
                <Plus className="h-4 w-4" />
                <span>Generate Document</span>
              </button>
            </div>
          }
        />

        {/* Tab Navigation */}
        <div className="mt-4 mb-4">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as View)}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">{activeTab === 'overview' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Main Column */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <DraftingStats stats={stats} />

              <div className={cn("rounded-xl shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
                <div className={cn("px-6 py-4 border-b flex items-center justify-between", theme.border.default)}>
                  <h3 className={cn("text-lg font-medium", theme.text.primary)}>Recent Drafts</h3>
                  <button 
                    className={cn("text-sm", theme.text.link)}
                    onClick={() => setActiveTab('recent')}
                  >
                    View All
                  </button>
                </div>
                <div>
                  <RecentDrafts drafts={Array.isArray(recentDrafts) ? recentDrafts.slice(0, 5) : []} onSelect={handleSelectDraft} />
                </div>
              </div>

              <div className={cn("rounded-xl shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
                <div className={cn("px-6 py-4 border-b flex items-center justify-between", theme.border.default)}>
                  <h3 className={cn("text-lg font-medium", theme.text.primary)}>Template Gallery</h3>
                  <button 
                    className={cn("text-sm", theme.text.link)}
                    onClick={() => setActiveTab('templates')}
                  >
                    Browse All
                  </button>
                </div>
                <div>
                  <TemplateGallery 
                    templates={Array.isArray(templates) ? templates.slice(0, 4) : []} 
                    onSelect={handleSelectTemplate}
                    onEdit={handleEditTemplate}
                  />
                </div>
              </div>
            </div>

            {/* Side Column */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className={cn("rounded-xl shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
                <div className={cn("px-6 py-4 border-b flex items-center justify-between", theme.border.default)}>
                  <h3 className={cn("text-lg font-medium", theme.text.primary)}>Approval Queue</h3>
                  <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded", theme.status.warning.bg, theme.status.warning.text)}>
                    {Array.isArray(approvals) ? approvals.length : 0} Pending
                  </span>
                </div>
                <div>
                  <ApprovalQueue approvals={approvals} onReview={handleReview} />
                </div>
              </div>

              <div className={cn("p-4 rounded-xl border", theme.status.info.bg, theme.status.info.border)}>
                <h4 className={cn("font-medium mb-2", theme.status.info.text)}>Quick Tips</h4>
                <ul className={cn("text-sm space-y-2 list-disc list-inside", theme.status.info.text)}>
                  <li>Use templates to ensure compliance with local rules.</li>
                  <li>Variables like {`{{case.title}}`} auto-populate from case data.</li>
                  <li>Insert clause library items for consistent language.</li>
                  <li>Submit for review to notify senior partners automatically.</li>
                </ul>
              </div>

              <div className={cn("p-4 rounded-xl border", theme.status.success.bg, theme.status.success.border)}>
                <h4 className={cn("font-medium mb-2", theme.status.success.text)}>
                  Integration Points
                </h4>
                <ul className={cn("text-sm space-y-2", theme.status.success.text)}>
                  <li>✓ Case Management: Auto-populate case data</li>
                  <li>✓ Clause Library: Reusable legal clauses</li>
                  <li>✓ Document Manager: Direct save integration</li>
                  <li>✓ E-Filing: One-click court filing</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className={cn("rounded-xl shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
            <div className={cn("px-6 py-4 border-b", theme.border.default)}>
              <h3 className={cn("text-lg font-medium", theme.text.primary)}>All Recent Drafts</h3>
            </div>
            <div>
              <RecentDrafts drafts={recentDrafts} onSelect={handleSelectDraft} />
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className={cn("rounded-xl shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
            <div className={cn("px-6 py-4 border-b flex items-center justify-between", theme.border.default)}>
              <h3 className={cn("text-lg font-medium", theme.text.primary)}>All Templates</h3>
              <button 
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  theme.action.primary.bg,
                  theme.action.primary.text,
                  theme.action.primary.hover
                )}
                onClick={handleCreateTemplate}
              >
                <Plus className="h-4 w-4" />
                <span>New Template</span>
              </button>
            </div>
            <div>
              <TemplateGallery 
                templates={templates} 
                onSelect={handleSelectTemplate}
                onEdit={handleEditTemplate}
              />
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className={cn("rounded-xl shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
            <div className={cn("px-6 py-4 border-b flex items-center justify-between", theme.border.default)}>
              <h3 className={cn("text-lg font-medium", theme.text.primary)}>Approval Queue</h3>
              <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded", theme.status.warning.bg, theme.status.warning.text)}>
                {Array.isArray(approvals) ? approvals.length : 0} Pending
              </span>
            </div>
            <div>
              <ApprovalQueue approvals={approvals} onReview={handleReview} />
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default DraftingDashboard;

