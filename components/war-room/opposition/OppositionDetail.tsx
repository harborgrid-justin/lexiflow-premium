import React from 'react';
import { OppositionEntity } from './OppositionList';
import { X, FileText, ExternalLink, ShieldAlert, Gavel, Scale, Activity } from 'lucide-react';
import { Button } from '../../common/Button';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface OppositionDetailProps {
  entity: OppositionEntity;
  onClose: () => void;
}

export const OppositionDetail: React.FC<OppositionDetailProps> = ({ entity, onClose }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("w-96 border-l flex flex-col bg-white shadow-xl animate-in slide-in-from-right duration-300 z-10", theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center bg-slate-50/50", theme.border.default)}>
            <h4 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.secondary)}>Entity Dossier</h4>
            <button onClick={onClose} className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)}><X className="h-4 w-4"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center">
                <div className={cn("w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold border-2 border-slate-200 shadow-md bg-slate-800 text-white")}>
                    {entity.name.charAt(0)}
                </div>
                <h3 className={cn("text-xl font-bold", theme.text.primary)}>{entity.name}</h3>
                <p className={cn("text-sm", theme.text.secondary)}>{entity.role} at {entity.firm}</p>
                <div className="flex justify-center gap-2 mt-3">
                    <span className={cn("text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200")}>{entity.status}</span>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className={cn("text-xs font-bold uppercase border-b pb-2", theme.text.tertiary, theme.border.light)}>Strategic Analysis</h4>
                
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-500">Aggression Index</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={cn("w-2 h-4 rounded-sm", i <= (entity.aggression === 'High' ? 5 : entity.aggression === 'Medium' ? 3 : 1) ? "bg-red-500" : "bg-slate-200")}></div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-500">Settlement Probability</span>
                        <span className="text-sm font-bold text-slate-900">42%</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className={cn("text-sm text-slate-600 leading-relaxed italic")}>"{entity.notes}"</p>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className={cn("text-xs font-bold uppercase border-b pb-2", theme.text.tertiary, theme.border.light)}>Case History</h4>
                <div className="space-y-3">
                    <div className={cn("p-3 rounded border transition-colors hover:border-blue-300 cursor-pointer group", theme.surface, theme.border.default)}>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-blue-600">Smith v. Jones</span>
                            <span className="text-[10px] text-slate-400">2022</span>
                        </div>
                        <p className="text-xs text-slate-600">Opposing Lead Counsel. Result: Settlement.</p>
                    </div>
                    <div className={cn("p-3 rounded border transition-colors hover:border-blue-300 cursor-pointer group", theme.surface, theme.border.default)}>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-blue-600">State v. Corp</span>
                            <span className="text-[10px] text-slate-400">2020</span>
                        </div>
                        <p className="text-xs text-slate-600">Co-Counsel. Result: Defense Verdict.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className={cn("text-xs font-bold uppercase border-b pb-2", theme.text.tertiary, theme.border.light)}>Intel</h4>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="text-xs"><FileText className="h-3 w-3 mr-1"/> Publications</Button>
                    <Button variant="outline" size="sm" className="text-xs"><Gavel className="h-3 w-3 mr-1"/> Rulings</Button>
                    <Button variant="outline" size="sm" className="text-xs"><Scale className="h-3 w-3 mr-1"/> Ethics</Button>
                    <Button variant="outline" size="sm" className="text-xs"><Activity className="h-3 w-3 mr-1"/> Social</Button>
                </div>
            </div>
        </div>

        <div className={cn("p-4 border-t flex gap-2 bg-slate-50", theme.border.default)}>
            <Button variant="outline" className="flex-1">Flag Risk</Button>
            <Button variant="primary" className="flex-1">View Full Profile</Button>
        </div>
    </div>
  );
};