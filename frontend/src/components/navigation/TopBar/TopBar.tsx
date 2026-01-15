import { AppHeader } from '@/components/organisms/AppHeader';
import { IntentResult } from '@/types/intelligence';
import { memo, useState } from 'react';

export interface TopBarProps {
  onSearch: (query: string) => void;
  onNeuralCommand: (intent: IntentResult) => void;
  onResultClick: (result: unknown) => void;
  onToggleSidebar?: () => void;
}

export const TopBar = memo<TopBarProps>(({
  onSearch,
  onNeuralCommand,
  onResultClick,
  onToggleSidebar
}) => {
  const [query, setQuery] = useState('');

  return (
    <AppHeader
      globalSearch={query}
      setGlobalSearch={setQuery}
      onGlobalSearch={(e) => {
        if (e.key === 'Enter') {
          onSearch(query);
        }
      }}
      onToggleSidebar={onToggleSidebar || (() => { })}
      currentUser={undefined}
      onSwitchUser={() => { }}
      onNeuralCommand={onNeuralCommand}
      onSearchResultClick={onResultClick}
    />
  );
});

TopBar.displayName = 'TopBar';
