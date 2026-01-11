import { useCaseContext } from '@/contexts/case/CaseContext';
import { DataService } from '@/services/data/dataService';
import { AutocompleteSelect } from '@/shared/ui/molecules/AutocompleteSelect/AutocompleteSelect';
import { Case } from '@/types/case';
import { Briefcase } from 'lucide-react';
import React, { useCallback } from 'react';

export const GlobalCaseSelector: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { selectedCaseId, selectCase } = useCaseContext();

  const fetchCases = useCallback(async (query: string): Promise<Case[]> => {
    try {
      // Use backend search with pg_trgm optimizations
      const cases = await DataService.cases.getAll({ search: query || undefined });
      return cases;
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
