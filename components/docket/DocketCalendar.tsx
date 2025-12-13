/**
 * DocketCalendar.tsx
 * 
 * Calendar view of docket deadlines with month navigation and daily
 * deadline indicators.
 * 
 * @module components/docket/DocketCalendar
 * @category Case Management - Docket
 */

// External Dependencies
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useQuery } from '../../services/queryClient';

// Internal Dependencies - Services & Utils
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { STORES } from '../../services/db';

// Types & Interfaces
import { DocketEntry } from '../../types';

export const DocketCalendar: React.FC = () => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Enterprise Data Access: Shared cache with DocketSheet
  const { data: entries = [] } = useQuery<DocketEntry[]>(
      [STORES.DOCKET, 'all'],
      DataService.docket.getAll
  );

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => i);

  // Extract all deadlines from docket entries
  const allDeadlines = entries.flatMap(entry => 
    entry.triggersDeadlines?.map(dl => ({
      ...dl,
      caseId: entry.caseId,
      entryTitle: entry.title
    })) || []
  );

  const getDeadlinesForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allDeadlines.filter(d => d.date === dateStr);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <div className={cn("flex flex-col h-full rounded-lg border shadow-sm overflow-hidden", theme.surface.default, theme.border.default)}>
      <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
            <Calendar className={cn("h-6 w-6", theme.primary.text)} />
          </div>
          <div>
            <h2 className={cn("text-lg font-bold", theme.text.primary)}>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <p className={cn("text-xs", theme.text.secondary)}>Automated deadlines from Docket filings</p>
          </div>
        </div>
        <div className={cn("flex gap-1 p-1 rounded-md border", theme.surface.default, theme.border.default)}>
          <button onClick={prevMonth} className={cn("p-1 rounded", theme.text.secondary, `hover:${theme.surface.highlight}`)}><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => setCurrentDate(new Date())} className={cn("px-3 text-sm font-medium rounded", theme.text.secondary, `hover:${theme.surface.highlight}`)}>Today</button>
          <button onClick={nextMonth} className={cn("p-1 rounded", theme.text.secondary, `hover:${theme.surface.highlight}`)}><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>

      <div className={cn("flex-1 p-px grid grid-cols-7 gap-px overflow-y-auto", theme.surface.highlight)}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={cn("p-2 text-center text-xs font-bold uppercase tracking-wider sticky top-0 z-10 border-b", theme.surface.highlight, theme.text.secondary, theme.border.default)}>
            {day}
          </div>
        ))}
        
        {paddingDays.map(i => (
          <div key={`pad-${i}`} className={cn("min-h-[120px] opacity-50", theme.surface.highlight)} />
        ))}

        {daysArray.map(day => {
          const deadlines = getDeadlinesForDay(day);
          const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
          
          return (
            <div key={day} className={cn("p-2 min-h-[120px] flex flex-col transition-colors group relative", theme.surface.default, `hover:${theme.surface.highlight}`, isToday && cn(theme.primary.light, "bg-opacity-50"))}>
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                  isToday ? cn(theme.primary.DEFAULT, theme.text.inverse, "shadow-md") : theme.text.primary
                )}>
                  {day}
                </span>
                {deadlines.length > 0 && <span className={cn("text-[10px] font-bold", theme.text.tertiary)}>{deadlines.length} events</span>}
              </div>
              
              <div className="space-y-1">
                {deadlines.map((dl, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "text-[10px] p-1.5 rounded border mb-1 cursor-pointer truncate transition-all hover:shadow-md",
                      dl.status === 'Satisfied' 
                        ? cn(theme.status.success.bg, theme.status.success.border, theme.status.success.text) 
                        : cn(theme.status.warning.bg, theme.status.warning.border, theme.status.warning.text)
                    )}
                    title={`${dl.title} - ${dl.caseId}`}
                  >
                    <div className="flex items-center gap-1 font-bold">
                        {dl.status === 'Satisfied' ? <CheckCircle2 className="h-3 w-3"/> : <AlertCircle className="h-3 w-3"/>}
                        {dl.title}
                    </div>
                    <div className="opacity-75 font-mono mt-0.5 truncate">{dl.caseId}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
