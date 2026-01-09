'use client';

import { DataService } from '@/services/data/dataService';
import { Badge } from '@/components/ui/shadcn/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DocumentVersion {
  id: string;
  documentName: string;
  currentVersion: string;
  totalVersions: number;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export function DocumentVersionsList() {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Use DataService to get documents and map to version view
        // Assuming documents have version metadata
        const docs = await DataService.documents.getAll();

        // Map to display format cast as any to handle potential mock schema variations safely
        const mappedData = docs.map((d: unknown) => ({
          id: d.id,
          documentName: d.title || d.name || 'Untitled',
          currentVersion: d.version || '1.0',
          totalVersions: d.versionCount || 1,
          lastModifiedBy: d.author || 'Unknown',
          lastModifiedAt: d.updatedAt || new Date().toISOString()
        }));

        setVersions(mappedData);
      } catch (error) {
        console.error("Failed to load document versions", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

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
