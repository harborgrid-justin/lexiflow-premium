import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { LegalRule } from '../../types';
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../services/infrastructure/queryClient';
import { queryKeys } from '../../utils/queryKeys';
import { STORES } from '../../services/data/dataService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Bookmark, Share2, ExternalLink, BookOpen, Scale, FileText, History, Loader2, Search } from 'lucide-react';
import { Button } from '../common/Button';
import { Tabs } from '../common/Tabs';
import { useWindow } from '../../context/WindowContext';
import { RuleTreeViewer } from './rule-viewer/RuleTreeViewer';
import { RuleContentDisplay } from './rule-viewer/RuleContentDisplay';
import { useRuleSearchAndSelection } from '../../hooks/useRuleSearchAndSelection';

interface RuleBookViewerProps {
  type: 'FRE' | 'FRCP' | 'FRAP' | 'Local';
  title: string;
  isOrbital?: boolean; // Detect if running in window
}

export const RuleBookViewer: React.FC<RuleBookViewerProps> = ({ type, title, isOrbital }) => {
  const { theme } = useTheme();
  const { openWindow } = useWindow();
  const [activeTab, setActiveTab] = useState('text');

  // Fetch all rules from a centralized store
  const { data: allRules = [], isLoading: isLoadingAllRules } = useQuery<LegalRule[]>(
      queryKeys.rules.all(),
      () => DataService.rules ? DataService.rules.getAll() : Promise.resolve([])
  );

  // Filter rules based on the viewer's 'type' prop
  const filteredRules = useMemo(() => allRules.filter(r => r.type === type), [allRules, type]);

  // Custom hook for managing search and rule selection logic
  const {
    searchTerm,
    setSearchTerm,
    selectedRuleId,
    setSelectedRuleId,
    expandedIds,
    toggleExpand,
    displayHierarchy,
    currentExpandedIds,
    isLoadingSearch,
    selectedRule
  } = useRuleSearchAndSelection(filteredRules); // Pass filtered rules here
  
  // Handlers for UI interaction
  const handlePopOut = (rule: LegalRule) => {
      const winId = `rule-${rule.id}`;
      openWindow(
          winId,
          `${rule.code} - ${rule.name}`,
          <div className={cn("h-full flex flex-col p-6 overflow-y-auto", theme.surface.default)}>
              <h2 className={cn("text-2xl font-bold mb-4", theme.text.primary)}>{rule.name}</h2>
              <div className={cn("prose max-w-none", theme.text.secondary)}>{rule.text}</div>
          </div>
      );
  };
  
  if (isLoadingAllRules) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;
  
  return (
    <div className={cn("flex h-full rounded-lg border shadow-sm overflow-hidden", theme.surface.default, theme.border.default)}>
        {/* Sidebar: Table of Contents */}
        <div className={cn("w-80 border-r flex flex-col bg-slate-50/50", theme.border.default)}>
            <div className={cn("p-4 border-b", theme.border.default)}>
                <h3 className={cn("font-bold text-sm uppercase tracking-wide mb-3", theme.text.secondary)}>Table of Contents</h3>
                <div className="relative">
                    {isLoadingSearch ? (
                        <Loader2 className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin", theme.text.tertiary)}/>
                    ) : (
                        <Search className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5", theme.text.tertiary)}/>
                    )}
                    <input 
                        className={cn("w-full pl-8 pr-3 py-1.5 text-xs border rounded-md outline-none focus:ring-1 focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
                        placeholder="Search rules (e.g. '201')..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className={cn("flex-1 overflow-y-auto p-2", isLoadingSearch ? "opacity-50" : "")}>
                <RuleTreeViewer 
                    nodes={displayHierarchy}
                    currentExpandedIds={currentExpandedIds}
                    selectedRuleId={selectedRuleId}
                    toggleExpand={toggleExpand}
                    setSelectedRuleId={setSelectedRuleId}
                    searchTerm={searchTerm}
                    theme={theme}
                />
            </div>
        </div>

        {/* Content Area */}
        <div className={cn("flex-1 flex flex-col relative overflow-hidden", theme.surface.default)}>
            {selectedRule ? (
                <>
                    <div className={cn("p-6 border-b flex justify-between items-start shrink-0", theme.border.default)}>
                        <div>
                             <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-1 rounded", theme.surface.highlight, theme.text.secondary)}>{type} {selectedRule.code}</span>
                             <h2 className={cn("text-2xl font-bold mt-3 leading-tight", theme.text.primary)}>{selectedRule.name}</h2>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" icon={Bookmark}/>
                            <Button variant="ghost" size="sm" icon={Share2}/>
                            {!isOrbital && (
                                <Button variant="outline" size="sm" icon={ExternalLink} onClick={() => handlePopOut(selectedRule)}>Pop Out</Button>
                            )}
                        </div>
                    </div>

                    {selectedRule.structuredContent ? (
                        <>
                            <div className={cn("px-6 pt-4 border-b", theme.border.default)}>
                                <Tabs 
                                    tabs={[
                                        {id: 'text', label: 'Rule Text', icon: Scale},
                                        {id: 'history', label: 'History & Statutory Notes', icon: History},
                                        {id: 'notes', label: 'Advisory Committee Notes', icon: FileText}
                                    ]} 
                                    activeTab={activeTab}
                                    onChange={(t) => setActiveTab(t as any)}
                                />
                            </div>
                             <div className="flex-1 overflow-y-auto p-8">
                                <RuleContentDisplay 
                                    selectedRule={selectedRule} 
                                    activeTab={activeTab} 
                                    theme={theme} 
                                />
                             </div>
                        </>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                            <div className={cn("prose max-w-none leading-loose font-serif text-base", theme.mode === 'dark' ? "prose-invert" : "prose-slate")}>
                                <p>{selectedRule.text || selectedRule.summary}</p>
                            </div>
                            
                            {selectedRule.summary && selectedRule.text && (
                                <div className={cn("mt-8 p-4 border-l-4 rounded-r-lg", theme.primary.light, theme.primary.border)}>
                                    <h4 className={cn("text-sm font-bold mb-1", theme.primary.text)}>Official Commentary / Summary</h4>
                                    <p className={cn("text-sm leading-relaxed", theme.primary.text)}>{selectedRule.summary}</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className={cn("flex flex-col items-center justify-center h-full", theme.text.tertiary)}>
                    <BookOpen className="h-16 w-16 mb-4 opacity-20"/>
                    <p>Select a rule from the Table of Contents to view.</p>
                </div>
            )}
        </div>
    </div>
  );
};
