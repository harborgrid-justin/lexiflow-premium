
import React, { useState } from 'react';
import { Clause } from '../types.ts';
import { History, ArrowLeftRight, X } from 'lucide-react';
import { DiffViewer } from './common/DiffViewer.tsx';

interface ClauseHistoryModalProps {
  clause: Clause;
  onClose: () => void;
}

export const ClauseHistoryModal: React.FC<ClauseHistoryModalProps> = ({ clause, onClose }) => {
  const [compareMode, setCompareMode] = useState(false);

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clause-history-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-900 flex items-center" id="clause-history-title">
            <History className="mr-2 h-5 w-5 text-blue-600" /> History: {clause.name}
          </h3>
          <div className="flex items-center space-x-2">
            {clause.versions.length > 1 && (
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-3 py-1.5 text-sm font-medium rounded border ${compareMode ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <ArrowLeftRight className="h-4 w-4 inline mr-1" /> {compareMode ? 'Exit Compare' : 'Compare Versions'}
              </button>
            )}
            <button onClick={onClose} aria-label="Close modal"><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {compareMode && clause.versions.length >= 2 ? (
            <div className="h-96">
                <DiffViewer 
                    oldText={clause.versions[1].content} 
                    newText={clause.versions[0].content} 
                    oldLabel={`Version ${clause.versions[1].version}`}
                    newLabel={`Version ${clause.versions[0].version} (Current)`}
                />
            </div>
          ) : (
            <div className="space-y-4">
              {clause.versions.map((v, idx) => (
                <div key={v.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold mr-2 ${idx === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        v{v.version}
                      </span>
                      <span className="text-xs text-slate-500">Edited by {v.author} on {v.date}</span>
                    </div>
                  </div>
                  <p className="text-sm font-serif text-slate-800">{v.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
