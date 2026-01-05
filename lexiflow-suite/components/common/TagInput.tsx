
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  suggestions?: string[];
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onAdd, onRemove, suggestions = [], placeholder = "Add tag..." }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
            {tag}
            <button onClick={() => onRemove(tag)} className="ml-1.5 hover:text-blue-900 focus:outline-none">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Plus className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestions.filter(s => !tags.includes(s)).slice(0, 5).map(s => (
            <button 
              key={s} 
              onClick={() => onAdd(s)} 
              className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 text-slate-600 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
