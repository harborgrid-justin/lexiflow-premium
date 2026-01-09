'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { DataService } from '@/services/data/dataService';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: string;
}

interface CaseTimelineProps {
  caseId: string;
}

export function CaseTimeline({ caseId }: CaseTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      try {
        // Fetch real docket entries or documents for this case
        const docs = (await DataService.documents.getAll() as unknown) as Array<{
          id: string;
          title: string;
          createdAt: string;
          type: string;
          metadata?: { caseId?: string };
        }>;

        const caseEvents = docs
          .filter(d => d.metadata?.caseId === caseId)
          .map(d => ({
            id: d.id,
            date: d.createdAt,
            title: d.title,
            description: `Document filed: ${d.type}`,
            type: d.type
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setEvents(caseEvents);
      } catch (e) {
        console.error("Failed to load timeline", e);
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, [caseId]);

  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>Recent events for this case</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 border-l-2 border-muted pl-4 ml-2">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events recorded yet.</p>
          ) : (
            events.map(event => (
              <div key={event.id} className="relative">
                <div className="absolute -left-5 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                <p className="text-xs text-muted-foreground mb-1">{new Date(event.date).toLocaleDateString()}</p>
                <h4 className="text-sm font-medium">{event.title}</h4>
                <p className="text-xs text-muted-foreground">{event.description}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
