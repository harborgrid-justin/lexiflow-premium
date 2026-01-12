import { Tabs } from '@/shared/ui/molecules/Tabs/Tabs';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/features/theme';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { queryKeys } from '@/utils/queryKeys';
import { ArrowRight, FileText, Fingerprint, Link, Loader2, Scale, Search } from 'lucide-react';
import React, { useState } from 'react';
// ✅ Migrated to backend API (2025-12-21)
import { CaseId } from '@/types';

interface ContextPanelProps {
    caseId: CaseId;
    onInsertFact: (text: string) => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({ caseId, onInsertFact }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('facts');
    const [search, setSearch] = useState('');

    const { data: caseData, isLoading } = useQuery(queryKeys.cases.detail(caseId), () => DataService.cases.getById(caseId));

    interface CaseDataWithContext {
        arguments?: Array<{ id: string; title: string }>;
        evidence?: Array<{ id: string; title: string }>;
        citations?: Array<{ id: string; citation: string }>;
    }

    const typedCaseData = caseData as CaseDataWithContext | undefined;

    const facts = (typedCaseData?.arguments || []).map(arg => ({ id: arg.id, type: 'Argument', text: arg.title, source: 'Case Strategy' }));
    const evidence = typedCaseData?.evidence?.map(ev => ({ id: ev.id, type: 'Evidence', text: ev.title, source: 'Evidence Vault' })) || [];
    const law = (typedCaseData?.citations || []).map(cit => ({ id: cit.id, type: 'Citation', text: cit.citation, source: 'Authority Library' }));

    const items = [...facts, ...evidence, ...law];

    const filteredItems = items.filter(item => {
        const matchesTab = (activeTab === 'facts' && (item.type === 'Fact' || item.type === 'Argument')) ||
            (activeTab === 'evidence' && item.type === 'Evidence') ||
            (activeTab === 'law' && item.type === 'Citation');
        const matchesSearch = !search || item.text.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full">
            <div className={cn("p-4 border-b", theme.border.default)}>
                <h3 className={cn("text-sm font-bold flex items-center gap-2 mb-4", theme.text.primary)}>
                    <Link className="h-4 w-4 text-blue-600" /> Context Hub
                </h3>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        className={cn("w-full pl-9 pr-3 py-1.5 text-xs border rounded-md outline-none", theme.surface.input, theme.border.default, theme.text.primary)}
                        placeholder="Search case context..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                </div>
                <Tabs
                    tabs={[
                        { id: 'facts', label: 'Facts', icon: FileText },
                        { id: 'evidence', label: 'Evidence', icon: Fingerprint },
                        { id: 'law', label: 'Law', icon: Scale },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    variant="segmented"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {isLoading ? (
                    <Loader2 className="animate-spin m-4" />
                ) : filteredItems.length === 0 ? (
                    <p className={cn("text-xs text-center p-4", theme.text.tertiary)}>No items found.</p>
                ) : (
                    filteredItems.map(item => (
                        <div
                            key={item.id}
                            className={cn(
                                "p-2 rounded border text-xs cursor-pointer group transition-colors",
                                theme.surface.default, theme.border.subtle,
                                "hover:border-blue-300"
                            )}
                            onClick={() => onInsertFact(item.text)}
                        >
                            <p className={cn("font-medium mb-1", theme.text.primary)}>{item.text}</p>
                            <div className="flex items-center justify-between">
                                <span className={cn("text-[10px]", theme.text.tertiary)}>{item.source}</span>
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-blue-600" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ContextPanel;
