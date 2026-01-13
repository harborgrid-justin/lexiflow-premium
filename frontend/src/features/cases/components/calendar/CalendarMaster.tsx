/**
 * @module components/calendar/CalendarMaster
 * @category Calendar
 * @description Master calendar with month and list views.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState } from 'react';
import { Briefcase, CheckSquare, Shield, AlertCircle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useCalendarView } from '@/hooks/useCalendarView';

// Components
import { CalendarToolbar } from '@/features/calendar/components/CalendarToolbar/CalendarToolbar';
import { CalendarGrid } from '@/features/calendar/components/CalendarGrid/CalendarGrid';
import { CalendarEvent } from '@/features/calendar/components/CalendarEvent/CalendarEvent';

// ============================================================================
// COMPONENT
// ============================================================================

export const CalendarMaster: React.FC = () => {
  const {
    currentMonth,
    changeMonth,
    goToToday,
    monthLabel,
    getEventsForDay
  } = useCalendarView();

  const [view, setView] = useState<'month' | 'list'>('month');

  const handlePrev = () => changeMonth(-1);
  const handleNext = () => changeMonth(1);

  const getEventIcon = (type: string) => {
      if (type === 'case') return <Briefcase className="h-3 w-3" />;
      if (type === 'compliance') return <Shield className="h-3 w-3" />;
      if (type === 'task') return <CheckSquare className="h-3 w-3" />;
      return <AlertCircle className="h-3 w-3" />;
  };

  const getEventVariant = (type: string, priority: string) => {
    if (priority === 'High' || priority === 'Critical') return 'critical';
    if (type === 'case') return 'info';
    if (type === 'compliance') return 'warning';
    return 'default';
  };

  const renderCell = (date: Date) => {
    const dayEvents = getEventsForDay(date.getDate());

    return (
      <>
        {dayEvents.map((evt, idx) => (
          <CalendarEvent 
            key={`${evt.id}-${idx}`}
            title={evt.title}
            variant={getEventVariant(evt.type, evt.priority as string)}
            icon={getEventIcon(evt.type)}
            onClick={() => alert(`Clicked event: ${evt.title}`)}
          />
        ))}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <CalendarToolbar 
        label={monthLabel}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={goToToday}
        view={view}
        onViewChange={setView}
      />

      <div className="flex-1 min-h-0">
        <CalendarGrid 
          currentDate={currentMonth}
          renderCell={renderCell}
          onDateClick={(date) => console.log('Clicked date', date)}
        />
      </div>
    </div>
  );
};
