'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { Badge } from '@/components/ui/shadcn/badge';

interface DocumentVersion {
  id: string;
  documentName: string;
  currentVersion: string;
  totalVersions: number;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

interface DocumentVersionsListProps {
  initialVersions: DocumentVersion[];
}

export function DocumentVersionsList({ initialVersions }: DocumentVersionsListProps) {
  const [versions] = useState<DocumentVersion[]>(initialVersions);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Document Versions</h1>
      </div>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Current Version</TableHead>
              <TableHead>Total Versions</TableHead>
              <TableHead>Last Modified By</TableHead>
              <TableHead>Last Modified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No document versions available
                </TableCell>
              </TableRow>
            ) : (
              versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell className="font-medium">
                    {version.documentName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 border-transparent">
                      v{version.currentVersion}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {version.totalVersions}
                  </TableCell>
                  <TableCell>
                    {version.lastModifiedBy}
                  </TableCell>
                  <TableCell>
                    {new Date(version.lastModifiedAt).toLocaleDateString()}
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
