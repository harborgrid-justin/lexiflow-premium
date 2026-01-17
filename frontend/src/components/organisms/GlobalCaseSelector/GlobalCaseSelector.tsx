import { Briefcase } from 'lucide-react';
import { useCallback } from 'react';

import { AutocompleteSelect } from '@/components/molecules/AutocompleteSelect/AutocompleteSelect';
import { useCaseContext } from '@/routes/cases/context-exports';
import { DataService } from '@/services/data/data-service.service';
import { type Case } from '@/types/case';

export function GlobalCaseSelector() {
  const { selectedCaseId, selectCase } = useCaseContext();

  const fetchCases = useCallback(async (query: string): Promise<Case[]> => {
    try {
      // Use backend search with pg_trgm optimizations
      return await DataService.cases.getAll({ search: query || undefined });
    } catch (error) {
      console.error("Failed to fetch cases", error);
      return [];
    }
  }, []);

  return (
    <div className="w-[280px]">
      <AutocompleteSelect
        queryKey={['global-case-search']}
        value={selectedCaseId}
        onChange={(val) => selectCase(val)}
        fetchFn={fetchCases}
        getLabel={(c) => c.title}
        getValue={(c) => c.id}
        placeholder="Select Active Case..."
        renderOption={(option, isHighlighted, _isSelected) => (
          <div className={`flex flex-col py-1 ${isHighlighted ? 'text-primary' : ''}`}>
            <div className="font-medium truncate">{option.title}</div>
            {option.caseNumber && (
              <div className="text-xs opacity-70 flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {option.caseNumber}
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};
