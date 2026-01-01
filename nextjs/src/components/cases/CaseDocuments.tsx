/**
 * Case Documents Component - Client Component
 */

'use client';

import { Document } from '@/types';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CaseDocumentsProps {
  caseId: string;
}

export function CaseDocuments({ caseId }: CaseDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        // Fetch documents for this case
        const response = await fetch(`/api/cases/${caseId}/documents`);
        const data = await response.json();
        setDocuments(data.data || []);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [caseId]);

  if (loading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
        Documents
      </h2>
      {documents.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">No documents yet</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <FileText className="h-5 w-5 text-slate-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  {doc.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(doc.fileSize / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
