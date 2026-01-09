import React, { useState } from 'react';
import { Link, Form } from 'react-router';
import { Receipt, DollarSign, Filter, FileText, MoreHorizontal } from 'lucide-react';
import type { FirmExpense } from '@/types/financial';

import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/shadcn/dropdown-menu";

interface FirmExpenseWithReceipt extends FirmExpense {
  receipt?: string;
}

interface ExpenseFilters {
  caseId?: string;
  category?: string;
  status?: string;
}

interface ExpenseListProps {
  expenses: FirmExpense[];
  filters?: ExpenseFilters;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, filters }) => {
  const [showFilters, setShowFilters] = useState(false);

  const getStatusBadge = (status: string) => {
    // Using custom classes for specific colors as Badge variants are limited
    const colorClass: Record<string, string> = {
      Approved: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-transparent dark:bg-emerald-900/40 dark:text-emerald-400",
      Paid: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-transparent dark:bg-emerald-900/40 dark:text-emerald-400",
      Rejected: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent",
      Draft: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent",
      Submitted: "bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-transparent dark:bg-blue-900/40 dark:text-blue-400",
      Billed: "bg-purple-100 text-purple-800 hover:bg-purple-100/80 border-transparent dark:bg-purple-900/40 dark:text-purple-400",
    };

    return (
      <Badge variant="outline" className={colorClass[status] || "bg-secondary text-secondary-foreground"}>
        {status}
      </Badge>
    );
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>

        <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">Total: ${totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {showFilters && (
        <Card className="bg-muted/30">
          <CardContent className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
            <Form method="get" className="contents">
              <div className="space-y-2">
                <label className="text-sm font-medium">Case</label>
                <Select name="caseId" defaultValue={filters?.caseId || ''}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="All Cases" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Cases</SelectItem>
                    <SelectItem value="C-2024-001">Martinez v. TechCorp</SelectItem>
                    <SelectItem value="C-2024-112">OmniGlobal Merger</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select name="category" defaultValue={filters?.category || ''}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="All Categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Filing Fees">Filing Fees</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Expert Witness">Expert Witness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select name="status" defaultValue={filters?.status || ''}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Billed">Billed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit">Apply Filters</Button>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Expenses Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length > 0 ? expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="whitespace-nowrap font-medium">
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>
                  <div className="max-w-50 truncate" title={expense.description}>
                    {expense.description}
                  </div>
                </TableCell>
                <TableCell>{expense.vendor}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  ${expense.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {getStatusBadge(expense.status)}
                </TableCell>
                <TableCell>
                  {(expense as FirmExpenseWithReceipt).receipt ? (
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary">
                      <FileText className="h-3 w-3" />
                      View
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground pl-2">No receipt</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/billing/expenses/${expense.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                      {expense.status === 'Submitted' && (
                        <DropdownMenuItem onSelect={() => { /* Submit approve intent */ }}>
                          Approve
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Receipt className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm font-medium text-foreground">No expenses</p>
                    <p className="text-xs">Get started by creating a new expense.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
