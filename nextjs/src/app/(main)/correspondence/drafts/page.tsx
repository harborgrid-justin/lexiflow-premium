/**
 * Correspondence Drafts Page
 * Manage unsent drafts.
 */

import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { Edit2, FileEdit, Search, Trash2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Drafts | LexiFlow',
  description: 'Manage unsent correspondence drafts',
};

export default function DraftsPage() {
  // Mock drafts data
  const drafts = [
    { id: 1, subject: 'Re: Settlement Offer', to: 'opposing@counsel.com', matter: '25-1229', updated: '10 mins ago' },
    { id: 2, subject: 'Client Intake Summary', to: 'internal@firm.com', matter: 'N/A', updated: '2 hours ago' },
    { id: 3, subject: 'Motion to Dismiss Draft', to: 'partner@firm.com', matter: '25-1300', updated: 'Yesterday' },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
          <p className="text-muted-foreground">Resume editing unsent correspondence.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search drafts..." className="pl-9" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Subject</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Matter</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.map((draft) => (
              <TableRow key={draft.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileEdit className="h-4 w-4 text-muted-foreground" />
                    {draft.subject}
                  </div>
                </TableCell>
                <TableCell>{draft.to}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{draft.matter}</Badge>
                </TableCell>
                <TableCell>{draft.updated}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" title="Edit">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
