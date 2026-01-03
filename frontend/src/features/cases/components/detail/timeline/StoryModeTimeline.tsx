/**
 * StoryModeTimeline.tsx
 * 
 * Narrative-style timeline displaying only significant case milestones
 * with visual flow and phase transitions.
 * 
 * @module components/case-detail/timeline/StoryModeTimeline
 * @category Case Management - Timeline
 */

// External Dependencies
import React from 'react';
import { Calendar, Flag, Gavel, FileText, ArrowRight } from 'lucide-react';

// Internal Dependencies - Components

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Types & Interfaces
import { TimelineEvent } from '@/types';

interface StoryModeTimelineProps {
  events: TimelineEvent[];
}

export const StoryModeTimeline: React.FC<StoryModeTimelineProps> = ({ events }) => {
  const { theme } = useTheme();

  // Filter for significant events only for the "Story"
  const storyEvents = events.filter(e => 
    e.type === 'milestone' || e.type === 'hearing' || e.type === 'motion' || (e.type === 'document' && e.description?.includes('Key'))
  );

  const getIcon = (type: string) => {
    switch(type) {
        case 'milestone': return <Flag className="h-5 w-5 text-white"/>;
        case 'hearing': return <Gavel className="h-5 w-5 text-white"/>;
        case 'motion': return <FileText className="h-5 w-5 text-white"/>;
        default: return <Calendar className="h-5 w-5 text-white"/>;
    }
  };

  const getColor = (type: string) => {
      switch(type) {
          case 'milestone': return theme.action.primary.bg;
          case 'hearing': return 'bg-red-600';
          case 'motion': return theme.action.primary.bg;
          default: return 'bg-slate-500';
      }
  };

  return (
    <div className="space-y-8 py-8">
        <div className="text-center mb-8">
            <h3 className={cn("text-2xl font-bold", theme.text.primary)}>Case Narrative</h3>
            <p className={cn("text-sm", theme.text.secondary)}>Key events and strategic milestones</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
            {/* Central Line */}
            <div className={cn("absolute left-1/2 top-0 bottom-0 w-1 -ml-0.5", theme.border.default, "bg-slate-200 dark:bg-slate-700")}></div>

            {storyEvents.map((evt, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                    <div key={evt.id} className={cn("relative flex items-center justify-between mb-12 w-full", isLeft ? "flex-row-reverse" : "")}>
                        {/* Spacer */}
                        <div className="w-5/12"></div>
                        
                        {/* Dot */}
                        <div className={cn(
                            "absolute left-1/2 -ml-4 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10",
                            getColor(evt.type)
                        )}>
                            {getIcon(evt.type)}
                        </div>

                        {/* Card */}
                        <div className="w-5/12">
                            <div className={cn(
                                "p-5 rounded-xl border shadow-sm relative transition-transform hover:-translate-y-1",
                                theme.surface.default, theme.border.default
                            )}>
                                {/* Arrow */}
                                <div className={cn(
                                    "absolute top-6 w-3 h-3 rotate-45 border-l border-b",
                                    isLeft ? "-right-[7px] border-r border-t-0 border-l-0 border-b-0" : "-left-[7px]",
                                    theme.border.default,
                                    theme.surface.default
                                )}></div>
                                
                                <span className={cn("text-xs font-bold uppercase tracking-wider mb-1 block", getColor(evt.type).replace('bg-', 'text-'))}>
                                    {evt.date}
                                </span>
                                <h4 className={cn("font-bold text-lg mb-2", theme.text.primary)}>{evt.title}</h4>
                                <p className={cn("text-sm leading-relaxed", theme.text.secondary)}>
                                    {evt.description}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
            
            <div className="flex justify-center pt-4">
                <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-lg">
                    Trial Ready <ArrowRight className="h-4 w-4 ml-2"/>
                </div>
            </div>
        </div>
    </div>
  );
};
