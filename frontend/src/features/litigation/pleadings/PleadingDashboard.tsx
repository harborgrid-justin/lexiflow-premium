import React, { useState } from 'react';
import { PageHeader } from '../../components/organisms/PageHeader';
import { Button } from '../../components/atoms/Button';
import { Plus, FileText, LayoutTemplate, Clock } from 'lucide-react';
import { useTheme } from '../../../providers/ThemeContext';
import { cn } from '@/utils/cn';
import { useModalState } from '../../../hooks';
import { DataService } from '@/services/data/dataService';
import { PleadingDocument, PleadingTemplate, PleadingSection } from '@/types/pleading-types';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
// ✅ Migrated to backend API (2025-12-21)
import { VirtualGrid } from '../../components/organisms/VirtualGrid';
import { Modal } from '../../components/molecules/Modal';
import { Input } from '../../components/atoms';
import { Case, CaseId, DocumentId, UserId } from '../../../types';

interface PleadingDashboardProps {
    onCreate: (newDoc: PleadingDocument) => void;
    onEdit: (id: string) => void;
    caseId?: string;
}

export const PleadingDashboard: React.FC<PleadingDashboardProps> = ({ onCreate, onEdit, caseId }) => {
    const { theme } = useTheme();
    const createModal = useModalState();
    const [newDocData, setNewDocData] = useState({ title: '', caseId: caseId || '', templateId: '' });
    
    const { data: pleadings = [] } = useQuery<PleadingDocument[]>(
        ['pleadings', caseId || 'all'],
        () => caseId ? DataService.pleadings.getByCaseId(caseId) : DataService.pleadings.getAll()
    );

    const { data: cases = [] } = useQuery<Case[]>(
        ['cases', 'all'],
        DataService.cases.getAll
    );
    
    const { data: templates = [] } = useQuery<PleadingTemplate[]>(
        ['pleading-templates', 'all'],
        () => DataService.pleadings.getTemplates()
    );

    const { mutate: createPleading } = useMutation(
        DataService.pleadings.add,
        {
            onSuccess: (newDoc) => {
                createModal.close();
                onCreate(newDoc as PleadingDocument);
            }
        }
    );

    const handleCreateSubmit = () => {
        if (!newDocData.title || !newDocData.caseId || !newDocData.templateId) return;
        
        const template = templates.find(t => t.id === newDocData.templateId);
        const sections: PleadingSection[] = template 
            ? template.defaultSections.map((s, idx) => ({ 
                id: `sec-${Date.now()}-${idx}`,
                type: s.type || 'Paragraph',
                content: s.content || '',
                order: idx
             }))
            : [];

        const doc: PleadingDocument = {
            id: `plead-${Date.now()}` as any,
            title: newDocData.title,
            caseId: newDocData.caseId as CaseId,
            status: 'Draft',
            filingStatus: 'Pre-Filing',
            jurisdictionRulesId: 'default',
            version: 1,
            sections: sections,
            createdBy: 'current-user' as UserId
        };
        createPleading(doc);
    };

    const renderItem = (item: PleadingDocument) => (
        <div 
            key={item.id} 
            className={cn("p-4 border rounded-lg h-full flex flex-col cursor-pointer transition-all hover:shadow-md group", theme.surface.default, theme.border.default, `hover:${theme.primary.border}`)}
            onClick={() => onEdit(item.id)}
        >
            <div className="flex items-start justify-between mb-2">
                <div className={cn("p-2 rounded bg-blue-50 text-blue-600")}><FileText className="h-6 w-6"/></div>
                <span className={cn("text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 font-medium")}>{item.status}</span>
            </div>
            <h4 className={cn("font-bold text-sm mb-1 line-clamp-2", theme.text.primary)}>{item.title}</h4>
            <p className={cn("text-xs mb-3 font-mono opacity-70", theme.text.secondary)}>{item.caseId}</p>
            <div className={cn("mt-auto text-xs flex items-center pt-2 border-t", theme.border.default, theme.text.tertiary)}>
                <Clock className="h-3 w-3 mr-1"/> Last edited: {item.lastAutoSaved || 'Just now'}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col px-6 pt-6">
            <PageHeader 
                title="Pleading Builder" 
                subtitle="Draft complaints, motions, and orders with automated formatting and case integration."
                actions={<Button variant="primary" icon={Plus} onClick={createModal.open}>New Pleading</Button>}
            />
            
            <div className="flex-1 overflow-hidden border-t pt-4">
                <VirtualGrid 
                    items={pleadings}
                    height="100%"
                    itemHeight={160}
                    itemWidth={250}
                    renderItem={renderItem}
                    emptyMessage="No pleadings found. Create one to get started."
                />
            </div>

            <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create New Pleading">
                <div className="p-6 space-y-4">
                    <Input label="Document Title" value={newDocData.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocData({...newDocData, title: e.target.value})} placeholder="e.g. Plaintiff's Motion to Compel" />
                    
                    <div>
                        <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Related Matter</label>
                        <select 
                            title="Select related case"
                            className={cn("w-full p-2 border rounded text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)}
                            value={newDocData.caseId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewDocData({...newDocData, caseId: e.target.value})}
                        >
                            <option value="">Select Case...</option>
                            {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Template</label>
                        <div className="grid grid-cols-2 gap-3">
                            {templates.map(t => (
                                <div 
                                    key={t.id}
                                    onClick={() => setNewDocData({...newDocData, templateId: t.id})}
                                    className={cn(
                                        "p-3 border rounded cursor-pointer transition-colors flex items-center gap-2",
                                        newDocData.templateId === t.id ? cn("border-blue-500 bg-blue-50", theme.text.primary) : cn(theme.border.default, theme.surface.default, theme.text.secondary)
                                    )}
                                >
                                    <LayoutTemplate className="h-4 w-4"/>
                                    <span className="text-sm font-medium">{t.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <Button variant="secondary" onClick={createModal.close}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreateSubmit} disabled={!newDocData.title || !newDocData.caseId || !newDocData.templateId}>Create Draft</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};


