'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/shadcn/card';
import { FileText, Clock, Loader2 } from 'lucide-react';
import { DataService } from '@/services/data/dataService';

interface SimpleDocument {
  id: string;
  title: string;
  updatedAt: string;
  metadata?: {
    caseId?: string;
  };
}

// Simple formatter to avoid date-fns dependency if not installed
const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

export const RecentFiles = () => {
  const [files, setFiles] = useState<SimpleDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        // Use DataService to get documents
        // Fallback to empty array if call fails or returns unexpected structure
        const docs = await DataService.documents.getAll() as unknown as SimpleDocument[];

        // Manual sort if API doesn't support params yet
        const sorted = Array.isArray(docs) ? docs.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ).slice(0, 5) : [];

        setFiles(sorted.map((d) => ({
          id: d.id,
          title: d.title,
          updatedAt: d.updatedAt,
          metadata: d.metadata
        })));
      } catch (e) {
        console.error("Failed to load recent files", e);
      } finally {
        setLoading(false);
      }
    };
    loadFiles();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">No recent files found.</div>
          ) : (
            files.map(file => (
              <div key={file.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md group cursor-pointer transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded shrink-0">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="truncate">
                    <div className="font-medium truncate text-sm">{file.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {file.metadata?.caseId || 'Unassigned'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {file.updatedAt ? timeAgo(file.updatedAt) : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
