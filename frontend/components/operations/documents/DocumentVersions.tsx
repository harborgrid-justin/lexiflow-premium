

import React from 'react';
import { LegalDocument, DocumentVersion, UserRole } from '../../../types';
import { History, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface DocumentVersionsProps {
  document: LegalDocument;
  userRole: UserRole;
  onRestore: (version: DocumentVersion) => void;
  onClose: () => void;
}

export const DocumentVersions: React.FC<DocumentVersionsProps> = ({ document, userRole, onRestore, onClose }) => {
  const canRestore = userRole === 'Senior Partner' || userRole === 'Administrator';
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={cn("rounded-lg shadow-xl w-full max-w-2xl overflow-hidden", theme.surface.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default, theme.surface.highlight)}>
          <div>
            <h3 className={cn("text-lg font-bold flex items-center", theme.text.primary)}>
              <History className={cn("mr-2 h-5 w-5", theme.primary.text)} />
              Version History
            </h3>
            <p className={cn("text-sm", theme.text.secondary)}>{document.title}</p>
          </div>
          <button 
            onClick={onClose} 
            className={cn("p-1 rounded-full transition-colors", theme.text.tertiary, `hover:${theme.surface.highlight}`, `hover:${theme.text.primary}`)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!canRestore && (
            <div className={cn("p-3 rounded-md flex items-center text-sm", theme.status.warning.bg, theme.status.warning.text)}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Only Partners and Admins can restore versions.
            </div>
          )}

          <div className={cn("border rounded-lg p-4 relative", theme.status.success.border, theme.status.success.bg)}>
             <span className={cn("absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded", theme.status.success.text, "bg-white/50")}>CURRENT</span>
             <h4 className={cn("text-sm font-bold", theme.text.primary)}>Current Version</h4>
             <p className={cn("text-xs mt-1", theme.text.secondary)}>Last modified: {document.lastModified}</p>
          </div>

          {document.versions.length === 0 && (
            <p className={cn("text-center py-8 italic", theme.text.tertiary)}>No previous versions available.</p>
          )}

          {document.versions.map((version) => (
            <div key={version.id} className={cn("border rounded-lg p-4 transition-colors flex justify-between items-center", theme.border.default, `hover:${theme.surface.highlight}`)}>
              <div>
                <h4 className={cn("text-sm font-bold", theme.text.primary)}>Version {version.versionNumber}</h4>
                <div className={cn("flex items-center space-x-2 text-xs mt-1", theme.text.secondary)}>
                  <span>{version.uploadDate}</span>
                  <span>•</span>
                  <span>by {version.uploadedBy}</span>
                </div>
              </div>
              {canRestore && (
                <button 
                  onClick={() => onRestore(version)}
                  className={cn("flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors", theme.primary.light, theme.primary.text, `hover:${theme.surface.default}`)}
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
