import { useState, useMemo } from 'react';
import { TimelineEvent } from '@/types';
import { useTheme } from '@/theme';
import { getEventIcon, getEventColor } from '../components/detail/timeline/utils';

export function useCaseTimeline(events: TimelineEvent[]) {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'list' | 'story'>('list');
  const [filterType, setFilterType] = useState<string>('All');

  const filteredEvents = useMemo(() => {
    return events.filter(e => filterType === 'All' || e.type === filterType);
  }, [events, filterType]);

  const getIcon = (type: string) => getEventIcon(type);
  const getColor = (type: string) => getEventColor(type, theme);

  return {
    viewMode,
    setViewMode,
    filterType,
    setFilterType,
    filteredEvents,
    getIcon,
    getColor,
    theme
  };
}
