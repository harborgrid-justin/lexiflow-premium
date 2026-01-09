'use client';

import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn/table';
import { Badge } from '@/components/ui/shadcn/badge';

export interface Deadline {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  caseId?: string;
  caseName?: string;
  type: 'filing' | 'hearing' | 'meeting' | 'milestone' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'completed' | 'overdue';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface DeadlinesListProps {
  deadlines: Deadline[];
  maxItems?: number;
  showCompleted?: boolean;
}

export function DeadlinesList({
  deadlines,
  maxItems = 10,
}: DeadlinesListProps) {

  const displayDeadlines = deadlines.slice(0, maxItems);

  if (displayDeadlines.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No upcoming deadlines</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayDeadlines.map((deadline) => {
            const date = typeof deadline.date === 'string' ? new Date(deadline.date) : deadline.date;
            return (
              <TableRow key={deadline.id}>
                <TableCell>
                  <div className="flex flex-col items-center justify-center border rounded w-10 h-10 bg-muted/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{format(date, 'MMM')}</span>
                    <span className="text-lg font-bold leading-none">{format(date, 'd')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{deadline.title}</p>
                    {deadline.caseName && <p className="text-xs text-muted-foreground">{deadline.caseName}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{deadline.type}</Badge>
                </TableCell>
                <TableCell>
                  {deadline.computedStatus === 'overdue' ? (
                    <Badge variant="destructive" className="gap-1"><AlertCircle size={10} /> Overdue</Badge>
                  ) : deadline.status === 'completed' ? (
                    <Badge variant="secondary" className="gap-1 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"><CheckCircle2 size={10} /> Done</Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1"><Clock size={10} /> Pending</Badge>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
}
