import { Button } from '@/components/ui/atoms/Button/Button';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { BookOpen, ChevronRight, FileText, Loader2, Plus, Scale, Search, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';
// ✅ Migrated to backend API (2025-12-21)
import { SEARCH_DEBOUNCE_MS } from '@/config/features/search.config';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { EvidenceRepository } from '@/services/data/repositories/EvidenceRepository';
import { CaseRepository } from '@/services/domain/CaseDomain';
import { DocketRepository } from '@/services/domain/DocketDomain';
import { DocketEntry } from '@/types';

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

  // Debounce search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  // Fetch case data
  const { data: caseData, isLoading: caseLoading } = useQuery(
    ['cases', caseId],
    async () => {
      const cases = DataService.cases as CaseRepository;
      return cases.getById(caseId);
    }
  );

  // Fetch evidence for the case
  const { data: evidence = [], isLoading: evidenceLoading } = useQuery<unknown[]>(
    ['evidence', caseId],
    async () => {
      const evidenceService = DataService.evidence as EvidenceRepository;
      return evidenceService.getByCaseId(caseId);
    }
  );

  // Fetch docket entries
  const { data: docketEntries = [], isLoading: docketLoading } = useQuery<DocketEntry[]>(
    ['docket', caseId],
    async () => {
      const docketService = DataService.docket as DocketRepository;
      return docketService.getByCaseId(caseId);
    }
  );

  const documentsLoading = false;

  // Transform real data into facts
  const facts: CaseFact[] = useMemo(() => {
    const allFacts: CaseFact[] = [];

    // Add docket entries as facts
    docketEntries.forEach((entry) => {
      const docketEntry = entry as DocketEntry;
      allFacts.push({
        id: docketEntry.id,
        content: `${docketEntry.title || docketEntry.description || 'Docket Entry'} - Filed on ${docketEntry.dateFiled ? new Date(docketEntry.dateFiled).toLocaleDateString() : 'N/A'}`,
        source: `Docket Entry #${docketEntry.sequenceNumber || docketEntry.id}`,
        category: 'fact'
      });
    });

    // Add evidence
    evidence.forEach((item) => {
      const evidenceItem = item as Record<string, unknown>;
      allFacts.push({
        id: String(evidenceItem.id || ''),
        content: String(evidenceItem.description || evidenceItem.title || 'Evidence item'),
        source: `Exhibit ${evidenceItem.exhibitNumber || evidenceItem.id}`,
        category: 'evidence'
      });
    });

    // Add case parties as witnesses
    if (caseData && typeof caseData === 'object' && 'parties' in caseData && Array.isArray(caseData.parties)) {
      caseData.parties.forEach((partyUnknown: unknown) => {
        const party = partyUnknown as Record<string, unknown>;
        allFacts.push({
          id: `party-${party.id || party.name}`,
          content: `${party.name} - ${party.role}`,
          source: 'Party List',
          category: 'witness'
        });
      });
    }

    // Legal standards - ready for Gemini legal research API integration
    // Future: Integrate with legal research database
    if (caseData && typeof caseData === 'object' && 'description' in caseData && caseData.description) {
      allFacts.push({
        id: 'legal-case-summary',
        content: String(caseData.description),
        source: 'Case Summary',
        category: 'legal'
      });
    }

    return allFacts;
  }, [docketEntries, evidence, caseData]);

  // Filter facts based on debounced search term
  const filteredFacts = useMemo(() => {
    if (!debouncedSearchTerm) return facts;

    const searchLower = debouncedSearchTerm.toLowerCase();
    return facts.filter(f =>
      f.content.toLowerCase().includes(searchLower) ||
      f.source.toLowerCase().includes(searchLower)
    );
  }, [facts, debouncedSearchTerm]);

  const isLoading = caseLoading || evidenceLoading || docketLoading || documentsLoading;

  // Memoize categories to prevent recalculation
  const categories = useMemo(() => [
    { id: 'facts', label: 'Key Facts', icon: FileText, items: filteredFacts.filter(f => f.category === 'fact') },
    { id: 'evidence', label: 'Evidence', icon: BookOpen, items: filteredFacts.filter(f => f.category === 'evidence') },
    { id: 'witnesses', label: 'Witnesses', icon: Users, items: filteredFacts.filter(f => f.category === 'witness') },
    { id: 'legal', label: 'Legal Standards', icon: Scale, items: filteredFacts.filter(f => f.category === 'legal') },
  ], [filteredFacts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className={cn("text-xs", theme.text.secondary)}>Loading case context...</p>
        </div>
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
