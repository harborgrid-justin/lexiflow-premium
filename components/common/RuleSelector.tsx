
import React, { useState } from 'react';
import { LegalRule } from '../../types';
import { RuleService } from '../../services/ruleService';
import { Book, X, Search, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';
import { useDebounce } from '../../hooks/useDebounce';

interface RuleSelectorProps {
  selectedRules: string[]; // Array of rule codes like "FRCP 26(f)"
  onRulesChange: (rules: string[]) => void;
  readOnly?: boolean;
}

export const RuleSelector: React.FC<RuleSelectorProps> = ({ selectedRules, onRulesChange, readOnly = false }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Use Query for caching search results
  const { data: availableRules = [], isLoading } = useQuery<LegalRule[]>(
      ['rules', 'search', debouncedSearch],
      () => RuleService.search(debouncedSearch),
      { enabled: !!debouncedSearch }
  );

  const addRule = (code: string) => {
    onRulesChange([...selectedRules, code]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const removeRule = (code: string) => {
    if (readOnly) return;
    onRulesChange(selectedRules.filter(r => r !== code));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedRules.map(code => {
          return (
            <div key={code} className={cn("inline-flex items-center px-2 py-1 rounded border text-xs cursor-default group", theme.surfaceHighlight, theme.border.default, theme.text.primary)}>
              <Book className={cn("h-3 w-3 mr-1", theme.text.tertiary)}/>
              <span className="font-medium mr-1">{code}</span>
              {!readOnly && (
                <button onClick={() => removeRule(code)} className={cn("ml-1 hover:text-red-500", theme.text.tertiary)}>
                  <X className="h-3 w-3"/>
                </button>
              )}
            </div>
          );
        })}
        {selectedRules.length === 0 && readOnly && <span className={cn("text-xs italic", theme.text.tertiary)}>No rules linked.</span>}
      </div>

      {!readOnly && (
        <div className="relative">
          <div className={cn("flex items-center border rounded-md transition-shadow focus-within:ring-1 focus-within:ring-blue-500", theme.surface, theme.border.default)}>
            <Search className={cn("h-4 w-4 ml-2", theme.text.tertiary)}/>
            <input 
              className={cn("flex-1 px-2 py-2 text-sm outline-none bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500", theme.text.primary)}
              placeholder="Search rules (e.g. 'FRCP 12')..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setIsOpen(true); }}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-600"/>}
          </div>
          
          {isOpen && searchTerm && (
            <div className={cn("absolute top-full left-0 right-0 mt-1 border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto", theme.surface, theme.border.default)}>
              {availableRules.length > 0 ? (
                availableRules.filter(r => !selectedRules.includes(r.code)).map(rule => (
                  <div 
                    key={rule.id} 
                    className={cn("px-3 py-2 cursor-pointer border-b last:border-0 group transition-colors", theme.border.light, `hover:${theme.surfaceHighlight}`)}
                    onClick={() => addRule(rule.code)}
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={cn("font-bold text-sm flex items-center", theme.text.primary)}>
                        <Book className="h-3 w-3 mr-1.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"/>
                        {rule.code}
                      </span>
                      <span className={cn("text-[10px] uppercase px-1.5 py-0.5 rounded border", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>{rule.type}</span>
                    </div>
                    <p className={cn("text-xs truncate pl-4", theme.text.secondary)}>{rule.name}</p>
                    {rule.summary && <p className={cn("text-[10px] truncate pl-4 mt-0.5 italic", theme.text.tertiary)}>{rule.summary}</p>}
                  </div>
                ))
              ) : (
                <div className={cn("p-3 text-center text-xs", theme.text.tertiary)}>
                  {!isLoading ? 'No matching rules found.' : 'Searching...'} <br/>
                  {!isLoading && <span className="text-[10px]">Go to Jurisdiction Manager to add new rules.</span>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
