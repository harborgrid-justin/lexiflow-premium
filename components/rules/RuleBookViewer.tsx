
import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { LegalRule } from '../../types';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { ChevronRight, ChevronDown, Search, Bookmark, Share2, BookOpen, Scale, FileText, History, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';
import { Tabs } from '../common/Tabs';
import { useWindow } from '../../context/WindowContext';

interface RuleBookViewerProps {
  type: 'FRE' | 'FRCP' | 'FRAP' | 'Local';
  title: string;
  isOrbital?: boolean; // Detect if running in window
}

export const RuleBookViewer: React.FC<RuleBookViewerProps> = ({ type, title, isOrbital }) => {
  const { theme, mode } = useTheme();
  const { openWindow } = useWindow();
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [isPending, startTransition] = useTransition();

  const { data: allRules = [] } = useQuery<LegalRule[]>(
      [STORES.RULES, 'all'],
      DataService.rules.getAll
  );

  const rules = useMemo(() => allRules.filter(r => r.type === type), [allRules, type]);
  
  // 1. Build Full Hierarchy
  const fullHierarchy = useMemo(() => {
      const root: LegalRule[] = [];
      const map = new Map<string, LegalRule>();
      
      // Deep copy to avoid mutating cache
      const rulesCopy = JSON.parse(JSON.stringify(rules)) as LegalRule[];

      rulesCopy.forEach(r => {
          r.children = [];
          map.set(r.id, r);
      });

      rulesCopy.forEach(r => {
          if (r.parentId && map.has(r.parentId)) {
              map.get(r.parentId)!.children!.push(r);
          } else {
              root.push(r);
          }
      });

      return root;
  }, [rules]);

  // 2. Filter & Search Logic
  const { displayHierarchy, searchExpandedIds } = useMemo(() => {
    if (!searchTerm.trim()) {
        return { displayHierarchy: fullHierarchy, searchExpandedIds: null };
    }

    const lowerTerms = searchTerm.toLowerCase().split(' ').filter(Boolean);
    const matchedIds = new Set<string>();
    const expanded = new Set<string>();

    const filterRecursive = (nodes: LegalRule[]): LegalRule[] => {
        return nodes.map(node => {
            // Check if this node matches ALL search terms across its fields
            const nodeText = `${node.code} ${node.name} ${node.type} ${node.summary || ''} ${node.text || ''}`.toLowerCase();
            const matchesSelf = lowerTerms.every(term => nodeText.includes(term));

            const filteredChildren = filterRecursive(node.children || []);
            
            if (matchesSelf || filteredChildren.length > 0) {
                if (filteredChildren.length > 0) {
                    expanded.add(node.id); // Expand parent if child matches
                }
                return { ...node, children: filteredChildren };
            }
            return null;
        }).filter(Boolean) as LegalRule[];
    };

    const filtered = filterRecursive(fullHierarchy);
    return { displayHierarchy: filtered, searchExpandedIds: expanded };
  }, [fullHierarchy, searchTerm]);

  // Handle default expansion vs search expansion
  const currentExpandedIds = searchTerm ? searchExpandedIds! : expandedIds;

  // Initial Auto-expand first article if no search
  useEffect(() => {
      if (!searchTerm && fullHierarchy.length > 0 && expandedIds.size === 0) {
          setExpandedIds(new Set([fullHierarchy[0].id]));
      }
  }, [fullHierarchy, searchTerm]);

  const toggleExpand = (id: string) => {
      if (searchTerm) return; // Disable collapsing during search for simplicity, or handle separate state
      const newSet = new Set(expandedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setExpandedIds(newSet);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      startTransition(() => {
          setSearchTerm(e.target.value);
      });
  };

  const handlePopOut = (rule: LegalRule) => {
      const winId = `rule-${rule.id}`;
      openWindow(
          winId,
          `${rule.code} - ${rule.name}`,
          <div className={cn("h-full flex flex-col p-6 overflow-y-auto", theme.surface)}>
              <h2 className={cn("text-2xl font-bold mb-4", theme.text.primary)}>{rule.name}</h2>
              <div className={cn("prose max-w-none", theme.text.secondary)}>{rule.text}</div>
          </div>
      );
  };

  const selectedRule = rules.find(r => r.id === selectedRuleId);

  const renderTree = (nodes: LegalRule[]) => {
      if (nodes.length === 0) {
          return <div className={cn("p-4 text-xs italic text-center", theme.text.tertiary)}>No rules found matching "{searchTerm}"</div>;
      }
      return (
          <ul className="pl-2 space-y-1">
              {nodes.map(node => {
                  const hasChildren = node.children && node.children.length > 0;
                  const isExpanded = currentExpandedIds.has(node.id);
                  const isSelected = selectedRuleId === node.id;

                  return (
                      <li key={node.id}>
                          <div 
                              className={cn(
                                  "flex items-center py-1.5 px-2 rounded cursor-pointer transition-colors text-sm",
                                  isSelected ? cn(theme.primary.light, theme.primary.text, "font-medium") : cn(theme.text.secondary, `hover:${theme.surfaceHighlight}`)
                              )}
                              onClick={() => {
                                  if (hasChildren && !searchTerm) toggleExpand(node.id);
                                  else setSelectedRuleId(node.id);
                              }}
                          >
                              {hasChildren && (
                                  <span className="mr-1 text-slate-400">
                                      {isExpanded ? <ChevronDown className="h-3 w-3"/> : <ChevronRight className="h-3 w-3"/>}
                                  </span>
                              )}
                              {!hasChildren && <span className="w-4"></span>}
                              <span className="truncate">
                                  <span className="font-bold mr-2">{node.code}</span> 
                                  {node.name}
                              </span>
                          </div>
                          {hasChildren && isExpanded && renderTree(node.children!)}
                      </li>
                  );
              })}
          </ul>
      );
  };

  const renderStructuredContent = (data: any) => {
    if (!data) return null;

    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Rule Text Section */}
        {activeTab === 'text' && (
            <div className="space-y-6 animate-fade-in">
                {Object.entries(data.text).map(([key, val]: [string, any]) => (
                    <div key={key} className={cn("pl-4 border-l-2", theme.border.light)}>
                        <h4 className={cn("text-sm font-bold mb-2 flex items-center", theme.text.primary)}>
                            <span className={cn("px-1.5 py-0.5 rounded mr-2 text-xs font-mono", theme.surfaceHighlight, theme.text.secondary)}>({key})</span>
                            {val.title}
                        </h4>
                        
                        {/* Content can be string or object with subsections */}
                        {typeof val.content === 'string' ? (
                            <p className={cn("text-sm leading-relaxed mb-2", theme.text.secondary)}>{val.content}</p>
                        ) : (
                            val.content && Object.entries(val.content).map(([subKey, subText]: [string, any]) => (
                                <div key={subKey} className={cn("ml-4 mt-2 text-sm", theme.text.secondary)}>
                                    <span className="font-semibold capitalize">{subKey}: </span> {subText}
                                </div>
                            ))
                        )}

                        {/* Subsections */}
                        {val.subsections && (
                            <ul className={cn("ml-6 space-y-2 mt-2 list-disc text-sm", theme.text.secondary)}>
                                {Object.entries(val.subsections).map(([subKey, subText]: [string, any]) => (
                                    <li key={subKey}>
                                        <span className={cn("font-mono text-xs mr-1", theme.text.tertiary)}>({subKey})</span> {subText}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        )}

        {/* History / Statutory Notes */}
        {activeTab === 'history' && data.statutory_notes && (
             <div className="space-y-6 animate-fade-in">
                 <div className={cn("p-4 rounded-lg border", theme.surfaceHighlight, theme.border.default)}>
                     <h4 className={cn("text-sm font-bold mb-2 flex items-center", theme.text.primary)}><History className="h-4 w-4 mr-2"/> Enactment</h4>
                     <div className={cn("text-xs grid grid-cols-2 gap-4", theme.text.secondary)}>
                         <div><strong>Public Law:</strong> {data.statutory_notes.enactment.public_law}</div>
                         <div><strong>Date:</strong> {data.statutory_notes.enactment.date}</div>
                         <div><strong>Statute:</strong> {data.statutory_notes.enactment.stat}</div>
                     </div>
                 </div>

                 <div>
                     <h4 className={cn("text-sm font-bold mb-3", theme.text.primary)}>Amendments</h4>
                     <ul className="space-y-2">
                         {data.statutory_notes.amendments.map((am: any, i: number) => (
                             <li key={i} className={cn("text-xs flex items-center p-2 border rounded hover:opacity-80", theme.surfaceHighlight, theme.border.light)}>
                                 <span className={cn("font-medium mr-2", theme.text.primary)}>{am.date}</span>
                                 <span className={theme.text.secondary}>Effective: {am.effective_date}</span>
                             </li>
                         ))}
                     </ul>
                 </div>
             </div>
        )}

        {/* Advisory Notes */}
        {activeTab === 'notes' && data.advisory_committee_notes && (
            <div className="space-y-8 animate-fade-in">
                {Object.entries(data.advisory_committee_notes).map(([sectionKey, notes]: [string, any]) => (
                    <div key={sectionKey}>
                        <h3 className={cn("text-sm font-bold uppercase tracking-wider border-b pb-2 mb-4", theme.text.primary, theme.border.default)}>{sectionKey.replace(/_/g, ' ')}</h3>
                        <div className="space-y-6">
                            {Object.entries(notes).map(([noteKey, note]: [string, any]) => (
                                <div key={noteKey} className={cn("pl-4 border-l-2", theme.primary.border)}>
                                    <h4 className={cn("text-xs font-bold mb-1 uppercase", theme.primary.text)}>{noteKey.replace(/_/g, ' ')}</h4>
                                    {note.topic && <p className={cn("text-xs font-medium mb-1 italic", theme.text.secondary)}>{note.topic}</p>}
                                    <p className={cn("text-xs leading-relaxed text-justify", theme.text.secondary)}>{note.summary}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex h-full rounded-lg border shadow-sm overflow-hidden", theme.surface, theme.border.default)}>
        {/* Sidebar: Table of Contents */}
        <div className={cn("w-80 border-r flex flex-col bg-slate-50/50", theme.border.default)}>
            <div className={cn("p-4 border-b", theme.border.default)}>
                <h3 className={cn("font-bold text-sm uppercase tracking-wide mb-3", theme.text.secondary)}>Table of Contents</h3>
                <div className="relative">
                    {isPending ? (
                        <Loader2 className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin", theme.text.tertiary)}/>
                    ) : (
                        <Search className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5", theme.text.tertiary)}/>
                    )}
                    <input 
                        className={cn("w-full pl-8 pr-3 py-1.5 text-xs border rounded-md outline-none focus:ring-1 focus:ring-blue-500", theme.surface, theme.border.default, theme.text.primary)}
                        placeholder="Search rules (e.g. '201')..."
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
            <div className={cn("flex-1 overflow-y-auto p-2", isPending ? "opacity-50" : "")}>
                {renderTree(displayHierarchy)}
            </div>
        </div>

        {/* Content Area */}
        <div className={cn("flex-1 flex flex-col relative overflow-hidden", theme.surface)}>
            {selectedRule ? (
                <>
                    <div className={cn("p-6 border-b flex justify-between items-start shrink-0", theme.border.default)}>
                        <div>
                             <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-1 rounded", theme.surfaceHighlight, theme.text.secondary)}>{type} {selectedRule.code}</span>
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
                                {renderStructuredContent(selectedRule.structuredContent)}
                             </div>
                        </>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                            <div className={cn("prose max-w-none leading-loose font-serif text-base", mode === 'dark' ? "prose-invert" : "prose-slate")}>
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
