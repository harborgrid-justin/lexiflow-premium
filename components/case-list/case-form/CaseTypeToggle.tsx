import React from 'react';
import { cn } from '../../../utils/cn';
import { FilePlus, Scale } from 'lucide-react';

interface CaseTypeToggleProps {
  isPreFiling: boolean;
  setIsPreFiling: (isPre: boolean) => void;
}

export const CaseTypeToggle: React.FC<CaseTypeToggleProps> = ({ isPreFiling, setIsPreFiling }) => {
  return (
    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mb-6">
      <button
        onClick={() => setIsPreFiling(true)}
        className={cn(
          "flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2",
          isPreFiling ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"
        )}
      >
        <FilePlus className="h-4 w-4"/> Pre-Filing Matter
      </button>
      <button
        onClick={() => setIsPreFiling(false)}
        className={cn(
          "flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2",
          !isPreFiling ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Scale className="h-4 w-4"/> Active Litigation
      </button>
    </div>
  );
};