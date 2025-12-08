
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  suggestions?: string[];
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onAdd, onRemove, suggestions = [], placeholder = "Add tag..." }) => {
  const { theme } = useTheme();
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Stop form submission
      if (input.trim()) {
        onAdd(input.trim());
        setInput('');
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", theme.primary.light, theme.primary.text, theme.primary.border)}>
            {tag}
            <button onClick={() => onRemove(tag)} className={cn("ml-1.5 focus:outline-none hover:opacity-75", theme.primary.text)}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors", theme.surface, theme.border.default, theme.text.primary)}
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Plus className={cn("absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestions.filter(s => !tags.includes(s)).slice(0, 5).map(s => (
            <button 
              key={s} 
              type="button"
              onClick={() => onAdd(s)} 
              className={cn("text-xs px-2 py-1 border rounded transition-colors", theme.surface, theme.border.default, theme.text.secondary, `hover:${theme.surfaceHighlight}`)}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
