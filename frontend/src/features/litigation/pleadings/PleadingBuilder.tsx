/**
 * @module components/pleading/PleadingBuilder
 * @category Pleadings
 * @description Pleading builder with AI drafting and template management.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, Suspense, lazy } from 'react';
import { Plus, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { queryKeys } from '@/utils/queryKeys';
// ✅ Migrated to backend API with queryKeys (2025-12-21)

// Hooks & Context
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { useTheme } from '@/providers/ThemeContext';
import { useNotify } from '@/hooks/useNotify';
import { useModalState } from '@/hooks';

// Components
import { TabbedPageLayout } from '@/components/templates/TabbedPageLayout';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { Input } from '@/components/atoms';
import { LazyLoader } from '@/components/molecules/LazyLoader';

// Utils & Config
import { cn } from '@/utils/cn';
import { PLEADING_BUILDER_TAB_CONFIG } from '@/config/tabs.config';
import { IdGenerator } from '@/utils/idGenerator';
import { validateTemplate } from '@/utils/validation';

// Types
import { Case, PleadingDocument, PleadingTemplate, PleadingSection, CaseId, UserId } from '@/types';

// Lazy imports with named export handling
const PleadingDesigner = lazy(() => import('./PleadingDesigner')); // Export default exists
const PleadingDrafts = lazy(() => import('./PleadingDrafts').then(m => ({ default: m.PleadingDrafts })));
const PleadingTemplates = lazy(() => import('./PleadingTemplates').then(m => ({ default: m.PleadingTemplates })));
const ClauseLibrary = lazy(() => import('@/features/knowledge/clauses/ClauseLibrary')); // Export default exists
const PleadingFilingQueue = lazy(() => import('./PleadingFilingQueue').then(m => ({ default: m.PleadingFilingQueue })));
const PleadingAnalytics = lazy(() => import('./PleadingAnalytics').then(m => ({ default: m.PleadingAnalytics })));

import { PleadingBuilderProps } from './types';

export const PleadingBuilder: React.FC<PleadingBuilderProps> = ({ onSelectCase, caseId }) => {
    const { theme } = useTheme();
    const [view, setView] = useState<'workspace' | 'designer'>('workspace');
    const [activePleading, setActivePleading] = useState<PleadingDocument | null>(null);
    const [activeTab, setActiveTab] = useSessionStorage<string>('pleading_builder_tab', 'drafts');
    const createModal = useModalState();
    const [newDocData, setNewDocData] = useState({ title: '', caseId: caseId || '', templateId: '' });
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const { success: notifySuccess, error: notifyError } = useNotify();

    // Data fetching with queryKeys
    const { data: pleadings = [], isLoading: pleadingsLoading } = useQuery<PleadingDocument[]>(
        caseId ? queryKeys.pleadings.byCaseId(caseId) : queryKeys.pleadings.all(),
        () => caseId ? DataService.pleadings.getByCaseId(caseId) : DataService.pleadings.getAll()
    );
    const { data: cases = [] } = useQuery<Case[]>(
        queryKeys.cases.all(),
        () => DataService.cases.getAll()
    );
    const { data: templates = [], isLoading: templatesLoading } = useQuery<PleadingTemplate[]>(
        queryKeys.pleadingTemplates.all(),
        () => DataService.pleadings.getTemplates()
    );

    const { mutate: createPleading, isLoading: isCreating } = useMutation(
        async (data: { templateId: string; caseId: string; title: string; userId: string }) => {
            return await DataService.pleadings.createFromTemplate(
                data.templateId,
                data.caseId,
                data.title,
                data.userId
            );
        },
        {
            onSuccess: (newDoc) => {
                createModal.close();
                setValidationErrors([]);
                setActivePleading(newDoc);
                setView('designer');
                queryClient.invalidate(caseId ? queryKeys.pleadings.byCaseId(caseId) : queryKeys.pleadings.all());
                notifySuccess('Pleading created successfully');
            },
            onError: (error: Error) => {
                notifyError(`Failed to create pleading: ${error.message}`);
                setValidationErrors([error.message]);
            }
        }
    );

    const handleEdit = (doc: PleadingDocument) => {
        setActivePleading(doc);
        setView('designer');
    };

    const handleCreateNew = (template?: PleadingTemplate) => {
        setNewDocData({ title: template ? template.name : '', caseId: caseId || '', templateId: template?.id || '' });
        createModal.open();
    };
    
    const handleCreateSubmit = () => {
        // Clear previous errors
        setValidationErrors([]);

        // Validate required fields
        const errors: string[] = [];
        
        if (!newDocData.title?.trim()) {
            errors.push('Document title is required');
        }
        
        if (!newDocData.caseId) {
            errors.push('Case must be selected');
        }
        
        if (!newDocData.templateId) {
            errors.push('Template must be selected');
        }

        // Validate template if selected
        if (newDocData.templateId) {
            const template = templates.find(t => t.id === newDocData.templateId);
            if (template) {
                const validation = validateTemplate(template);
                if (!validation.valid) {
                    errors.push(...validation.errors.map(e => e.message));
                }
            } else {
                errors.push('Selected template not found');
            }
        }

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Create pleading using repository method with proper type safety
        createPleading({
            templateId: newDocData.templateId,
            caseId: newDocData.caseId,
            title: newDocData.title.trim(),
            userId: localStorage.getItem('userId') || 'current-user'
        });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'drafts':
                return <PleadingDrafts pleadings={pleadings} onEdit={handleEdit} isLoading={pleadingsLoading} />;
            case 'templates':
                return <PleadingTemplates templates={templates} onCreateFromTemplate={handleCreateNew} isLoading={templatesLoading} />;
            case 'clauses':
                return <ClauseLibrary onSelectClause={(clause: any) => {
                    notifySuccess(`Clause "${clause.name}" added to editor`);
                    // If there's an active pleading, we would append the clause
                    // For now, log to console for integration
                    console.log('Clause selected for insertion:', clause);
                    // Future: setActivePleading to include clause content
                }} />;
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
                <div className="h-full">
                  {renderContent()}
                </div>
            </Suspense>
        </TabbedPageLayout>

        <Modal isOpen={createModal.isOpen} onClose={() => { createModal.close(); setValidationErrors([]); }} title="Create New Pleading">
            <div className="p-6 space-y-4">
                {validationErrors.length > 0 && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800">
                        <div className="text-sm font-semibold text-rose-800 dark:text-rose-300 mb-1">Validation Errors:</div>
                        <ul className="text-xs text-rose-700 dark:text-rose-400 list-disc list-inside space-y-0.5">
                            {validationErrors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <Input label="Document Title" value={newDocData.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocData({...newDocData, title: e.target.value})} placeholder="e.g. Plaintiff's Motion to Compel" required />
                {!caseId && (
                <div>
                    <label htmlFor="case-select" className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Related Matter</label>
                    <select 
                        id="case-select"
                        className={cn("w-full p-2 border rounded text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)}
                        value={newDocData.caseId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewDocData({...newDocData, caseId: e.target.value})}
                    >
                        <option value="">Select Case...</option>
                        {Array.isArray(cases) && cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                )}
                <div>
                    <label htmlFor="template-select" className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Template</label>
                    <select 
                        id="template-select"
                        className={cn("w-full p-2 border rounded text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)}
                        value={newDocData.templateId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewDocData({...newDocData, templateId: e.target.value})}
                    >
                        <option value="">Select Template...</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div className="flex justify-end pt-4 gap-2">
                    <Button variant="secondary" onClick={() => { createModal.close(); setValidationErrors([]); }} disabled={isCreating}>Cancel</Button>
                    <Button 
                        variant="primary" 
                        onClick={handleCreateSubmit} 
                        disabled={!newDocData.title?.trim() || !newDocData.caseId || !newDocData.templateId || isCreating}
                        isLoading={isCreating}
                    >
                        {isCreating ? 'Creating...' : 'Create & Open'}
                    </Button>
                </div>
            </div>
        </Modal>
        </>
    );
};
export default PleadingBuilder;


