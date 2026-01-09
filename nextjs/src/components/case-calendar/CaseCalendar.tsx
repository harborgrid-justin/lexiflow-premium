'use client';

import { DataService } from '@/services/data/dataService';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';

interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  type: 'deadline' | 'milestone' | 'hearing';
  caseId: string;
}

interface CaseModel {
  id: string;
  title: string;
  deadline?: string;
  createdAt?: string;
  nextCourtDate?: string;
}

export default function CaseCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Use DataService to get case deadlines.
        // Explicitly casting response to expected minimal interface to ensure type safety without importing complex full models
        const cases = await DataService.cases.getAll() as unknown as CaseModel[];

        // Generate event stream from cases
        const mappedEvents: CalendarEvent[] = cases.flatMap((c) => {
          const evts: CalendarEvent[] = [];
          if (c.deadline) {
            evts.push({
              id: `${c.id}-dl`,
              title: `${c.title} Deadline`,
              startDate: c.deadline,
              type: 'deadline',
              caseId: c.id
            });
          }
          if (c.nextCourtDate) {
            evts.push({
              id: `${c.id}-ct`,
              title: `${c.title} Hearing`,
              startDate: c.nextCourtDate,
              type: 'hearing',
              caseId: c.id
            });
          }
          if (c.createdAt) {
            evts.push({
              id: `${c.id}-created`,
              title: `New Case: ${c.title}`,
              startDate: c.createdAt,
              type: 'milestone',
              caseId: c.id
            });
          }
          return evts;
        });

        // Filter events for the current month in a real app,
        // but here we just show all for demo simplicity or client-side filtering
        const filteredEvents = mappedEvents.filter(e => {
          const d = new Date(e.startDate);
          return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
        }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        setEvents(filteredEvents);
      } catch (e) {
        console.error("Failed to load calendar events", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentMonth]);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Case Calendar</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" className="min-w-35">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="space-y-4">
        {events.length === 0 && (
          <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-2">
            <p>No events for this month</p>
            <Button variant="link" onClick={() => setCurrentMonth(new Date())}>Return to Today</Button>
          </div>
        )}
        {events.map(ev => (
          <div key={ev.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-24 text-sm font-medium text-muted-foreground text-center bg-muted/20 p-2 rounded">
              {new Date(ev.startDate).toLocaleDateString()}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{ev.title}</h4>
            </div>
            <Badge
              variant={ev.type === 'deadline' ? 'destructive' : ev.type === 'hearing' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {ev.type}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
