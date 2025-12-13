import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, Check, Settings, ShieldCheck, Database, Printer, HardDrive } from 'lucide-react';
import { Button } from '../common/Button';
import { DiscoveryRequest } from '../../types';
import { DocumentService } from '../../services/documentService';
import { Card } from '../common/Card';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface DiscoveryProductionProps {
  request: DiscoveryRequest | null;
  onBack: () => void;
}

export const DiscoveryProduction: React.FC<DiscoveryProductionProps> = ({ request, onBack }) => {
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [config, setConfig] = useState({
      batesPrefix: 'PROD-',
      startNumber: 100,
      format: 'PDF',
      includeLoadFile: true,
      ocr: true,
      stampConfidential: 'None'
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setUploading(true);
          const files = Array.from(e.target.files) as File[];
          for (const file of files) {
              await DocumentService.processFile(file); // Simulate processing
              setUploadedFiles(prev => [...prev, file.name]);
          }
          setUploading(false);
      }
  };

  return (
    <div className={cn("flex flex-col h-full rounded-lg shadow-sm border animate-fade-in", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default, theme.surface.highlight)}>
            <div className="flex items-center">
                <button onClick={onBack} className={cn("mr-3 p-2 rounded-full transition-colors", theme.text.secondary, `hover:${theme.surface.default}`)}>
                    <ArrowLeft className="h-5 w-5"/>
                </button>
                <div>
                    <h2 className={cn("text-lg font-bold", theme.text.primary)}>Production Wizard</h2>
                    <p className={cn("text-xs", theme.text.secondary)}>{request ? `Target: ${request.title}` : 'General Volume'}</p>
                </div>
            </div>
            <Button size="sm" variant="primary" onClick={() => { alert('Production job queued. You will be notified upon completion.'); onBack(); }}>Finalize & Produce</Button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Configuration */}
            <div className={cn("w-full lg:w-96 border-r p-6 space-y-6 overflow-y-auto", theme.border.default, theme.surface.highlight)}>
                <Card title="Production Settings">
                    <div className="space-y-4">
                        <div>
                            <label className={cn("block text-xs font-semibold uppercase mb-1", theme.text.secondary)}>Bates Numbering</label>
                            <div className="flex gap-2">
                                <input className={cn("w-20 p-2 border rounded text-sm", theme.surface.default, theme.border.default, theme.text.primary)} placeholder="Prefix" value={config.batesPrefix} onChange={e => setConfig({...config, batesPrefix: e.target.value})} />
                                <input className={cn("flex-1 p-2 border rounded text-sm font-mono", theme.surface.default, theme.border.default, theme.text.primary)} type="number" value={config.startNumber} onChange={e => setConfig({...config, startNumber: parseInt(e.target.value)})} />
                            </div>
                            <p className={cn("text-xs mt-1", theme.text.tertiary)}>Next: {config.batesPrefix}{String(config.startNumber).padStart(6, '0')}</p>
                        </div>
                        
                        <div>
                            <label className={cn("block text-xs font-semibold uppercase mb-1", theme.text.secondary)}>Format</label>
                            <select className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default, theme.text.primary)} value={config.format} onChange={e => setConfig({...config, format: e.target.value})}>
                                <option value="PDF">PDF + Text</option>
                                <option value="Native">Native Only</option>
                                <option value="TIFF">TIFF (Single Page)</option>
                            </select>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className={cn("flex items-center text-sm cursor-pointer", theme.text.primary)}>
                                <input type="checkbox" className="mr-2 rounded text-blue-600" checked={config.includeLoadFile} onChange={e => setConfig({...config, includeLoadFile: e.target.checked})} />
                                Include Load File (.dat/.opt)
                            </label>
                            <label className={cn("flex items-center text-sm cursor-pointer", theme.text.primary)}>
                                <input type="checkbox" className="mr-2 rounded text-blue-600" checked={config.ocr} onChange={e => setConfig({...config, ocr: e.target.checked})} />
                                Perform OCR if missing
                            </label>
                        </div>

                        <div>
                            <label className={cn("block text-xs font-semibold uppercase mb-1", theme.text.secondary)}>Confidentiality Stamp</label>
                            <select className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default, theme.text.primary)} value={config.stampConfidential} onChange={e => setConfig({...config, stampConfidential: e.target.value})}>
                                <option value="None">None</option>
                                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                                <option value="ATTORNEY EYES ONLY">ATTORNEY EYES ONLY</option>
                            </select>
                        </div>
                    </div>
                </Card>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-xs flex items-start">
                    <ShieldCheck className="h-4 w-4 mr-2 shrink-0 mt-0.5"/>
                    <p>Privilege filter active. Documents tagged 'Privileged' will be auto-flagged for withheld log and excluded from export.</p>
                </div>
            </div>

            {/* Upload/Review Area */}
            <div className={cn("flex-1 p-8 overflow-y-auto", theme.surface.default)}>
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className={cn("border p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors", theme.border.default, `hover:${theme.surface.highlight}`)}>
                            <Database className="h-6 w-6 text-blue-500 mb-2"/>
                            <span className={cn("text-sm font-bold", theme.text.primary)}>Import from Review</span>
                        </div>
                        <div className={cn("border p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors", theme.border.default, `hover:${theme.surface.highlight}`)}>
                            <HardDrive className="h-6 w-6 text-purple-500 mb-2"/>
                            <span className={cn("text-sm font-bold", theme.text.primary)}>Local Upload</span>
                        </div>
                        <div className={cn("border p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors", theme.border.default, `hover:${theme.surface.highlight}`)}>
                            <Printer className={cn("h-6 w-6 mb-2", theme.text.secondary)}/>
                            <span className={cn("text-sm font-bold", theme.text.primary)}>Print to Mail</span>
                        </div>
                    </div>

                    <div className={cn("border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors relative", theme.border.default, `hover:${theme.surface.highlight}`)}>
                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload}/>
                        {uploading ? (
                             <div className="text-blue-600 font-medium animate-pulse">Processing & Bates Stamping...</div>
                        ) : (
                            <div>
                                <Upload className={cn("h-10 w-10 mx-auto mb-3", theme.text.tertiary)}/>
                                <span className={cn("text-lg font-medium block", theme.text.primary)}>Drag & Drop Documents</span>
                                <span className={cn("text-sm", theme.text.secondary)}>or click to browse responsive files</span>
                            </div>
                        )}
                    </div>

                    {uploadedFiles.length > 0 && (
                        <div>
                            <h4 className={cn("text-sm font-bold uppercase mb-3 border-b pb-2 flex justify-between", theme.text.secondary, theme.border.default)}>
                                <span>Staged Documents</span>
                                <span>{uploadedFiles.length} Items</span>
                            </h4>
                            <div className="space-y-2">
                                {uploadedFiles.map((f, idx) => (
                                    <div key={idx} className={cn("flex justify-between items-center text-sm p-3 shadow-sm border rounded transition-colors", theme.surface.default, theme.border.default, `hover:${theme.primary.border}`)}>
                                        <span className={cn("flex items-center font-medium", theme.text.primary)}><FileText className="h-4 w-4 mr-3 text-blue-500"/> {f}</span>
                                        <div className={cn("flex items-center text-xs", theme.text.tertiary)}>
                                            <span className={cn("mr-3 font-mono px-1 rounded border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                                                {config.batesPrefix}{String(config.startNumber + idx).padStart(6, '0')}
                                            </span>
                                            <Check className="h-4 w-4 text-green-500"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default DiscoveryProduction;