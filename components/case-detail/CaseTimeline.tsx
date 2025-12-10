
import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import { FileText, CheckCircle, DollarSign, Flag, Briefcase, Gavel, Calendar, BookOpen, List, Filter } from 'lucide-react';
import { TimelineItem } from '../common/TimelineItem';
import { StoryModeTimeline } from './timeline/StoryModeTimeline';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { VirtualList } from '../common/VirtualList';

interface CaseTimelineProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({ events, onEventClick }) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'list' | 'story'>('list');
  const [filterType, setFilterType] = useState<string>('All');

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-3 w-3" />;
      case 'task': return <CheckCircle className="h-3 w-3" />;
      case 'billing': return <DollarSign className="h-3 w-3" />;
      case 'milestone': return <Flag className="h-3 w-3" />;
      case 'motion': return <Gavel className="h-3 w-3" />;
      case 'hearing': return <Calendar className="h-3 w-3" />;
      default: return <Briefcase className="h-3 w-3" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-500 border-blue-500';
      case 'task': return 'bg-green-500 border-green-500';
      case 'billing': return 'bg-amber-500 border-amber-500';
      case 'milestone': return 'bg-purple-600 border-purple-600';
      case 'motion': return 'bg-indigo-600 border-indigo-600';
      case 'hearing': return 'bg-red-500 border-red-500';
      default: return 'bg-slate-400 border-slate-400';
    }
  };

  const filteredEvents = events.filter(e => filterType === 'All' || e.type === filterType);

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
            <span className={cn("text-xs bg-slate-200 text-slate-600 px-1.5 rounded-full")}>{filteredEvents.length}</span>
        </div>
        
        <div className="flex gap-2">
            <div className="relative">
                <Filter className={cn("absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3", theme.text.tertiary)} />
                <select 
                    className={cn("pl-6 pr-2 py-1 text-xs border rounded bg-transparent outline-none appearance-none", theme.border.default, theme.text.primary)}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="All">All Types</option>
                    <option value="milestone">Milestones</option>
                    <option value="document">Documents</option>
                    <option value="motion">Motions</option>
                    <option value="hearing">Hearings</option>
                    <option value="billing">Billing</option>
                </select>
            </div>
            
            <div className="flex bg-slate-200/50 p-0.5 rounded-lg">
                <button
                    onClick={() => setViewMode('list')}
                    className={cn("p-1.5 rounded transition-all", viewMode === 'list' ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700")}
                    title="List View"
                >
                    <List className="h-4 w-4"/>
                </button>
                <button
                    onClick={() => setViewMode('story')}
                    className={cn("p-1.5 rounded transition-all", viewMode === 'story' ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700")}
                    title="Story Mode"
                >
                    <BookOpen className="h-4 w-4"/>
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
