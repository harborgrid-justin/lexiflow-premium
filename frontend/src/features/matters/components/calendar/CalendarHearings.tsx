/**
 * @module components/calendar/CalendarHearings
 * @category Calendar
 * @description Hearing schedule with courtroom and judge information.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect } from 'react';
import { MapPin, User, Clock, Gavel } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { Card } from '@/components/molecules/Card';
import { Badge } from '@/components/atoms/Badge';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { CalendarEventItem } from '@/types';

// ============================================================================
// COMPONENT
// ============================================================================

export const CalendarHearings: React.FC = () => {
  const { theme } = useTheme();
  
  // Enterprise Data Access
  const { data: eventsData = [] } = useQuery<CalendarEventItem[]>(
      ['calendar', 'all'],
      async () => {
        const result = await DataService.calendar.getEvents();
        return Array.isArray(result) ? result : [];
      }
  );

  // Ensure events is always an array
  const events = Array.isArray(eventsData) ? eventsData : [];

  const hearings = events.filter(e => e.type === 'hearing').map(e => ({
      id: e.id,
      title: e.title,
      case: e.description || 'Unassigned Matter',
      time: '09:00 AM', // Mock time if not in event model
      location: e.location || 'Courtroom 4B',
      judge: 'Presiding Judge'
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {hearings.map(h => (
        <Card key={h.id} noPadding className={cn("hover:border-blue-300 transition-colors", `hover:${theme.primary.border}`)}>
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <Badge variant="error" className="flex items-center gap-1">
                <Gavel className="h-3 w-3"/> Hearing
              </Badge>
              <span className={cn("text-xs font-mono flex items-center px-2 py-1 rounded", theme.surface.highlight, theme.text.secondary)}>
                <Clock className="h-3 w-3 mr-1.5"/> {h.time}
              </span>
            </div>
            
            <h4 className={cn("font-bold text-lg mb-1", theme.text.primary)}>{h.title}</h4>
            <p className={cn("font-medium text-sm mb-4", theme.primary.text)}>{h.case}</p>
            
            <div className={cn("space-y-2 pt-4 border-t", theme.border.default)}>
              <div className={cn("flex items-center text-sm", theme.text.secondary)}>
                <MapPin className={cn("h-4 w-4 mr-3", theme.text.tertiary)}/>
                {h.location}
              </div>
              <div className={cn("flex items-center text-sm", theme.text.secondary)}>
                <User className={cn("h-4 w-4 mr-3", theme.text.tertiary)}/>
                {h.judge}
              </div>
            </div>
          </div>
        </Card>
      ))}
      {hearings.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-400 border-2 border-dashed rounded-lg">
              No hearings scheduled.
          </div>
      )}
    </div>
  );
};

