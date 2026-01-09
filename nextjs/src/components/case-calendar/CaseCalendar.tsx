'use client';

import { DataService } from '@/services/data/dataService';
import { ChevronLeft, ChevronRight, Filter, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';

interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  type: string;
}

export default function CaseCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Use DataService to get case deadlines. If no specific calendar API, derive from cases
        const cases = await DataService.cases.getAll();

        // Generate event stream from cases (e.g. deadlines)
        const mappedEvents = cases.flatMap((c: unknown) => {
          const evts = [];
          if (c.deadline) evts.push({ id: `${c.id}-dl`, title: `${c.title} Deadline`, startDate: c.deadline, type: 'deadline' });
          if (c.createdAt) evts.push({ id: `${c.id}-created`, title: `New Case: ${c.title}`, startDate: c.createdAt, type: 'milestone' });
          return evts;
        });

        setEvents(mappedEvents);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentMonth]); // In real app, refetch based on range

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Case Calendar</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="space-y-4">
        {events.length === 0 && <div className="text-center text-muted-foreground p-8">No events for this month</div>}
        {events.map(ev => (
          <div key={ev.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-24 text-sm font-medium text-muted-foreground text-center">
              {new Date(ev.startDate).toLocaleDateString()}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{ev.title}</h4>
            </div>
            <Badge variant={ev.type === 'deadline' ? 'destructive' : 'default'}>{ev.type}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
