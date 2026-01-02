'use client';

import { Button } from '@/components/ui/atoms/Button/Button';
import { FileIcon } from '@/components/ui/atoms/FileIcon/FileIcon';
import { cn } from '@/lib/utils';
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
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("p-4 rounded-lg border flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700")}>
        <Clock className={cn("h-5 w-5 text-slate-500 dark:text-slate-400")} />
        <div>
          <h3 className={cn("font-bold text-sm text-slate-900 dark:text-slate-100")}>Recently Accessed</h3>
          <p className={cn("text-xs text-slate-500 dark:text-slate-400")}>Files you have viewed or edited in the last 7 days.</p>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div className="col-span-5">Document Name</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Last Modified</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Table Body */}
        <div className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
          {recentDocs.map(doc => (
            <div key={doc.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="col-span-5">
                <div className="flex items-center gap-3">
                  <FileIcon type={doc.type} className="h-5 w-5 flex-shrink-0" />
                  <span className={cn("font-medium text-sm text-slate-900 dark:text-slate-100 truncate")}>{doc.title}</span>
                </div>
              </div>
              <div className="col-span-2 text-sm text-slate-600 dark:text-slate-300">{doc.type}</div>
              <div className="col-span-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                {new Date(doc.lastModified).toLocaleDateString()}
              </div>
              <div className="col-span-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                {doc.caseId} / {doc.sourceModule || 'General'}
              </div>
              <div className="col-span-1 text-right">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Open</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {recentDocs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed border-slate-300 dark:border-slate-700">
          <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
            <FolderOpen className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No recent files</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Files you view or edit will appear here for quick access.</p>
        </div>
      )}
    </div>
  );
}
