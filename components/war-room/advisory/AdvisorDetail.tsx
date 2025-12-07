
import React from 'react';
import { Advisor } from './AdvisorList';
import { X, FileText, Download, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../../common/Button';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { InfoGrid, SectionTitle } from '../../common/RefactoredCommon';

interface AdvisorDetailProps {
  advisor: Advisor;
  onClose: () => void;
}

export const AdvisorDetail: React.FC<AdvisorDetailProps> = ({ advisor, onClose }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("w-96 border-l flex flex-col bg-white shadow-xl animate-in slide-in-from-right duration-300 z-10", theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center bg-slate-50/50", theme.border.default)}>
            <SectionTitle className="mb-0">Advisor Profile</SectionTitle>
            <button onClick={onClose} className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)}><X className="h-4 w-4"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center">
                <div className={cn("w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold border-2 border-white shadow-md", theme.primary.light, theme.primary.text)}>
                    {advisor.name.charAt(0)}
                </div>
                <h3 className={cn("text-xl font-bold", theme.text.primary)}>{advisor.name}</h3>
                <p className={cn("text-sm", theme.text.secondary)}>{advisor.specialty}</p>
                <div className="flex justify-center gap-2 mt-3">
                    <span className={cn("text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium border border-blue-100")}>{advisor.status}</span>
                    <span className={cn("text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200")}>${advisor.rate}/hr</span>
                </div>
            </div>

            <div className="space-y-4">
                <SectionTitle className="border-b pb-2">Deliverables</SectionTitle>
                <div className="space-y-3">
                    <div className={cn("p-3 rounded border flex items-start gap-3 transition-colors hover:border-blue-300 cursor-pointer", theme.surface, theme.border.default)}>
                        <FileText className="h-5 w-5 text-red-500 shrink-0"/>
                        <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-bold truncate", theme.text.primary)}>Initial Expert Report</p>
                            <p className={cn("text-xs", theme.text.secondary)}>PDF • 4.2 MB • Oct 15</p>
                        </div>
                        <Download className="h-4 w-4 text-slate-400 hover:text-blue-600"/>
                    </div>
                    <div className={cn("p-3 rounded border flex items-start gap-3 transition-colors hover:border-blue-300 cursor-pointer", theme.surface, theme.border.default)}>
                        <FileText className="h-5 w-5 text-blue-500 shrink-0"/>
                        <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-bold truncate", theme.text.primary)}>Rebuttal to Defense Expert</p>
                            <p className={cn("text-xs", theme.text.secondary)}>Draft • Due: Tomorrow</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <SectionTitle className="border-b pb-2">Financials</SectionTitle>
                <InfoGrid items={[
                    { label: "Retainer", value: "$10,000" },
                    { label: "Incurred", value: "$4,500" }
                ]} />
                <div className="text-xs text-slate-500 flex items-center justify-center pt-2">
                    <Clock className="h-3 w-3 mr-1"/> Last Invoice: 12 days ago
                </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                <h5 className="text-sm font-bold text-green-800 mb-1 flex items-center"><CheckCircle className="h-4 w-4 mr-2"/> Conflict Check</h5>
                <p className="text-xs text-green-700">Cleared on Sep 01, 2023. No adverse relations found with opposing parties.</p>
            </div>
        </div>

        <div className={cn("p-4 border-t flex gap-2", theme.border.default)}>
            <Button variant="outline" className="flex-1">Message</Button>
            <Button variant="primary" className="flex-1">Assign Task</Button>
        </div>
    </div>
  );
};
