/**
 * InvoiceList Component
 * Display and filter invoices with status tracking
 */

'use client';

import React, { useState } from 'react';
import { Link, Form } from 'react-router';
import { FileText, Filter, Send } from 'lucide-react';
import type { Invoice } from '@/types/financial';

import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn/table';
import { Card, CardContent } from '@/components/ui/shadcn/card';

interface InvoiceListProps {
  invoices: Invoice[];
  filters?: any;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, filters }) => {
  const [showFilters, setShowFilters] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles = {
      Draft: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
      Sent: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      Paid: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
      Overdue: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
      Cancelled: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
      'Partially Paid': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    };

    return (
      <Badge
        variant="outline"
        className={`${styles[status as keyof typeof styles] || styles.Draft} font-medium`}
      >
        {status}
      </Badge>
    );
  };

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
      </div>

      {showFilters && (
        <Card className="bg-muted/50 border-muted">
          <CardContent className="p-4">
            <Form method="get">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="caseId">Case</Label>
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
                  <Label htmlFor="clientId">Client</Label>
                  <Input
                    type="text"
                    name="clientId"
                    id="clientId"
                    defaultValue={filters?.clientId || ''}
                    placeholder="Client ID or name"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={filters?.status || ''}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
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

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Matter</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  <Link
                    to={`/billing/invoices/${invoice.id}`}
                    className="text-primary hover:underline"
                  >
                    {invoice.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate" title={invoice.matterDescription}>
                    {invoice.matterDescription}
                  </div>
                </TableCell>
                <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">
                  ${invoice.totalAmount.toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">
                  ${invoice.balanceDue.toLocaleString()}
                </TableCell>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 items-center">
                    {invoice.status === 'Draft' && (
                      <Form method="post" className="inline">
                        <input type="hidden" name="id" value={invoice.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          name="intent"
                          value="send"
                          className="h-8 gap-1 text-primary hover:text-primary/90"
                        >
                          <Send className="h-3 w-3" />
                          Send
                        </Button>
                      </Form>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 text-primary hover:text-primary/90"
                    >
                      <Link to={`/billing/invoices/${invoice.id}`}>View</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {invoices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 opacity-20" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              No invoices found
            </h3>
            <p className="mt-1 text-sm">
              Get started by creating a new invoice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
