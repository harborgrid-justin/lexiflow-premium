
import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { UploadCloud, FileSpreadsheet, CheckCircle, RefreshCw, Link, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const EntityIngestion: React.FC = () => {
  const { theme } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 animate-fade-in">
        <div className="text-center">
            <h2 className={cn("text-2xl font-bold", theme.text.primary)}>Entity Data Ingestion</h2>
            <p className={cn("text-sm mt-2", theme.text.secondary)}>Import contacts, clean duplicates, and enrich data from external sources.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={cn("border-2 border-dashed hover:border-blue-400 transition-colors cursor-pointer flex flex-col items-center justify-center p-12", theme.border.default)}>
                <UploadCloud className="h-12 w-12 text-blue-500 mb-4"/>
                <h3 className={cn("font-bold text-lg", theme.text.primary)}>Bulk Upload</h3>
                <p className={cn("text-sm text-center mt-2 mb-6", theme.text.secondary)}>Drag & Drop CSV, vCard, or Excel files here.</p>
                <Button variant="primary">Select Files</Button>
            </Card>

            <Card title="Active Integrations">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded border bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-700 font-bold">O</div>
                            <div>
                                <p className="font-bold text-sm">Outlook 365</p>
                                <p className="text-xs text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1"/> Synced</p>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" icon={RefreshCw}>Sync</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded border bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-100 rounded flex items-center justify-center text-sky-700 font-bold">SF</div>
                            <div>
                                <p className="font-bold text-sm">Salesforce</p>
                                <p className="text-xs text-slate-500 flex items-center"><Link className="h-3 w-3 mr-1"/> Connect</p>
                            </div>
                        </div>
                        <Button size="sm" variant="secondary">Connect</Button>
                    </div>
                </div>
            </Card>
        </div>

        <div className={cn("p-4 rounded-lg border bg-amber-50 border-amber-200 text-amber-900 flex items-start gap-3", theme.surface)}>
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5"/>
            <div>
                <h4 className="font-bold text-sm">Data Hygiene Warning</h4>
                <p className="text-xs mt-1">7 duplicates detected in pending import queue. Please resolve before merging into Master Directory.</p>
                <Button size="sm" variant="ghost" className="mt-2 text-amber-800 hover:bg-amber-100">Review Duplicates</Button>
            </div>
        </div>
    </div>
  );
};
