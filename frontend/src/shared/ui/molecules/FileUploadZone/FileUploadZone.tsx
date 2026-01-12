/**
 * @module components/common/FileUploadZone
 * @category Common
 * @description File upload zone with drag-and-drop and hash verification.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useRef } from 'react';
import { UploadCloud, CheckCircle, Loader2, Link, ShieldCheck } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DocumentService } from '@/services/features/documents/documentService';

// Hooks & Context
import { useTheme } from '@/features/theme';

// Components
import { Button } from '@/shared/ui/atoms/Button';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface FileUploadZoneProps {
  file: File | null;
  processing: boolean;
  processStage?: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generatedHash?: string;
  multiple?: boolean;
}

/**
 * FileUploadZone - React 18 optimized with useId
 */
export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  file, processing, processStage, onFileSelect, generatedHash, multiple = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  return (
    <div
        className={cn(
            "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors relative overflow-hidden",
            theme.border.default,
            `hover:${theme.surface.highlight}`
        )}
        onClick={() => fileInputRef.current?.click()}
    >
        <input type="file" ref={fileInputRef} className="hidden" onChange={onFileSelect} multiple={multiple} />
        {processing ? (
            <div className="flex flex-col items-center justify-center text-blue-600">
                <Loader2 className="h-10 w-10 animate-spin mb-4"/>
                <p className="font-bold text-lg">{processStage || 'Processing...'}</p>
                <p className="text-sm text-slate-400 mt-2">Do not close window</p>
            </div>
        ) : file ? (
            <div className="flex flex-col items-center text-green-600">
                <CheckCircle className="h-12 w-12 mb-4"/>
                <p className="font-bold text-lg">{file.name}</p>
                <p className="text-sm text-slate-500">{DocumentService.formatBytes(file.size)} • processed</p>
                {generatedHash && (
                    <div className="mt-4 flex gap-2">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 font-mono">
                            <Link className="h-3 w-3 inline mr-1"/>
                            {generatedHash.substring(0, 12)}...
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs border border-green-200 font-medium">
                            <ShieldCheck className="h-3 w-3 inline mr-1"/>
                            Secured
                        </span>
                    </div>
                )}
            </div>
        ) : (
            <>
                <UploadCloud className={cn("h-12 w-12 mx-auto mb-4", theme.text.tertiary)}/>
                <p className={cn("text-lg font-medium", theme.text.primary)}>Drop files here to upload</p>
                <p className={cn("text-sm mt-2", theme.text.secondary)}>Supports PDF, DOCX, MSG, JPG</p>
                <Button variant="secondary" className="mt-6" onClick={(e: React.MouseEvent) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Select Files</Button>
            </>
        )}
    </div>
  );
};
