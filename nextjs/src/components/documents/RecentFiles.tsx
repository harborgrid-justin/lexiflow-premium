'use client';

import { Button } from '@/components/ui/shadcn/button';
import { Card } from "@/components/ui/shadcn/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/shadcn/table";
import { FileIcon } from '@/components/ui/atoms/FileIcon/FileIcon';
import { LegalDocument } from '@/types/documents';
import { Clock, Eye, FolderOpen, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function RecentFiles() {
  const [recentDocs, setRecentDocs] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data fetching
    const timer = setTimeout(() => {
      const mockDocs: LegalDocument[] = [
        {
          id: '1',
          title: 'Smith v. Jones - Complaint',
          type: 'Pleading',
          lastModified: '2024-01-15T10:30:00Z',
          caseId: 'CASE-2024-001',
          sourceModule: 'Docket',
          fileSize: '1.2 MB',
          status: 'Final',
          tags: ['Urgent'],
          versions: [],
          content: '',
          uploadDate: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          userId: 'user-1'
        },
        {
          id: '2',
          title: 'Discovery Request - Interrogatories',
          type: 'Discovery',
          lastModified: '2024-01-14T15:45:00Z',
          caseId: 'CASE-2024-002',
          sourceModule: 'Discovery',
          fileSize: '450 KB',
          status: 'Draft',
          tags: [],
          versions: [],
          content: '',
          uploadDate: '2024-01-14T15:45:00Z',
          createdAt: '2024-01-14T15:45:00Z',
          updatedAt: '2024-01-14T15:45:00Z',
          userId: 'user-1'
        },
        {
          id: '3',
          title: 'Settlement Agreement v3',
          type: 'Contract',
          lastModified: '2024-01-12T09:15:00Z',
          caseId: 'CASE-2023-089',
          sourceModule: 'General',
          fileSize: '2.5 MB',
          status: 'Review',
          tags: ['Confidential'],
          versions: [],
          content: '',
          uploadDate: '2024-01-12T09:15:00Z',
          createdAt: '2024-01-12T09:15:00Z',
          updatedAt: '2024-01-12T09:15:00Z',
          userId: 'user-1'
        }
      ];
      setRecentDocs(mockDocs);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <div className="p-4 rounded-lg border flex items-center gap-3 bg-muted/40 mb-6">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <div>
          <h3 className="font-semibold text-sm">Recently Accessed</h3>
          <p className="text-xs text-muted-foreground">Files you have viewed or edited in the last 7 days.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="uppercase text-xs hover:bg-transparent">
              <TableHead className="w-[40%]">Document Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentDocs.length > 0 ? (
              recentDocs.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileIcon type={doc.type} className="h-5 w-5 shrink-0" />
                      <span className="font-medium text-sm truncate">{doc.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{doc.type}</TableCell>
                  <TableCell className="text-xs font-mono">{new Date(doc.lastModified).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-37.5">
                    {doc.caseId} / {doc.sourceModule || 'General'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Open</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                    <p>No recent files</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
