
import React, { useRef } from 'react';
import { UploadCloud, CheckCircle, Loader2, Link, ShieldCheck } from 'lucide-react';
import { DocumentService } from '../../services/documentService.ts';
import { Button } from './Button.tsx';

interface FileUploadZoneProps {
  file: File | null;
  processing: boolean;
  processStage?: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generatedHash?: string;
  multiple?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ 
  file, processing, processStage, onFileSelect, generatedHash, multiple = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div 
        className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center hover:bg-slate-50 cursor-pointer transition-colors relative overflow-hidden"
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
                <UploadCloud className="h-12 w-12 text-slate-400 mx-auto mb-4"/>
                <p className="text-lg font-medium text-slate-700">Drop files here to upload</p>
                <p className="text-sm text-slate-500 mt-2">Supports PDF, DOCX, MSG, JPG</p>
                <Button variant="secondary" className="mt-6" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Select Files</Button>
            </>
        )}
    </div>
  );
};
