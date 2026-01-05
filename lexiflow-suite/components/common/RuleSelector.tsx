
import React, { useState, useMemo, useDeferredValue } from 'react';
import { MOCK_RULES, LegalRule } from '../../data/mockRules.ts';
import { Book, Plus, X, Search } from 'lucide-react';

interface RuleSelectorProps {
  selectedRules: string[]; // Array of rule codes like "FRCP 26(f)"
  onRulesChange: (rules: string[]) => void;
  readOnly?: boolean;
}

export const RuleSelector: React.FC<RuleSelectorProps> = ({ selectedRules, onRulesChange, readOnly = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Guideline 4: Defer search term
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  const [isOpen, setIsOpen] = useState(false);

  const filteredRules = useMemo(() => {
    if (!deferredSearchTerm) return [];
    return MOCK_RULES.filter(r => 
      !selectedRules.includes(r.code) &&
      (r.code.toLowerCase().includes(deferredSearchTerm.toLowerCase()) || 
       r.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()))
    );
  }, [deferredSearchTerm, selectedRules]);

  const addRule = (code: string) => {
    onRulesChange([...selectedRules, code]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const removeRule = (code: string) => {
    if (readOnly) return;
    onRulesChange(selectedRules.filter(r => r !== code));
  };

  const getRuleDetails = (code: string) => MOCK_RULES.find(r => r.code === code);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedRules.map(code => {
          const rule = getRuleDetails(code);
          return (
            <div key={code} className="inline-flex items-center px-2 py-1 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700 group" title={rule?.name}>
              <Book className="h-3 w-3 mr-1 text-slate-400"/>
              <span className="font-medium mr-1">{code}</span>
              {!readOnly && (
                <button onClick={() => removeRule(code)} className="text-slate-400 hover:text-red-500 ml-1">
                  <X className="h-3 w-3"/>
                </button>
              )}
            </div>
          );
        })}
        {selectedRules.length === 0 && readOnly && <span className="text-xs text-slate-400 italic">No rules linked.</span>}
      </div>

      {!readOnly && (
        <div className="relative">
          <div className="flex items-center border border-slate-300 rounded-md bg-white focus-within:ring-1 focus-within:ring-blue-500">
            <Search className="h-4 w-4 ml-2 text-slate-400"/>
            <input 
              className="flex-1 px-2 py-2 text-sm outline-none bg-transparent"
              placeholder="Link rule (e.g. 'FRCP 12', 'Appeal')..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setIsOpen(true); }}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />
          </div>
          
          {isOpen && searchTerm && filteredRules.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
              {filteredRules.map(rule => (
                <div 
                  key={rule.id} 
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                  onClick={() => addRule(rule.code)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-800">{rule.code}</span>
                    <span className="text-[10px] uppercase bg-slate-100 text-slate-500 px-1 rounded">{rule.type}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{rule.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
