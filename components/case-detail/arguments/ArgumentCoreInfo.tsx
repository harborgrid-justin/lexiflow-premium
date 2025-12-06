import React from 'react';
import { LegalArgument, RiskStatus } from '../../../types';
import { TextArea } from '../../common/Inputs';
import { Button } from '../../common/Button';
import { Wand2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface ArgumentCoreInfoProps {
  argument: LegalArgument;
  onUpdate: (arg: LegalArgument) => void;
  onAnalyze: () => void;
}

export const ArgumentCoreInfo: React.FC<ArgumentCoreInfoProps> = ({ argument, onUpdate, onAnalyze }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
        <div>
            <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Argument Narrative</label>
            <TextArea 
                value={argument.description} 
                onChange={(e) => onUpdate({ ...argument, description: e.target.value })}
                rows={8}
                className="font-serif text-base leading-relaxed"
                placeholder="Detail the legal reasoning..."
            />
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Strength Assessment</label>
                <div className="flex items-center gap-4">
                    <input 
                        type="range" 
                        min="0" max="100" 
                        value={argument.strength} 
                        onChange={(e) => onUpdate({ ...argument, strength: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className={cn("text-lg font-bold w-12 text-right", theme.text.primary)}>{argument.strength}%</span>
                </div>
            </div>
            <div>
                    <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Status</label>
                    <div className="flex gap-2">
                    {['Draft', 'Active', 'Dismissed'].map(s => (
                        <button 
                            key={s}
                            onClick={() => onUpdate({ ...argument, status: s as any })}
                            className={cn(
                                "px-3 py-1.5 text-xs rounded border transition-all",
                                argument.status === s 
                                    ? "bg-slate-800 text-white border-slate-800" 
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                    </div>
            </div>
        </div>

        <div className={cn("p-4 rounded-lg border bg-indigo-50 border-indigo-100 flex items-center justify-between")}>
            <div className="flex items-center gap-3 text-indigo-800">
                <div className="p-2 bg-white rounded-full shadow-sm"><Wand2 className="h-5 w-5 text-indigo-600"/></div>
                <div className="text-sm font-medium">AI Stress Test Available</div>
            </div>
            <Button size="sm" onClick={onAnalyze} className="bg-indigo-600 hover:bg-indigo-700 text-white border-transparent">Run Analysis</Button>
        </div>
    </div>
  );
};