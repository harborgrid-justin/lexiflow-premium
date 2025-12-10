
import React from 'react';
import { Clock, Link, ArrowRightLeft, Plus, BarChart3, ExternalLink } from 'lucide-react';
import { Case } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
// FIX: Add missing import for useNotify
import { useNotify } from '../../../hooks/useNotify';

interface OverviewSidebarProps {
  caseData: Case;
  linkedCases: Case[];
  onShowTimeModal: () => void;
  onShowLinkModal: () => void;
  onShowTransferModal: () => void;
  onNavigateToCase?: (caseData: Case) => void;
}

export const OverviewSidebar: React.FC<OverviewSidebarProps> = ({ 
  caseData, linkedCases, onShowTimeModal, onShowLinkModal, onShowTransferModal, onNavigateToCase 
}) => {
  const { theme, mode } = useTheme();

  return (
    <div className="space-y-6 w-full">
        {/* Quick Actions */}
        <div className={cn("p-5 rounded-lg shadow-sm border", theme.surface, theme.border.default)}>
            <h3 className={cn("text-sm font-bold uppercase tracking-wide mb-4", theme.text.primary)}>Quick Actions</h3>
            <div className="space-y-2">
                {[
                    { label: 'Log Time', icon: Clock, onClick: onShowTimeModal },
                    { label: 'Link Docket', icon: Link, onClick: onShowLinkModal },
                    { label: 'Transfer / Appeal', icon: ArrowRightLeft, onClick: onShowTransferModal },
                ].map((action, i) => (
                    <button 
                        key={i} 
                        onClick={action.onClick} 
                        className={cn(
                            "w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center border",
                            theme.surfaceHighlight, theme.text.secondary, theme.border.default,
                            `hover:${theme.primary.light}`, `hover:${theme.primary.text}`, `hover:${theme.primary.border}`
                        )}
                    >
                        <action.icon className="h-4 w-4 mr-2 shrink-0"/> {action.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Innovative Linking Solution: Connected Matters Visualization */}
        <div className={cn("rounded-lg border shadow-sm p-5", theme.surface, theme.border.default)}>
            <div className="flex justify-between items-center mb-3">
                <h4 className={cn("font-bold text-sm flex items-center", theme.text.primary)}>
                    <Link className="h-3 w-3 mr-2 text-blue-600 shrink-0"/> Linked Matters
                </h4>
                <button onClick={onShowLinkModal} className={cn("p-1 rounded transition-colors", `hover:${theme.surfaceHighlight}`, theme.primary.text)}>
                    <Plus className="h-4 w-4"/>
                </button>
            </div>
            {linkedCases.length > 0 ? (
                <div className="space-y-3 relative">
                    {/* Visual Connection Line */}
                    <div className={cn("absolute left-2.5 top-0 bottom-4 w-0.5 z-0", theme.border.default)}></div>
                    
                    {linkedCases.map(lc => (
                        <div 
                            key={lc.id} 
                            onClick={() => onNavigateToCase && onNavigateToCase(lc)}
                            className={cn(
                                "relative z-10 p-3 rounded-lg border cursor-pointer transition-all group overflow-hidden",
                                theme.surfaceHighlight, theme.border.default,
                                `hover:${theme.primary.border}`, "hover:shadow-md"
                            )}
                        >
                            {/* Connector Node */}
                            <div className={cn("absolute -left-[19px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2", theme.surface, theme.primary.border)}></div>
                            
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 pr-2">
                                    <span className={cn("font-bold text-xs truncate block group-hover:underline", theme.text.primary)} title={lc.title}>{lc.title}</span>
                                    <span className={cn("text-xs uppercase font-bold px-1.5 py-0.5 rounded border mt-1 inline-block", theme.surface, theme.border.default, theme.text.secondary)}>{lc.matterType}</span>
                                </div>
                                <ExternalLink className={cn("h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0", theme.primary.text)}/>
                            </div>
                            <div className={cn("flex justify-between items-center mt-2 text-[10px]", theme.text.tertiary)}>
                                <span className="font-mono truncate max-w-[80px]">{lc.id}</span>
                                <span>{lc.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={cn("text-center py-4 border-2 border-dashed rounded-lg", theme.border.default)}>
                    <Link className={cn("h-8 w-8 mx-auto mb-2 opacity-20", theme.text.tertiary)}/>
                    <p className={cn("text-xs italic", theme.text.tertiary)}>No linked dockets.</p>
                </div>
            )}
        </div>

        {/* Strategy Teaser */}
        <div className={cn("rounded-lg shadow-md p-5 text-white", mode === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-slate-800 to-slate-900')}>
            <h3 className="font-bold text-sm mb-4 flex items-center"><BarChart3 className="h-4 w-4 mr-2"/> Strategy Health</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Arguments</span>
                    <span className="font-bold bg-white/10 px-2 py-0.5 rounded">{caseData.arguments?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Defenses</span>
                    <span className="font-bold bg-white/10 px-2 py-0.5 rounded">{caseData.defenses?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Citations</span>
                    <span className="font-bold bg-white/10 px-2 py-0.5 rounded">{caseData.citations?.length || 0}</span>
                </div>
            </div>
        </div>
    </div>
  );
};
