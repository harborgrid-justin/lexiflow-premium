/**
 * CaseTimeline.tsx
 *
 * Chronological case activity view with list and story modes, type filtering,
 * and virtualized scrolling for large event histories.
 *
 * @module components/case-detail/CaseTimeline
 * @category Case Management - Timeline & Events
 */

import React from 'react';
import { BookOpen, Filter, List } from 'lucide-react';

import { VirtualList } from '@/shared/ui/organisms/VirtualList/VirtualList';
import { TimelineItem } from '@/shared/ui/molecules/TimelineItem/TimelineItem';
import { StoryModeTimeline } from './timeline/StoryModeTimeline';
import { useCaseTimeline } from '@/features/cases/hooks/useCaseTimeline';
import { cn } from '@/shared/lib/cn';
import { TimelineEvent } from '@/types';

interface CaseTimelineProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({ events, onEventClick }) => {
  const {
    viewMode,
    setViewMode,
    filterType,
    setFilterType,
    filteredEvents,
    getIcon,
    getColor,
    theme
  } = useCaseTimeline(events);

  const renderRow = (event: TimelineEvent, idx: number) => (
    <div key={event.id} className="h-[60px] px-4">
      <TimelineItem
        date={event.date}
        title={event.title}
        description={event.description}
        icon={getIcon(event.type)}
        colorClass={getColor(event.type)}
        onClick={onEventClick ? () => onEventClick(event) : undefined}
        isLast={idx === filteredEvents.length - 1}
      />
    </div>
  );

  return (
    <div className={cn("flex flex-col h-full overflow-hidden w-full", theme.surface.default)}>
      <div className={cn("p-4 border-b flex justify-between items-center shrink-0", theme.border.default, theme.surface.highlight)}>
        <div className="flex items-center gap-2">
          <h3 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.primary)}>Case Timeline</h3>
          <span className={cn("text-xs px-1.5 rounded-full", theme.surface.default, theme.border.default, theme.text.secondary, "border")}>{filteredEvents.length}</span>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className={cn("absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3", theme.text.tertiary)} />
            <select
              className={cn("pl-6 pr-2 py-1 text-xs border rounded bg-transparent outline-none appearance-none cursor-pointer", theme.border.default, theme.text.primary)}
              value={filterType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
              aria-label="Filter events by type"
            >
              <option value="All">All Types</option>
              <option value="milestone">Milestones</option>
              <option value="docket">Docket Entries</option>
              <option value="document">Documents</option>
              <option value="motion">Motions</option>
              <option value="hearing">Hearings</option>
              <option value="billing">Billing</option>
            </select>
          </div>

          <div className={cn("flex p-0.5 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded transition-all", viewMode === 'list' ? cn(theme.surface.default, "shadow", theme.primary.text) : theme.text.tertiary)}
              title="List View"
              aria-label="List View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('story')}
              className={cn("p-1.5 rounded transition-all", viewMode === 'story' ? cn(theme.surface.default, "shadow", theme.primary.text) : theme.text.tertiary)}
              title="Story Mode"
              aria-label="Story Mode"
            >
              <BookOpen className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-0 relative">
        {filteredEvents.length === 0 ? (
          <p className={cn("text-sm text-center italic py-4", theme.text.tertiary)}>No events found.</p>
        ) : (
          viewMode === 'story' ? (
            <div className="overflow-y-auto h-full custom-scrollbar p-4">
              <StoryModeTimeline events={filteredEvents} />
            </div>
          ) : (
            <VirtualList
              items={filteredEvents}
              height="100%"
              itemHeight={60}
              renderItem={renderRow}
            />
          )
        )}
      </div>
    </div>
  );
};
