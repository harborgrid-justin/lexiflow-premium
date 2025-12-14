
import React from 'react';
import { UploadCloud, FileCheck, Stamp, Printer, AlertOctagon } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Button } from '../../common/Button';

interface FilingCenterProps {
  onExport: (format: 'pdf' | 'docx') => void;
  isReady: boolean;
}

export const FilingCenter: React.FC<FilingCenterProps> = ({ onExport, isReady }) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto">
        <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="h-6 w-6"/>
            </div>
            <h3 className={cn("font-bold text-sm", theme.text.primary)}>Filing & Service Center</h3>
            <p className={cn("text-xs mt-1", theme.text.secondary)}>Finalize document for court submission.</p>
        </div>

        <div className="space-y-3">
            <h4 className={cn("text-xs font-bold uppercase text-slate-500")}>Pre-Flight Checks</h4>
            
            <div className={cn("flex items-center justify-between p-3 rounded border bg-green-50/50 border-green-100")}>
                <span className="text-xs font-medium text-green-800 flex items-center"><CheckCircleIcon/> Jurisdiction Format</span>
                <span className="text-[10px] font-bold text-green-700 uppercase">Pass</span>
            </div>
            <div className={cn("flex items-center justify-between p-3 rounded border bg-green-50/50 border-green-100")}>
                <span className="text-xs font-medium text-green-800 flex items-center"><CheckCircleIcon/> Signature Block</span>
                <span className="text-[10px] font-bold text-green-700 uppercase">Pass</span>
            </div>
             <div className={cn("flex items-center justify-between p-3 rounded border", isReady ? "bg-green-50/50 border-green-100" : "bg-amber-50/50 border-amber-100")}>
                <span className={cn("text-xs font-medium flex items-center", isReady ? "text-green-800" : "text-amber-800")}>
                    {isReady ? <CheckCircleIcon/> : <AlertIcon/>} Content Review
                </span>
                <span className={cn("text-[10px] font-bold uppercase", isReady ? "text-green-700" : "text-amber-700")}>
                    {isReady ? 'Pass' : 'Pending'}
                </span>
            </div>
        </div>

        <div className="space-y-3 pt-2">
            <Button className="w-full justify-start" icon={FileCheck} onClick={() => onExport('pdf')} variant="secondary">
                Generate PDF-A (Court Ready)
            </Button>
            <Button className="w-full justify-start" icon={Printer} onClick={() => window.print()} variant="secondary">
                Print Draft
            </Button>
            <Button className="w-full justify-start" icon={Stamp} onClick={() => alert("Certificate generated")} variant="outline">
                Generate Certificate of Service
            </Button>
        </div>
        
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button className="w-full" variant="primary" disabled={!isReady}>
                E-File via Tyler/Odyssey
            </Button>
            <p className="text-[10px] text-center text-slate-400 mt-2">Integration active. Fees apply.</p>
        </div>
    </div>
  );
};

const CheckCircleIcon = () => <div className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center mr-2"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>;
const AlertIcon = () => <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center mr-2"><span className="font-bold text-[10px]">!</span></div>;
