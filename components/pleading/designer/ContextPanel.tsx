import React, { useState } from 'react';
import { Search, Fingerprint, Scale, FileText, ArrowRight, Link, Loader2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Tabs } from '../../common/Tabs';
import { DataService } from '../../../services/dataService';
import { useQuery } from '../../../services/queryClient';
import { STORES } from '../../../services/db';
import { CaseId } from '../../../types';

interface ContextPanelProps {
    caseId: CaseId;
    onInsertFact: (text: string) => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({ caseId, onInsertFact }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('facts');
    const [search, setSearch] = useState('');

    const { data: caseData, isLoading } = useQuery([STORES.CASES, caseId], () => DataService.cases.getById(caseId));

    const facts = (caseData?.arguments || []).map(arg => ({ id: arg.id, type: 'Argument', text: arg.title, source: 'Case Strategy' }));
    const evidence = (caseData as any)?.evidence?.map((ev: any) => ({ id: ev.id, type: 'Evidence', text: ev.title, source: 'Evidence Vault' })) || [];
    const law = (caseData?.citations || []).map(cit => ({ id: cit.id, type: 'Citation', text: cit.citation, source: 'Authority Library' }));
    
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                    <input 
                        className={cn("w-full pl-9 pr-3 py-1.5 text-xs border rounded-md outline-none", theme.surface, theme.border.default, theme.text.primary)}
                        placeholder="Search case context..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
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
                {isLoading ? <Loader2 className="animate-spin m-4" /> : filteredItems.map(item => (
                    <div 
                        key={item.id} 
                        draggable
                        onDragStart={(e) => { e.dataTransfer.setData('text/plain', item.text); }}
                        onClick={() => onInsertFact(item.text)}
                        className={cn(
                            "p-3 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-all group", 
                            theme.surface, theme.border.default
                        )}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded", theme.surfaceHighlight, theme.text.tertiary)}>{item.type}</span>
                            <ArrowRight className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100"/>
                        </div>
                        <p className={cn("text-xs font-medium line-clamp-2", theme.text.primary)}>{item.text}</p>
                        <p className={cn("text-[10px] mt-1 italic", theme.text.tertiary)}>{item.source}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ContextPanel;
