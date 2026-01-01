import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import React from 'react';

interface LedgerTabsProps {
  activeTab: 'operating' | 'trust';
  onTabChange: (tab: 'operating' | 'trust') => void;
}

export const LedgerTabs: React.FC<LedgerTabsProps> = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();

  return (
    <div className={cn('flex p-1 rounded-lg border shadow-sm', theme.surface.default, theme.border.default)}>
      <button
        onClick={() => onTabChange('operating')}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-md transition-all',
          activeTab === 'operating'
            ? cn(theme.primary.DEFAULT, theme.text.inverse)
            : cn(theme.text.secondary, `hover:${theme.surface.highlight}`)
        )}
      >
        Operating Expenses
      </button>
      <button
        onClick={() => onTabChange('trust')}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-md transition-all',
          activeTab === 'trust'
            ? 'bg-green-600 text-white shadow'
            : cn(theme.text.secondary, `hover:${theme.surface.highlight}`)
        )}
      >
        Trust (IOLTA)
      </button>
    </div>
  );
};
