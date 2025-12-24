import React from 'react';
import { Search, Tag, Calendar, Hash } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SearchCategory } from './types';

interface CategoryFilterProps {
  activeCategory: SearchCategory;
  onCategoryChange: (category: SearchCategory) => void;
  theme: { text: { secondary: string; primary: string }; surface: { highlight: string } };
}

const categories: Array<{ id: SearchCategory; label: string; icon: React.ReactNode }> = [
  { id: 'all', label: 'All', icon: <Search className="h-3 w-3" /> },
  { id: 'cases', label: 'Cases', icon: <Hash className="h-3 w-3" /> },
  { id: 'documents', label: 'Docs', icon: <Calendar className="h-3 w-3" /> },
  { id: 'tags', label: 'Tags', icon: <Tag className="h-3 w-3" /> }
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ activeCategory, onCategoryChange, theme }) => (
  <div className="flex gap-1 px-2 py-1 border-b">
    {categories.map(cat => (
      <button
        key={cat.id}
        onClick={() => onCategoryChange(cat.id)}
        className={cn(
          "px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors",
          activeCategory === cat.id
            ? theme.surface.highlight
            : cn("hover:bg-slate-100", theme.text.secondary)
        )}
      >
        {cat.icon}
        {cat.label}
      </button>
    ))}
  </div>
);

interface SuggestionItemProps {
  suggestion: { text: string; highlightedText?: string; icon?: React.ReactNode };
  isSelected: boolean;
  onClick: () => void;
  theme: { text: { primary: string }; surface: { highlight: string } };
}

export const SuggestionItem: React.FC<SuggestionItemProps> = ({ suggestion, isSelected, onClick, theme }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors",
      isSelected && theme.surface.highlight
    )}
  >
    {suggestion.icon || <Search className="h-4 w-4 text-slate-400" />}
    <span
      className={cn("flex-1 text-sm", theme.text.primary)}
      dangerouslySetInnerHTML={{ __html: suggestion.highlightedText || suggestion.text }}
    />
  </button>
);
