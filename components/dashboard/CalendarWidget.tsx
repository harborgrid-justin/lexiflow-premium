import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'meeting' | 'deadline' | 'hearing' | 'reminder' | 'other';
  color?: string;
}

export interface CalendarWidgetProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

const eventTypeColors = {
  meeting: 'bg-blue-500',
  deadline: 'bg-red-500',
  hearing: 'bg-purple-500',
  reminder: 'bg-yellow-500',
  other: 'bg-gray-500',
};

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  events = [],
  onDateClick,
  onEventClick,
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const hasEvents = (day: number) => {
    return events.some((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate.getDate()) : [];

  return (
    <div className={className}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          {days.map((day) => (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDateClick(day)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-colors ${
                isToday(day)
                  ? 'bg-blue-600 text-white font-bold'
                  : isSelected(day)
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              aria-label={`${day} ${monthNames[currentDate.getMonth()]}`}
            >
              {day}
              {hasEvents(day) && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {getEventsForDay(day).slice(0, 3).map((event, idx) => (
                    <div
                      key={idx}
                      className={`w-1 h-1 rounded-full ${
                        event.color || eventTypeColors[event.type]
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Date Events */}
      <AnimatePresence mode="wait">
        {selectedDateEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Events on {selectedDate?.toLocaleDateString()}
              </h4>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedDateEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onEventClick?.(event)}
                  className={`p-2 rounded-lg border-l-4 ${
                    event.color || eventTypeColors[event.type]
                  } bg-gray-50 dark:bg-gray-700/50 ${
                    onEventClick ? 'cursor-pointer hover:shadow-md' : ''
                  } transition-shadow`}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.title}
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {event.time}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Events */}
      {!selectedDate && events.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Upcoming Events
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {events
              .filter((event) => new Date(event.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3)
              .map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onEventClick?.(event)}
                  className={`p-2 rounded-lg border-l-4 ${
                    event.color || eventTypeColors[event.type]
                  } bg-gray-50 dark:bg-gray-700/50 ${
                    onEventClick ? 'cursor-pointer hover:shadow-md' : ''
                  } transition-shadow`}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(event.date).toLocaleDateString()}
                    {event.time && ` at ${event.time}`}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
