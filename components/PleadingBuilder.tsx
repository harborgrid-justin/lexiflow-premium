
import React, { useState, Suspense, lazy, useTransition } from 'react';
import { Case, PleadingDocument, PleadingTemplate, PleadingSection, CaseId, UserId } from '../types';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { TabbedPageLayout } from './layout/TabbedPageLayout';
import { PLEADING_BUILDER_TAB_CONFIG } from '../config/pleadingBuilderConfig';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { Button } from './common/Button';
import { Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, queryClient } from '../services/queryClient';
import { DataService } from '../services/dataService';
import { STORES } from '../services/db';
import { Modal } from './common/Modal';
import { Input } from './common/Inputs';
import { LazyLoader } from './common/LazyLoader';

// Lazy load components with correct default export syntax
const PleadingDesigner = lazy(() => import('./pleading/PleadingDesigner'));
const PleadingDrafts = lazy(() => import('./pleading/PleadingDrafts').then(m => ({ default: m.PleadingDrafts })));
const PleadingTemplates = lazy(() => import('./pleading/PleadingTemplates').then(m => ({ default: m.PleadingTemplates })));
const ClauseLibrary = lazy(() => import('./ClauseLibrary')); // Assuming ClauseLibrary is default export
const PleadingFilingQueue = lazy(() => import('./pleading/PleadingFilingQueue').then(m => ({ default: m.PleadingFilingQueue })));
const PleadingAnalytics = lazy(() => import('./pleading/PleadingAnalytics').then(m => ({ default: m.PleadingAnalytics })));


interface PleadingBuilderProps {
  onSelectCase?: (c: Case) => void;
  caseId?: string;
}

export const PleadingBuilder: React.FC<PleadingBuilderProps> = ({ onSelectCase, caseId }) => {
    const { theme } = useTheme();
    const [view, setView] = useState<'workspace' | 'designer'>('workspace');
    const [activePleading, setActivePleading] = useState<PleadingDocument | null>(null);
    const [isPending, startTransition] = useTransition();
    const [activeTab, _setActiveTab] = useSessionStorage<string>('pleading_builder_tab', 'drafts');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newDocData, setNewDocData] = useState({ title: '', caseId: caseId || '', templateId: '' });

    const setActiveTab = (tab: string) => {
      startTransition(() => {
        _setActiveTab(tab);
      });
    };

    // Data fetching
    const { data: pleadings = [], isLoading: pleadingsLoading } = useQuery<PleadingDocument[]>(
        [STORES.PLEADINGS, caseId || 'all'],
        () => caseId ? DataService.pleadings.getByCaseId(caseId) : DataService.pleadings.getAll()
    );
    const { data: cases = [] } = useQuery<Case[]>([STORES.CASES, 'all'], DataService.cases.getAll);
    const { data: templates = [] } = useQuery<PleadingTemplate[]>([STORES.PLEADING_TEMPLATES, 'all'], DataService.pleadings.getTemplates);

    const { mutate: createPleading } = useMutation(
        DataService.pleadings.add,
        {
            onSuccess: (newDoc) => {
                setIsCreateModalOpen(false);
                setActivePleading(newDoc);
                setView('designer');
                queryClient.invalidate([STORES.PLEADINGS, caseId || 'all']);
            }
        }
    );

    const handleEdit = (doc: PleadingDocument) => {
        setActivePleading(doc);
        setView('designer');
    };

    const handleCreateNew = (template?: PleadingTemplate) => {
        setNewDocData({ title: template ? template.name : '', caseId: caseId || '', templateId: template?.id || '' });
        setIsCreateModalOpen(true);
    };
    
    const handleCreateSubmit = () => {
        if (!newDocData.title || !newDocData.caseId || !newDocData.templateId) return;
        
        const template = templates.find(t => t.id === newDocData.templateId);
        const sections: PleadingSection[] = template 
            ? template.defaultSections.map((s, idx) => ({ 
                id: `sec-${Date.now()}-${idx}`,
                type: s.type || 'Paragraph',
                content: s.content || '',
                order: idx,
                meta: s.meta
             }))
            : [];

        const doc: PleadingDocument = {
            id: `plead-${Date.now()}` as any,
            caseId: newDocData.caseId as CaseId,
            title: newDocData.title,
            status: 'Draft',
            filingStatus: 'Pre-Filing',
            jurisdictionRulesId: 'default',
            version: 1,
            sections: sections,
            createdBy: 'current-user' as UserId
        };
        createPleading(doc);
    };

    const renderContent = () => {
        if(pleadingsLoading) return <LazyLoader message="Loading Pleadings..." />;

        switch (activeTab) {
            case 'drafts':
                return <PleadingDrafts pleadings={pleadings} onEdit={handleEdit} />;
            case 'templates':
                return <PleadingTemplates templates={templates} onCreateFromTemplate={handleCreateNew} />;
            case 'clauses':
                return <ClauseLibrary onSelectClause={(c: any) => alert(`Clause '${c.name}' selected. Editor integration pending.`)} />;
            case 'queue':
                return <PleadingFilingQueue />;
            case 'analytics':
                return <PleadingAnalytics />;
            default:
                return <PleadingDrafts pleadings={pleadings} onEdit={handleEdit} />;
        }
    };

    if (view === 'designer' && activePleading) {
        return (
            <Suspense fallback={<LazyLoader message="Loading Designer..." />}>
                <PleadingDesigner pleading={activePleading} onBack={() => setView('workspace')} />
            </Suspense>
        );
    }

    return (
        <>
        <TabbedPageLayout
            pageTitle="Pleading Builder"
            pageSubtitle="Draft, format, and file legal documents with AI assistance."
            pageActions={<Button variant="primary" icon={Plus} onClick={() => handleCreateNew()}>New Pleading</Button>}
            tabConfig={PLEADING_BUILDER_TAB_CONFIG}
            activeTabId={activeTab}
            onTabChange={setActiveTab}
        >
            <Suspense fallback={<LazyLoader message={`Loading ${activeTab}...`} />}>
                <div className={cn("h-full", isPending && "opacity-60 transition-opacity")}>
                  {renderContent()}
                </div>
            </Suspense>
        </TabbedPageLayout>

        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Pleading">
            <div className="p-6 space-y-4">
                <Input label="Document Title" value={newDocData.title} onChange={e => setNewDocData({...newDocData, title: e.target.value})} placeholder="e.g. Plaintiff's Motion to Compel" />
                {!caseId && (
                <div>
                    <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Related Matter</label>
                    <select 
                        className={cn("w-full p-2 border rounded text-sm outline-none", theme.surface, theme.border.default, theme.text.primary)}
                        value={newDocData.caseId}
                        onChange={e => setNewDocData({...newDocData, caseId: e.target.value})}
                    >
                        <option value="">Select Case...</option>
                        {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                )}
                <div>
                    <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Template</label>
                    <select 
                        className={cn("w-full p-2 border rounded text-sm outline-none", theme.surface, theme.border.default, theme.text.primary)}
                        value={newDocData.templateId}
                        onChange={e => setNewDocData({...newDocData, templateId: e.target.value})}
                    >
                        <option value="">Select Template...</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div className="flex justify-end pt-4 gap-2">
                    <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreateSubmit} disabled={!newDocData.title || !newDocData.caseId || !newDocData.templateId}>Create & Open</Button>
                </div>
            </div>
        </Modal>
        </>
    );
};
export default PleadingBuilder;
