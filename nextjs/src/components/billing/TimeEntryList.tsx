/**
 * TimeEntryList Component - Rebuilt with Shadcn UI
 * Display and filter time entries with bulk operations
 */

'use client';

import React, { useState } from 'react';
import { Link, Form } from 'react-router';
import { Clock, DollarSign, Filter, Check } from 'lucide-react';
import type { TimeEntry } from '@/types/financial';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/shadcn/table';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Label } from '@/components/ui/shadcn/label';

interface TimeEntryListProps {
  entries: TimeEntry[];
  filters?: any;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({ entries, filters }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(entries.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">Submitted</Badge>;
      case 'Approved':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">Approved</Badge>;
      case 'Billed':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">Billed</Badge>;
      case 'Unbilled':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300">Unbilled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalHours = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalAmount = entries.reduce((sum, e) => sum + e.total, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="font-medium text-foreground">{totalHours.toFixed(2)}</span> hours
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium text-foreground">${totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {showFilters && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <Form method="get">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
                <div className="space-y-2">
                  <Label>Case</Label>
                  <Select name="caseId" defaultValue={filters?.caseId || ''}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Cases" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Cases</SelectItem>
                      <SelectItem value="C-2024-001">Martinez v. TechCorp</SelectItem>
                      <SelectItem value="C-2024-112">OmniGlobal Merger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue={filters?.status || ''}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Billed">Billed</SelectItem>
                      <SelectItem value="Unbilled">Unbilled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Billable</Label>
                  <Select name="billable" defaultValue={filters?.billable || ''}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="true">Billable Only</SelectItem>
                      <SelectItem value="false">Non-Billable Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Apply Filters
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedIds.length} selected
          </span>
          <Form method="post" className="flex gap-2">
            <input type="hidden" name="ids" value={JSON.stringify(selectedIds)} />
            <Button
              type="submit"
              name="intent"
              value="approve-bulk"
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="h-4 w-4" />
              Approve Selected
            </Button>
          </Form>
        </div>
      )}

      {/* Entries Table */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={entries.length > 0 && selectedIds.length === entries.length}
                  onCheckedChange={(checked) => toggleAll(!!checked)}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Case</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Clock className="h-10 w-10 mb-2 opacity-20" />
                    <p>No time entries found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(entry.id)}
                    onCheckedChange={(checked) => toggleSelection(entry.id, !!checked)}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(entry.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {entry.caseId}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate" title={entry.description}>
                    {entry.description}
                  </div>
                  {entry.ledesCode && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      LEDES: {entry.ledesCode}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {entry.duration.toFixed(2)}
                </TableCell>
                <TableCell>
                  ${entry.rate}
                </TableCell>
                <TableCell className="font-medium">
                  ${entry.total.toLocaleString()}
                </TableCell>
                <TableCell>
                  {getStatusBadge(entry.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 items-center">
                    <Form method="post" className="inline-flex gap-2 items-center">
                      <input type="hidden" name="id" value={entry.id} />
                      {entry.status === 'Submitted' && (
                        <Button
                          type="submit"
                          name="intent"
                          value="approve"
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        asChild
                      >
                        <Link to={`/billing/time/${entry.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        type="submit"
                        name="intent"
                        value="delete"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          if (!confirm('Delete this time entry?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
