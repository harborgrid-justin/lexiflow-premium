
import React, { useState } from 'react';
import { ChainedLogEntry, IntegrityReport } from '../../../services/chainService';
import { Link, ShieldCheck, AlertOctagon, ArrowRight, Box, X, Terminal } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface LedgerVisualizerProps {
  chain: ChainedLogEntry[];
  integrityReport: IntegrityReport | null;
}

export const LedgerVisualizer: React.FC<LedgerVisualizerProps> = ({ chain, integrityReport }) => {
  const { theme } = useTheme();
  const [selectedBlock, setSelectedBlock] = useState<ChainedLogEntry | null>(null);

  return (
    <div className="h-full relative flex">
        {/* Main Chain Visualization */}
        <div className={cn("flex-1 overflow-y-auto p-6", theme.surfaceHighlight)}>
            <div className="max-w-3xl mx-auto relative">
                {/* Central Spine Line */}
                <div className={cn("absolute left-8 top-0 bottom-0 w-0.5 z-0", theme.border.default, "bg-slate-300 dark:bg-slate-700")} />

                {/* Genesis Block */}
                <div className="relative z-10 flex items-start gap-6 mb-8 opacity-75">
                    <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-white shadow-lg shrink-0 border-4 border-slate-200">
                        <Box className="h-8 w-8" />
                    </div>
                    <div className={cn("flex-1 p-4 rounded-lg border border-dashed", theme.surface, theme.border.default)}>
                        <h4 className={cn("text-sm font-bold uppercase tracking-wider mb-1", theme.text.secondary)}>Genesis Block</h4>
                        <p className={cn("text-xs font-mono break-all", theme.text.tertiary)}>Hash: 0000000000000000000000000000000000000000000000000000000000000000</p>
                    </div>
                </div>

                {/* Chain Blocks */}
                {chain.map((block, idx) => {
                    const isBroken = integrityReport && !integrityReport.isValid && idx >= integrityReport.brokenIndex;
                    const isTampered = integrityReport && !integrityReport.isValid && idx === integrityReport.brokenIndex;

                    return (
                        <div key={block.id} className="relative z-10 flex items-start gap-6 mb-8 group">
                            <div className={cn(
                                "w-16 h-16 rounded-lg flex items-center justify-center shadow-lg shrink-0 border-4 transition-all duration-300",
                                isTampered 
                                    ? "bg-red-600 text-white border-red-200 animate-pulse" 
                                    : isBroken 
                                        ? "bg-slate-400 text-white border-slate-200" 
                                        : "bg-white text-blue-600 border-blue-100"
                            )}>
                                {isTampered ? <AlertOctagon className="h-8 w-8"/> : <Link className="h-8 w-8"/>}
                            </div>

                            <div 
                                onClick={() => setSelectedBlock(block)}
                                className={cn(
                                    "flex-1 p-5 rounded-xl border shadow-sm transition-all relative cursor-pointer",
                                    theme.surface,
                                    selectedBlock?.id === block.id ? "ring-2 ring-blue-500 border-blue-500" : isTampered 
                                    ? "border-red-500 ring-2 ring-red-100" 
                                    : cn(theme.border.default, `hover:${theme.border.light} hover:shadow-md`)
                                )}
                            >
                                {/* Link Connector Visual */}
                                <div className={cn("absolute -left-3 top-6 w-3 h-0.5", isBroken ? "bg-red-300 dashed-line" : "bg-slate-300 dark:bg-slate-600")}></div>

                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded", theme.surfaceHighlight, theme.text.secondary)}>
                                            Block #{idx + 1}
                                        </span>
                                        <h4 className={cn("font-bold text-base mt-1", theme.text.primary)}>{block.action}</h4>
                                    </div>
                                    <span className={cn("text-xs font-mono", theme.text.tertiary)}>{new Date(block.timestamp).toLocaleTimeString()}</span>
                                </div>

                                <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-dashed", theme.border.light)}>
                                    <div>
                                        <p className={cn("text-[10px] uppercase font-bold mb-1", theme.text.tertiary)}>Previous Hash</p>
                                        <p className={cn("text-[10px] font-mono truncate", theme.text.secondary)} title={block.prevHash}>
                                            {block.prevHash.substring(0, 24)}...
                                        </p>
                                    </div>
                                    <div>
                                        <p className={cn("text-[10px] uppercase font-bold mb-1 flex items-center gap-1", theme.text.tertiary)}>
                                            Current Hash 
                                            {(!integrityReport || (integrityReport.isValid || idx < integrityReport.brokenIndex)) && <ShieldCheck className="h-3 w-3 text-green-500"/>}
                                        </p>
                                        <p className={cn("text-[10px] font-mono truncate font-bold", isTampered ? "text-red-600" : "text-blue-600")} title={block.hash}>
                                            {block.hash ? block.hash.substring(0, 24) + '...' : 'PENDING'}
                                        </p>
                                    </div>
                                </div>

                                <div className={cn("mt-3 text-xs p-2 rounded border", theme.surfaceHighlight, theme.border.default)}>
                                    <span className={cn("font-semibold", theme.text.secondary)}>Data Payload: </span>
                                    <span className={theme.text.tertiary}>{block.user} accessed {block.resource}</span>
                                </div>
                                
                                <div className={cn("absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity", theme.text.tertiary)}>
                                    <ArrowRight className="h-5 w-5"/>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Block Inspector Panel */}
        {selectedBlock && (
            <div className={cn("w-96 border-l shadow-xl flex flex-col animate-in slide-in-from-right duration-300", theme.surface, theme.border.default)}>
                <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default)}>
                    <h3 className={cn("font-bold flex items-center gap-2", theme.text.primary)}>
                        <Terminal className="h-4 w-4"/> Block Inspector
                    </h3>
                    <button onClick={() => setSelectedBlock(null)} className={cn("p-1 rounded", theme.text.secondary, `hover:${theme.surfaceHighlight}`)}>
                        <X className="h-4 w-4"/>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    <div className="space-y-1">
                        <label className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Block ID</label>
                        <p className={cn("font-mono text-sm break-all p-2 rounded border", theme.surfaceHighlight, theme.border.default, theme.text.primary)}>{selectedBlock.id}</p>
                    </div>
                    
                    <div className="space-y-1">
                        <label className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Timestamp</label>
                        <p className={cn("text-sm", theme.text.primary)}>{selectedBlock.timestamp}</p>
                    </div>

                    <div className="space-y-1">
                        <label className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Merkle Root / Current Hash</label>
                        <p className={cn("font-mono text-xs break-all p-2 rounded border border-blue-100 bg-blue-50 text-blue-700")}>
                            {selectedBlock.hash}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>Previous Block Hash</label>
                        <p className={cn("font-mono text-xs break-all p-2 rounded border", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>
                            {selectedBlock.prevHash}
                        </p>
                    </div>

                    <div className={cn("space-y-4 pt-4 border-t", theme.border.default)}>
                        <h4 className={cn("font-bold text-sm", theme.text.primary)}>Data Payload</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className={cn("text-xs block", theme.text.tertiary)}>Actor</span>
                                <span className={theme.text.primary}>{selectedBlock.user}</span>
                            </div>
                            <div>
                                <span className={cn("text-xs block", theme.text.tertiary)}>Action</span>
                                <span className={cn("font-mono text-xs", theme.text.primary)}>{selectedBlock.action}</span>
                            </div>
                            <div className="col-span-2">
                                <span className={cn("text-xs block", theme.text.tertiary)}>Resource</span>
                                <span className={cn("break-words", theme.text.primary)}>{selectedBlock.resource}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={cn("p-4 border-t text-xs text-center", theme.border.default, theme.text.tertiary, theme.surfaceHighlight)}>
                    SHA-256 Verification Algorithm
                </div>
            </div>
        )}
    </div>
  );
};
