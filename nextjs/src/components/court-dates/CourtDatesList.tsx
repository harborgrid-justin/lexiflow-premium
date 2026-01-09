'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn/table';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { LayoutList, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { DataService } from '@/services/data/dataService';

interface CourtDate {
  id: string;
  court: string;
  caseNumber: string;
  hearingType: string;
  judge: string;
  dateTime: string;
  preparationStatus: 'not-started' | 'in-progress' | 'ready';
  notes?: string;
  title: string; // derived from event title
}

interface CourtDatesListProps {
  initialCourtDates?: CourtDate[];
}

export function CourtDatesList({ initialCourtDates }: CourtDatesListProps) {
  const [courtDates, setCourtDates] = useState<CourtDate[]>(initialCourtDates || []);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(!initialCourtDates);

  useEffect(() => {
    // If no initial data or if we want to ensure freshness, we can fetch
    if (!initialCourtDates || initialCourtDates.length === 0) {
      const fetchDates = async () => {
        setLoading(true);
        try {
          // Fetch from Calendar service
          const events = await DataService.calendar.getAll();
          // Filter for "Court" type events or similar logic
          const courtEvents = events
            .filter((e: unknown) => e.type === 'Court' || e.type === 'Hearing')
            .map((e: unknown) => ({
              id: e.id,
              court: e.location || 'TBD',
              caseNumber: e.caseId || 'N/A',
              hearingType: e.subType || 'Hearing',
              judge: e.metadata?.judge || 'Assigned Judge',
              dateTime: e.startTime,
              preparationStatus: e.status === 'Scheduled' ? 'not-started' : 'in-progress',
              title: e.title
            }));
          setCourtDates(courtEvents);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDates();
    } else {
      setLoading(false);
    }
  }, [initialCourtDates]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-100">Ready</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100">In Progress</Badge>;
      case 'not-started':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Court Dates</h1>
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            size="sm"
            className="gap-2"
          >
            <LayoutList size={16} />
            List
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => setView('calendar')}
            size="sm"
            className="gap-2"
          >
            <CalendarIcon size={16} />
            Calendar
          </Button>
        </div>
      </div>

      {view === 'calendar' ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Calendar view - Connected to Docket Service</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Court</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Hearing Type</TableHead>
                <TableHead>Judge</TableHead>
                <TableHead>Preparation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courtDates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No upcoming court dates found.
                  </TableCell>
                </TableRow>
              ) : (
                courtDates.map((date) => (
                  <TableRow key={date.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(date.dateTime).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(date.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{date.court}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{date.title}</span>
                        <span className="text-xs text-muted-foreground">{date.caseNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>{date.hearingType}</TableCell>
                    <TableCell>{date.judge}</TableCell>
                    <TableCell>{getStatusBadge(date.preparationStatus)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
