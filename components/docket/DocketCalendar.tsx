
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { DocketEntry } from '../../types';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

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
    <div className={cn("flex flex-col h-full rounded-lg border shadow-sm overflow-hidden", theme.surface, theme.border.default)}>
      <div className={cn("p-4 border-b flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-lg border shadow-sm bg-white", theme.border.default)}>
            <Calendar className={cn("h-6 w-6", theme.primary.text)} />
          </div>
          <div>
            <h2 className={cn("text-lg font-bold", theme.text.primary)}>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <p className={cn("text-xs", theme.text.secondary)}>Automated deadlines from Docket filings</p>
          </div>
        </div>
        <div className="flex gap-1 bg-white p-1 rounded-md border border-slate-200">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft className="h-5 w-5 text-slate-600" /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded">Today</button>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="h-5 w-5 text-slate-600" /></button>
        </div>
      </div>

      <div className="flex-1 bg-slate-100 p-px grid grid-cols-7 gap-px overflow-y-auto">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 border-b">
            {day}
          </div>
        ))}
        
        {paddingDays.map(i => (
          <div key={`pad-${i}`} className="bg-slate-50 min-h-[120px] opacity-50" />
        ))}

        {daysArray.map(day => {
          const deadlines = getDeadlinesForDay(day);
          const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
          
          return (
            <div key={day} className={cn("bg-white p-2 min-h-[120px] group transition-colors hover:bg-blue-50/30", isToday && "bg-blue-50/50")}>
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full",
                  isToday ? "bg-blue-600 text-white shadow-sm" : "text-slate-700"
                )}>
                  {day}
                </span>
                {deadlines.length > 0 && <span className="text-[10px] font-bold text-slate-400">{deadlines.length} events</span>}
              </div>
              
              <div className="space-y-1">
                {deadlines.map((dl, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "text-[10px] p-1.5 rounded border mb-1 cursor-pointer truncate transition-all hover:shadow-md",
                      dl.status === 'Satisfied' 
                        ? "bg-green-50 border-green-200 text-green-700" 
                        : "bg-amber-50 border-amber-200 text-amber-700"
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
