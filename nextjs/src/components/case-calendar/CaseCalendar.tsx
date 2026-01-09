'use client';

import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';

// Mock types since we might not have the API available at build time
interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  eventType: 'HEARING' | 'DEADLINE' | 'MEETING' | 'TASK' | string;
  description?: string;
}

type CalendarView = 'month' | 'week' | 'day' | 'agenda';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CaseCalendar() {
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulated fetch
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from API
        // const data = await workflowApi.calendar.getAll(...);
        setEvents([]);
      } catch (e) {
        console.error("Failed to load calendar events", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [currentDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);

  const renderCalendarGrid = () => {
    const grid = [];
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="h-32 bg-secondary/20 border-r border-b" />);
    }

    // Days of current month
    for (let i = 1; i <= days; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isToday = i === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

      const dayEvents = events.filter(e => {
        const d = new Date(e.startDate);
        return d.getDate() === i && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
      });

      grid.push(
        <div key={i} className="h-32 bg-background border-r border-b p-2 hover:bg-muted/50 transition-colors cursor-pointer group relative overflow-hidden">
          <span className={`text-sm font-medium ${isToday
            ? 'bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full'
            : 'text-foreground'
            }`}>
            {i}
          </span>
          <div className="mt-2 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
            {dayEvents.map(ev => {
              let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";

              if (ev.eventType === 'DEADLINE') {
                variant = "destructive";
              }
              if (ev.eventType === 'MEETING') {
                variant = "outline";
              }

              return (
                <div key={ev.id} title={ev.title}>
                  <Badge variant={variant} className="w-full justify-start font-normal truncate text-[10px] px-1 py-0">
                    {ev.title}
                  </Badge>
                </div>
              );
            })}
          </div>
          <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Case Calendar</h1>
          <p className="text-muted-foreground">Schedule and Deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button variant="link" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground">Hearings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-muted-foreground">Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-muted-foreground">Meetings</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="flex-1 overflow-hidden flex flex-col min-h-150">
        <div className="grid grid-cols-7 border-b">
          {DAYS.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-muted-foreground bg-muted/30">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {renderCalendarGrid()}
        </div>
      </Card>
    </div>
  );
}
