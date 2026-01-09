'use client';

/**
 * @module components/common/RuleSelector
 * @category Common
 * @description Legal rules selector using Shadcn.
 */

import { Book, X } from 'lucide-react';
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { Input } from '@/components/ui/shadcn/input';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface RuleSelectorProps {
  selectedRules: string[]; // Array of rule codes like "FRCP 26(f)"
  onRulesChange: (rules: string[]) => void;
  readOnly?: boolean;
}

export const RuleSelector: React.FC<RuleSelectorProps> = ({ selectedRules, onRulesChange, readOnly = false }) => {
  const [inputValue, setInputValue] = React.useState('');

  const addRule = () => {
    if (!inputValue.trim()) return;
    if (!selectedRules.includes(inputValue.trim())) {
      onRulesChange([...selectedRules, inputValue.trim()]);
    }
    setInputValue('');
  };

  const removeRule = (code: string) => {
    if (readOnly) return;
    onRulesChange(selectedRules.filter(r => r !== code));
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap gap-2">
        {selectedRules.map(code => {
          return (
            <Badge key={code} variant="secondary" className="flex items-center gap-1">
              <Book className="h-3 w-3" />
              <span>{code}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeRule(code)}
                  className="ml-1 hover:text-destructive focus:outline-none"
                  aria-label={`Remove rule ${code}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          );
        })}
        {selectedRules.length === 0 && readOnly && <span className="text-xs italic text-muted-foreground">No rules linked.</span>}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <Input
            placeholder="Type rule code (e.g. FRCP 26) and press Enter"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addRule();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addRule}>Add</Button>
        </div>
      )}
    </div>
  );
};
