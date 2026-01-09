'use client';

import { useState } from 'react';
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
import { LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/shadcn/card';

interface CourtDate {
  id: string;
  court: string;
  caseNumber: string;
  hearingType: string;
  judge: string;
  dateTime: string;
  preparationStatus: 'not-started' | 'in-progress' | 'ready';
  notes?: string;
}

interface CourtDatesListProps {
  initialCourtDates: CourtDate[];
}

export function CourtDatesList({ initialCourtDates }: CourtDatesListProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [courtDates, setCourtDates] = useState<CourtDate[]>(initialCourtDates);
  const [view, setView] = useState<'list' | 'calendar'>('list');

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
            <p className="text-muted-foreground">Calendar view - Coming soon</p>
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
                    No upcoming court dates
                  </TableCell>
                </TableRow>
              ) : (
                courtDates.map((courtDate) => (
                  <TableRow key={courtDate.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {new Date(courtDate.dateTime).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {courtDate.court}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {courtDate.caseNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {courtDate.hearingType}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {courtDate.judge}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(courtDate.preparationStatus)}
                    </TableCell>
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
