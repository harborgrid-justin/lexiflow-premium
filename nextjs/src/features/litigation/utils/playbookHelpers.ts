/**
 * playbookHelpers.ts
 * 
 * Utility functions for playbook library filtering and styling.
 * 
 * @module components/litigation/utils/playbookHelpers
 */

import { Playbook } from '@/api/types/mockLitigationPlaybooks';

/**
 * Returns CSS classes for difficulty level badge styling
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch(difficulty) {
    case 'Low': 
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Medium': 
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'High': 
      return 'text-purple-600 bg-purple-50 border-purple-200';
    default: 
      return 'text-slate-600';
  }
};

/**
 * Returns background color class for difficulty level
 */
export const getDifficultyBorderColor = (difficulty: string): string => {
  switch(difficulty) {
    case 'High': 
      return 'bg-purple-500';
    case 'Medium': 
      return 'bg-blue-500';
    case 'Low': 
      return 'bg-green-500';
    default: 
      return 'bg-slate-500';
  }
};

/**
 * Filters playbooks based on search term, category, and difficulty
 */
export const filterPlaybooks = (
  playbooks: Playbook[],
  searchTerm: string,
  selectedCategory: string,
  selectedDifficulty: string
): Playbook[] => {
  return playbooks.filter(pb => {
    const matchesSearch = 
      pb.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pb.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'All' || pb.category === selectedCategory;
    
    const matchesDifficulty = 
      selectedDifficulty === 'All' || pb.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
};

/**
 * Extracts unique categories from playbooks
 */
export const extractCategories = (playbooks: Playbook[]): string[] => {
  return ['All', ...Array.from(new Set(playbooks.map(p => p.category)))];
};
