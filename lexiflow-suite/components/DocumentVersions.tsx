
import React from 'react';
import { LegalDocument, DocumentVersion, UserRole } from '../types.ts';
import { History, RotateCcw, AlertTriangle } from 'lucide-react';

interface DocumentVersionsProps {
  document: LegalDocument;
  userRole: UserRole;
  onRestore: (version: DocumentVersion) => void;
  onClose: () => void;
}

export const DocumentVersions: React.FC<DocumentVersionsProps> = ({ document, userRole, onRestore, onClose }) => {
  const canRestore = userRole === 'Senior Partner' || userRole === 'Administrator';

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden" role="document">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center" id="modal-title">
              <History className="mr-2 h-5 w-5 text-blue-600" />
              Version History
            </h3>
            <p className="text-sm text-slate-500">{document.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">Close</button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!canRestore && (
            <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md flex items-center" role="alert">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Only Partners and Admins can restore versions.
            </div>
          )}

          <div className="border border-green-200 bg-green-50 rounded-lg p-4 relative">
             <span className="absolute top-3 right-3 text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded">CURRENT</span>
             <h4 className="text-sm font-bold text-slate-900">Current Version</h4>
             <p className="text-xs text-slate-500 mt-1">Last modified: {document.lastModified}</p>
          </div>

          {document.versions.length === 0 && (
            <p className="text-center text-slate-500 py-8 italic">No previous versions available.</p>
          )}

          {document.versions.map((version) => (
            <div key={version.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Version {version.versionNumber}</h4>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                  <span>{version.uploadDate}</span>
                  <span>•</span>
                  <span>by {version.uploadedBy}</span>
                </div>
              </div>
              {canRestore && (
                <button 
                  onClick={() => onRestore(version)}
                  className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  aria-label={`Restore version ${version.versionNumber}`}
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
};
