/**
 * @module components/documents/viewer/DocumentPreviewPanel
 * @category Documents
 * @description Document preview panel with encryption and redaction.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import { Wand2, AlertCircle, Lock, Unlock, ExternalLink, Eraser, ShieldAlert, X } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DocumentService } from '@/services/features/documents/documentService';
import { DataService } from '@/services/data/dataService';
import { useMutation, queryClient } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';

// Hooks & Context
import { useTheme } from '../../../../context/ThemeContext';
import { useWindow } from '../../../../context/WindowContext';
import { useNotify } from '@/hooks/useNotify';
import { useBlobRegistry } from '@/hooks/useBlobRegistry';

// Components
import { TagList } from '../../../common/Primitives';
import { Button } from '../../../common/Button';
import { PreviewHeader } from '../preview/PreviewHeader';
import { PreviewContent } from '../preview/PreviewContent';
import { PIIPanel } from '../preview/PIIPanel';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { LegalDocument, UserRole } from '../../../../types';

interface DocumentPreviewPanelProps {
  document: LegalDocument | null;
  onViewHistory: (doc: LegalDocument) => void;
  onUpdate?: (id: string, updates: Partial<LegalDocument>) => void;
  userRole?: UserRole;
  isOrbital?: boolean; 
  onCloseMobile?: () => void;
}

export const DocumentPreviewPanel: React.FC<DocumentPreviewPanelProps> = ({ 
  document, onViewHistory, onUpdate, userRole = 'Associate', isOrbital = false, onCloseMobile
}) => {
  const { theme } = useTheme();
  const { openWindow } = useWindow();
  const notify = useNotify();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRedactionMode, setIsRedactionMode] = useState(false);
  
  // Systems Engineering: Integrated Memory Management
  const { register } = useBlobRegistry();

  // Mutation for Redaction
  const { mutate: performRedaction, isLoading: isRedacting } = useMutation(
      DataService.documents.redact,
      {
          onSuccess: (newDoc) => {
              notify.success("Document redacted and saved as new version.");
              setIsRedactionMode(false);
              queryClient.invalidate(queryKeys.documents.all());
          }
      }
  );

  useEffect(() => {
      let isMounted = true;
      if (document && document.tags.includes('Local')) {
          const loadBlob = async () => {
              // Retrieve raw blob from IndexedDB
              const blob = await DataService.documents.getFile(document.id);
              
              if (isMounted && blob) {
                  // Create managed URL
                  const url = register(blob);
                  setPreviewUrl(url);
              }
          };
          loadBlob();
      } else {
          setPreviewUrl(null); 
      }
      return () => { isMounted = false; };
  }, [document, register]); // The registry hook handles cleanup automatically

  const handleToggleEncryption = () => {
    if (!document || !onUpdate) return;
    if (!['Senior Partner', 'Administrator'].includes(userRole)) {
        alert("Access Denied: Only Senior Partners and Administrators can modify encryption settings.");
        return;
    }
    onUpdate(document.id, { isEncrypted: !document.isEncrypted });
  };

  const handlePopOut = () => {
      if (document) {
          openWindow(
              `doc-preview-${document.id}`, 
              `Inspector: ${document.title}`,
              <div className={cn("h-full overflow-hidden flex flex-col", theme.background)}>
                  <DocumentPreviewPanel document={document} onViewHistory={onViewHistory} onUpdate={onUpdate} userRole={userRole} isOrbital={true} />
              </div>
          );
      }
  };

  const handleApplyRedactions = (maskedContent: string) => {
      if (!document) return;
      performRedaction(document.id);
  };

  const redactedSummary = useMemo(() => {
      if (!document?.summary) return '';
      if (!isRedactionMode) return document.summary;
      return document.summary.replace(/(\b[A-Z][a-z]*\b)|(\d{2}\/\d{2}\/\d{4})|([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, '██████');
  }, [document?.summary, isRedactionMode]);

  if (!document) return <div className="hidden md:flex flex-col items-center justify-center h-full p-6 text-center text-slate-400"><AlertCircle className="h-8 w-8 opacity-50 mb-2"/><p className="text-sm">No document selected</p></div>;

  return (
    <div className={cn("flex flex-row overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-right duration-300", theme.surface.default, !isOrbital && "fixed inset-x-0 bottom-0 h-[85vh] z-50 rounded-t-2xl shadow-2xl border-t md:static md:h-full md:w-auto md:min-w-[320px] md:border-l md:rounded-none md:shadow-none md:z-auto", isOrbital && "h-full w-full", theme.border.default)}>
        
        {/* PII Side Panel (Visible in Redaction Mode) */}
        {isRedactionMode && (
            <div className="hidden lg:flex border-r w-80 shrink-0 animate-in slide-in-from-left duration-200">
                <PIIPanel content={document.content} onApplyRedactions={handleApplyRedactions} />
            </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
            <div className="md:hidden flex justify-center pt-3 pb-1" onClick={onCloseMobile}><div className="w-12 h-1.5 bg-slate-300 rounded-full"></div></div>
            
            <PreviewHeader document={document} onCloseMobile={onCloseMobile} />
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 relative">
                {isRedactionMode && (
                    <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-xs font-bold text-center py-1 z-10">
                        REDACTION MODE ACTIVE
                    </div>
                )}

                <PreviewContent document={document} previewUrl={previewUrl} isRedactionMode={isRedactionMode} />

                <div className="grid grid-cols-2 gap-2">
                    {!isOrbital && <Button variant="secondary" size="sm" className="w-full hidden md:flex" icon={ExternalLink} onClick={handlePopOut}>Pop Out</Button>}
                    <Button 
                        variant={isRedactionMode ? "primary" : "outline"} 
                        size="sm" 
                        className={cn("w-full", isRedactionMode ? "bg-slate-900 border-slate-900" : "")} 
                        icon={isRedactionMode ? X : Eraser} 
                        onClick={() => setIsRedactionMode(!isRedactionMode)}
                        isLoading={isRedacting}
                    >
                        {isRedacting ? 'Burning...' : isRedactionMode ? 'Cancel Redaction' : 'Redact'}
                    </Button>
                </div>

                <div className={cn("p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                    <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-bold uppercase tracking-wide", theme.text.tertiary)}>Security</span>
                        <button onClick={handleToggleEncryption}>{document.isEncrypted ? <Lock className="h-4 w-4 text-amber-500"/> : <Unlock className="h-4 w-4 text-slate-400"/>}</button>
                    </div>
                </div>

                <div>
                    <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3", theme.text.tertiary)}>Tags</h4>
                    <TagList tags={document.tags} />
                </div>

                {document.summary && (
                    <div className={cn("p-4 rounded-lg border shadow-sm relative overflow-hidden group", theme.surface.default, theme.primary.border)}>
                        <div className={cn("absolute top-0 left-0 w-1 h-full transition-all group-hover:w-1.5", theme.primary.DEFAULT)}></div>
                        <h4 className={cn("text-xs font-bold mb-2 flex items-center", theme.primary.text)}><Wand2 className="h-3 w-3 mr-1"/> {isRedactionMode ? 'Redacted Summary' : 'AI Summary'}</h4>
                        <p className={cn("text-xs leading-relaxed", theme.text.secondary)}>{redactedSummary}</p>
                    </div>
                )}
                
                <div className={cn("pt-4 border-t pb-12 md:pb-0", theme.border.default)}>
                    <Button variant="outline" className="w-full" onClick={() => onViewHistory(document)}>View Version History</Button>
                </div>
            </div>
        </div>
    </div>
  );
};

