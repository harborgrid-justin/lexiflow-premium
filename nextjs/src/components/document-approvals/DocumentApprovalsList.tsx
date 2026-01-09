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

interface DocumentApproval {
  id: string;
  documentName: string;
  submittedBy: string;
  approvalStage: string;
  pendingApprovers: string[];
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
  submittedAt: string;
}

interface DocumentApprovalsListProps {
  initialApprovals: DocumentApproval[];
}

export function DocumentApprovalsList({ initialApprovals }: DocumentApprovalsListProps) {
  const [approvals] = useState<DocumentApproval[]>(initialApprovals);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-100">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'in-review':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100">In Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Document Approvals</h1>
      </div>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Pending Approvers</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No approval requests
                </TableCell>
              </TableRow>
            ) : (
              approvals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell className="font-medium">
                    {approval.documentName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {approval.submittedBy}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {approval.approvalStage}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {approval.pendingApprovers.join(', ') || 'None'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(approval.status)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
