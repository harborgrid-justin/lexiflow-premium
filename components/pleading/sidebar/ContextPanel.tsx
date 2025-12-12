import React, { useState } from 'react';
import { FileText, Plus, Search, BookOpen, Users, Scale, ChevronRight, Loader2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Button } from '../../common/Button';
import { useQuery } from '../../../services/queryClient';
import { DataService } from '../../../services/dataService';
import { STORES } from '../../../services/db';

interface ContextPanelProps {
  caseId: string;
  onInsertFact: (text: string) => void;
}

interface CaseFact {
  id: string;
  content: string;
  source: string;
  category: 'fact' | 'evidence' | 'witness' | 'legal';
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ caseId, onInsertFact }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('facts');

  // Fetch case data
  const { data: caseData, isLoading } = useQuery(
    [STORES.CASES, caseId],
    () => DataService.cases.getById(caseId)
  );

  // Mock facts for the context panel
  const facts: CaseFact[] = [
    { id: '1', content: 'Plaintiff filed initial complaint on January 15, 2024.', source: 'Docket Entry #1', category: 'fact' },
    { id: '2', content: 'Defendant served answer on February 20, 2024.', source: 'Docket Entry #5', category: 'fact' },
    { id: '3', content: 'Contract signed between parties on March 1, 2023.', source: 'Exhibit A', category: 'evidence' },
    { id: '4', content: 'Email correspondence confirming breach dated June 15, 2023.', source: 'Exhibit B', category: 'evidence' },
    { id: '5', content: 'John Smith - Eyewitness to contract signing.', source: 'Witness List', category: 'witness' },
    { id: '6', content: 'Breach of contract requires showing of damages. See Hadley v. Baxendale.', source: 'Legal Research', category: 'legal' },
  ];

  const filteredFacts = facts.filter(f => 
    f.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { id: 'facts', label: 'Key Facts', icon: FileText, items: filteredFacts.filter(f => f.category === 'fact') },
    { id: 'evidence', label: 'Evidence', icon: BookOpen, items: filteredFacts.filter(f => f.category === 'evidence') },
    { id: 'witnesses', label: 'Witnesses', icon: Users, items: filteredFacts.filter(f => f.category === 'witness') },
    { id: 'legal', label: 'Legal Standards', icon: Scale, items: filteredFacts.filter(f => f.category === 'legal') },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn("p-4 border-b", theme.border.default)}>
        <h3 className={cn("font-bold text-sm mb-3", theme.text.primary)}>Case Context</h3>
        <div className="relative">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
          <input
            type="text"
            placeholder="Search facts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-9 pr-3 py-2 text-sm rounded-md border",
              theme.surface.input, theme.border.default, theme.text.primary,
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            )}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {categories.map(category => (
          <div key={category.id} className="mb-2">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-md text-sm font-medium transition-colors",
                expandedCategory === category.id ? theme.surface.active : "hover:bg-slate-100 dark:hover:bg-slate-800",
                theme.text.primary
              )}
            >
              <span className="flex items-center gap-2">
                <category.icon className="h-4 w-4 text-blue-600" />
                {category.label}
                <span className={cn("text-xs px-1.5 py-0.5 rounded", theme.surface.highlight, theme.text.secondary)}>
                  {category.items.length}
                </span>
              </span>
              <ChevronRight className={cn("h-4 w-4 transition-transform", expandedCategory === category.id && "rotate-90")} />
            </button>

            {expandedCategory === category.id && (
              <div className="mt-1 space-y-1 pl-2">
                {category.items.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-2 rounded-md border text-xs group cursor-pointer transition-all",
                      theme.surface.default, theme.border.subtle,
                      "hover:border-blue-300 hover:shadow-sm"
                    )}
                  >
                    <p className={cn("mb-1 leading-relaxed", theme.text.primary)}>{item.content}</p>
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[10px]", theme.text.tertiary)}>{item.source}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Plus}
                        onClick={() => onInsertFact(item.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 text-[10px]"
                      >
                        Insert
                      </Button>
                    </div>
                  </div>
                ))}
                {category.items.length === 0 && (
                  <p className={cn("text-xs italic p-2", theme.text.tertiary)}>No items found.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextPanel;
