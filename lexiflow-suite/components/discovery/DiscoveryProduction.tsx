
import { ArrowLeft, Check, Database, FileText, HardDrive, Printer, ShieldCheck, Upload } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { DocumentService } from '../../services/documents.ts';
import { DiscoveryRequest } from '../../types.ts';
import { Button } from '../common/Button.tsx';
import { Card } from '../common/Card.tsx';

interface DiscoveryProductionProps {
    request: DiscoveryRequest | null;
    onBack: () => void;
}

export const DiscoveryProduction: React.FC<DiscoveryProductionProps> = ({ request, onBack }) => {
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

    // Guideline 3: Transition for upload processing
    const [isPending, startTransition] = useTransition();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploading(true);
            const files = Array.from(e.target.files) as File[];

            // Process files asynchronously
            const processedNames: string[] = [];
            for (const file of files) {
                await DocumentService.processFile(file); // Simulate processing
                processedNames.push(file.name);
            }

            startTransition(() => {
                setUploadedFiles(prev => [...prev, ...processedNames]);
                setUploading(false);
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 animate-fade-in">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-3 p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Production Wizard</h2>
                        <p className="text-xs text-slate-500">{request ? `Target: ${request.title}` : 'General Volume'}</p>
                    </div>
                </div>
                <Button size="sm" variant="primary" onClick={() => { alert('Production job queued. You will be notified upon completion.'); onBack(); }}>Finalize & Produce</Button>
            </div>

            <div className={`flex flex-col lg:flex-row flex-1 overflow-hidden transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
                {/* Configuration */}
                <div className="w-full lg:w-96 border-r border-slate-200 p-6 bg-slate-50/50 space-y-6 overflow-y-auto">
                    <Card title="Production Settings">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Bates Numbering</label>
                                <div className="flex gap-2">
                                    <input className="w-20 p-2 border rounded text-sm" placeholder="Prefix" value={config.batesPrefix} onChange={e => setConfig({ ...config, batesPrefix: e.target.value })} />
                                    <input className="flex-1 p-2 border rounded text-sm font-mono" type="number" value={config.startNumber} onChange={e => setConfig({ ...config, startNumber: parseInt(e.target.value) })} />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Next: {config.batesPrefix}{String(config.startNumber).padStart(6, '0')}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Format</label>
                                <select className="w-full p-2 border rounded text-sm bg-white" value={config.format} onChange={e => setConfig({ ...config, format: e.target.value })}>
                                    <option value="PDF">PDF + Text</option>
                                    <option value="Native">Native Only</option>
                                    <option value="TIFF">TIFF (Single Page)</option>
                                </select>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" className="mr-2 rounded text-blue-600" checked={config.includeLoadFile} onChange={e => setConfig({ ...config, includeLoadFile: e.target.checked })} />
                                    Include Load File (.dat/.opt)
                                </label>
                                <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" className="mr-2 rounded text-blue-600" checked={config.ocr} onChange={e => setConfig({ ...config, ocr: e.target.checked })} />
                                    Perform OCR if missing
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Confidentiality Stamp</label>
                                <select className="w-full p-2 border rounded text-sm bg-white" value={config.stampConfidential} onChange={e => setConfig({ ...config, stampConfidential: e.target.value })}>
                                    <option value="None">None</option>
                                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                                    <option value="ATTORNEY EYES ONLY">ATTORNEY EYES ONLY</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-xs flex items-start">
                        <ShieldCheck className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
                        <p>Privilege filter active. Documents tagged 'Privileged' will be auto-flagged for withheld log and excluded from export.</p>
                    </div>
                </div>

                {/* Upload/Review Area */}
                <div className="flex-1 p-8 overflow-y-auto bg-white">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="border p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer">
                                <Database className="h-6 w-6 text-blue-500 mb-2" />
                                <span className="text-sm font-bold text-slate-700">Import from Review</span>
                            </div>
                            <div className="border p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer">
                                <HardDrive className="h-6 w-6 text-purple-500 mb-2" />
                                <span className="text-sm font-bold text-slate-700">Local Upload</span>
                            </div>
                            <div className="border p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer">
                                <Printer className="h-6 w-6 text-slate-500 mb-2" />
                                <span className="text-sm font-bold text-slate-700">Print to Mail</span>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center hover:bg-slate-50 cursor-pointer transition-colors relative">
                            <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                            {uploading ? (
                                <div className="text-blue-600 font-medium animate-pulse">Processing & Bates Stamping...</div>
                            ) : (
                                <div>
                                    <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                                    <span className="text-lg text-slate-700 font-medium block">Drag & Drop Documents</span>
                                    <span className="text-sm text-slate-500">or click to browse responsive files</span>
                                </div>
                            )}
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 border-b pb-2 flex justify-between">
                                    <span>Staged Documents</span>
                                    <span>{uploadedFiles.length} Items</span>
                                </h4>
                                <div className="space-y-2">
                                    {uploadedFiles.map((f, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm p-3 bg-white shadow-sm border border-slate-200 rounded hover:border-blue-300 transition-colors">
                                            <span className="flex items-center font-medium text-slate-700"><FileText className="h-4 w-4 mr-3 text-blue-500" /> {f}</span>
                                            <div className="flex items-center text-xs text-slate-400">
                                                <span className="mr-3 font-mono bg-slate-100 px-1 rounded border border-slate-200 text-slate-600">
                                                    {config.batesPrefix}{String(config.startNumber + idx).padStart(6, '0')}
                                                </span>
                                                <Check className="h-4 w-4 text-green-500" />
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
