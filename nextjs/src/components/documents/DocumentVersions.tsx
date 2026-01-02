'use client';

import { cn } from '@/lib/utils';
import { DocumentVersion, LegalDocument, UserRole } from '@/types/documents';
import { AlertTriangle, History, RotateCcw, X } from 'lucide-react';

interface DocumentVersionsProps {
  document: LegalDocument;
  userRole: UserRole;
  onRestore: (version: DocumentVersion) => void;
  onClose: () => void;
}

export function DocumentVersions({ document, userRole, onRestore, onClose }: DocumentVersionsProps) {
  const canRestore = userRole === 'Senior Partner' || userRole === 'Administrator';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={cn("rounded-lg shadow-xl w-full max-w-2xl overflow-hidden bg-white dark:bg-slate-900")}>
        <div className={cn("p-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700")}>
          <div>
            <h3 className={cn("text-lg font-bold flex items-center text-slate-900 dark:text-slate-100")}>
              <History className={cn("mr-2 h-5 w-5 text-blue-600 dark:text-blue-400")} />
              Version History
            </h3>
            <p className={cn("text-sm text-slate-500 dark:text-slate-400")}>{document.title}</p>
          </div>
          <button
            onClick={onClose}
            className={cn("p-1 rounded-full transition-colors text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!canRestore && (
            <div className={cn("p-3 rounded-md flex items-center text-sm bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400")}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Only Partners and Admins can restore versions.
            </div>
          )}

          <div className={cn("border rounded-lg p-4 relative border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20")}>
            <span className={cn("absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-400 bg-white/50 dark:bg-black/20")}>CURRENT</span>
            <h4 className={cn("text-sm font-bold text-slate-900 dark:text-slate-100")}>Current Version</h4>
            <p className={cn("text-xs mt-1 text-slate-500 dark:text-slate-400")}>Last modified: {document.lastModified}</p>
          </div>

          {document.versions.length === 0 && (
            <p className={cn("text-center py-8 italic text-slate-400 dark:text-slate-500")}>No previous versions available.</p>
          )}

          {document.versions.map((version) => (
            <div key={version.id} className={cn("border rounded-lg p-4 transition-colors flex justify-between items-center border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50")}>
              <div>
                <h4 className={cn("text-sm font-bold text-slate-900 dark:text-slate-100")}>Version {version.versionNumber}</h4>
                <div className={cn("flex items-center space-x-2 text-xs mt-1 text-slate-500 dark:text-slate-400")}>
                  <span>{version.uploadDate}</span>
                  <span>•</span>
                  <span>by {version.uploadedBy}</span>
                </div>
              </div>
              {canRestore && (
                <button
                  onClick={() => onRestore(version)}
                  className={cn("flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50")}
                >
                  <RotateCcw className="h-3 w-3 mr-1.5" />
                  Restore
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
