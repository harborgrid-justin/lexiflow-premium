
import React from 'react';

interface DiffViewerProps {
  oldText: string;
  newText: string;
  oldLabel?: string;
  newLabel?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldText, newText, oldLabel = "Original", newLabel = "Modified" }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-red-50/10 border-red-200">
        <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-xs font-bold text-red-800 uppercase flex justify-between">
          <span>{oldLabel}</span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
          {oldText}
        </div>
      </div>
      <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-green-50/10 border-green-200">
        <div className="px-4 py-2 bg-green-50 border-b border-green-100 text-xs font-bold text-green-800 uppercase flex justify-between">
          <span>{newLabel}</span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
          {newText}
        </div>
      </div>
    </div>
  );
};
