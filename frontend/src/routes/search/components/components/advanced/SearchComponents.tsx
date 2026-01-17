import { Search, Tag, Calendar, Hash } from 'lucide-react';
import React from 'react';

import * as styles from './SearchComponents.styles';

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
  <div className={styles.categoryFilterContainer}>
    {categories.map(cat => (
      <button
        key={cat.id}
        onClick={() => onCategoryChange(cat.id)}
        className={styles.getCategoryButton(theme, activeCategory === cat.id)}
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
    className={styles.getSuggestionButton(theme, isSelected)}
  >
    {suggestion.icon || <Search className={styles.suggestionIcon} />}
    <span
      className={styles.getSuggestionText(theme)}
      dangerouslySetInnerHTML={{ __html: suggestion.highlightedText || suggestion.text }}
    />
  </button>
);
