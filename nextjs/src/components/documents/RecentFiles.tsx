import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/shadcn/card';
import { FileText, Clock } from 'lucide-react';
import { DataService } from '@/services/data/dataService';
import { IDocument } from '@/types/models';
import { formatDistanceToNow } from 'date-fns';

export const RecentFiles: React.FC = () => {
  const [files, setFiles] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const docs = await DataService.documents.getAll({
          sort: 'updatedAt',
          order: 'desc',
          limit: 5
        });
        setFiles(docs);
      } catch (e) {
        console.error("Failed to load recent files", e);
      } finally {
        setLoading(false);
      }
    };
    loadFiles();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading recent files...</div>
          ) : files.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent files found.</div>
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
                  {file.updatedAt ? formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true }) : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
