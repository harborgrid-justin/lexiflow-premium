'use client';

import { DataService } from '@/services/data/dataService';
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
import { Loader2 } from 'lucide-react';

interface DocumentApproval {
  id: string;
  documentName: string;
  submittedBy: string;
  approvalStage: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
}

export function DocumentApprovalsList() {
  const [approvals, setApprovals] = useState<DocumentApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Use DataService.documents
        const docs = await DataService.documents.getAll();
        // Filter for docs needing approval or map them based on status
        // Assuming schema supports 'status'
        const pending = docs.filter((d: unknown) => ['Draft', 'Review'].includes(d.status)).map((d: unknown) => ({
          id: d.id,
          documentName: d.title,
          submittedBy: d.author || 'System',
          approvalStage: 'Legal Review',
          status: d.status === 'Draft' ? 'pending' : 'in-review'
        }));
        setApprovals(pending as unknown);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvals.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No pending approvals</TableCell></TableRow> : null}
          {approvals.map(a => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.documentName}</TableCell>
              <TableCell>{a.submittedBy}</TableCell>
              <TableCell>{a.approvalStage}</TableCell>
              <TableCell>
                <Badge variant={a.status === 'pending' ? 'secondary' : 'default'}>{a.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
