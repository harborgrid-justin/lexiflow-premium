
import React, { useState } from 'react';
import { Search, Fingerprint, Scale, FileText, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Tabs } from '../../common/Tabs';
import { DataService } from '../../../services/dataService';
import { useQuery } from '../../../services/queryClient';
import { STORES } from '../../../services/db';

interface ContextPanelProps {
    caseId: string;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ caseId }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('facts');
    const [search, setSearch] = useState('');

    // Mock Data Fetching (in real app, use useQuery)
    const items = [
        { id: 'f1', type: 'Fact', text: 'On June 14, Defendant failed to appear.', source: 'Affidavit' },
        { id: 'e1', type: 'Evidence', text: 'Exhibit A: Contract', source: 'Doc Store' },
        { id: 'c1', type: 'Citation', text: 'Ashcroft v. Iqbal (2009)', source: 'Lexis' },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className={cn("p-4 border-b", theme.border.default)}>
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
                {items.map(item => (
                    <div 
                        key={item.id} 
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', item.text);
                            e.dataTransfer.setData('application/lexiflow-item', JSON.stringify(item));
                        }}
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
            
            <div className={cn("p-3 border-t bg-slate-50 text-[10px] text-center text-slate-500", theme.border.default)}>
                Drag items to canvas to link
            </div>
        </div>
    );
};
