
import React, { useState } from 'react';
import { Clause } from '../types';
import { History, ArrowLeftRight, X } from 'lucide-react';
import { DiffViewer } from './common/DiffViewer';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

interface ClauseHistoryModalProps {
  clause: Clause;
  onClose: () => void;
}

export const ClauseHistoryModal: React.FC<ClauseHistoryModalProps> = ({ clause, onClose }) => {
  const { theme } = useTheme();
  const [compareMode, setCompareMode] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className={cn("relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg shadow-2xl overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center shrink-0", theme.surface.highlight, theme.border.default)}>
          <h3 className={cn("font-bold text-lg flex items-center", theme.text.primary)}>
            <History className={cn("mr-2 h-5 w-5", theme.primary.text)} /> 
            History: {clause.name}
          </h3>
          <div className="flex items-center space-x-2">
            {clause.versions.length > 1 && (
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded border transition-colors flex items-center",
                    compareMode 
                        ? cn(theme.primary.light, theme.primary.text, theme.primary.border) 
                        : cn(theme.surface.default, theme.text.secondary, theme.border.default, `hover:${theme.surface.highlight}`)
                )}
              >
                <ArrowLeftRight className="h-3 w-3 mr-1.5" /> {compareMode ? 'Exit Compare' : 'Compare Versions'}
              </button>
            )}
            <button onClick={onClose} className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)}>
                <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {compareMode && clause.versions.length >= 2 ? (
            <div className="h-96">
                <DiffViewer 
                    oldText={clause.versions[1].content || ''} 
                    newText={clause.versions[0].content || ''} 
                    oldLabel={`Version ${clause.versions[1].version}`}
                    newLabel={`Version ${clause.versions[0].version} (Current)`}
                />
            </div>
          ) : (
            <div className="space-y-4">
              {clause.versions.map((v, idx) => (
                <div key={idx} className={cn("border rounded-lg p-4 transition-colors group", theme.border.default, `hover:${theme.surface.highlight}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold mr-2",
                          idx === 0 
                            ? cn(theme.status.success.bg, theme.status.success.text) 
                            : cn(theme.surface.highlight, theme.text.secondary)
                      )}>
                        v{v.version}
                      </span>
                      <span className={cn("text-xs", theme.text.tertiary)}>Edited by {v.author} on {v.updatedAt}</span>
                    </div>
                  </div>
                  <p className={cn("text-sm font-serif leading-relaxed", theme.text.primary)}>{v.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
