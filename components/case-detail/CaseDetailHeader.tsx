
import React from 'react';
import { ArrowLeft, MapPin, ArrowUpRight, Calendar, Users } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Case } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useWindow } from '../../context/WindowContext';
import { ClientPortalModal } from '../ClientPortalModal';

interface CaseDetailHeaderProps {
  caseData: Case;
  onBack: () => void;
  onShowTimeline: () => void;
}

export const CaseDetailHeader: React.FC<CaseDetailHeaderProps> = ({ 
  caseData, onBack, onShowTimeline
}) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();

  const handleOpenPortal = () => {
      const winId = `portal-${caseData.clientId}`;
      openWindow(
          winId,
          `Client Portal: ${caseData.client}`,
          <ClientPortalModal 
             client={{ id: caseData.clientId || 'unknown', name: caseData.client, industry: 'General', status: 'Active', totalBilled: 0, matters: [caseData.id] }} 
             onClose={() => closeWindow(winId)}
          />
      );
  };

  return (
    <div className={cn("border-b sticky top-0 z-20 shadow-sm shrink-0 backdrop-blur-sm bg-opacity-90", theme.surface, theme.border.default)}>
        <div className="px-4 md:px-6 py-4">
            <div className="flex items-start gap-4">
                <button onClick={onBack} className={cn("mt-1 p-1.5 rounded-md transition-colors border shadow-sm shrink-0", theme.surface, theme.border.default, theme.text.secondary, `hover:${theme.surfaceHighlight}`)}>
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <h1 className={cn("text-xl md:text-2xl font-bold truncate tracking-tight max-w-full", theme.text.primary)} title={caseData.title}>{caseData.title}</h1>
                                <Badge variant={caseData.status === 'Trial' ? 'warning' : 'info'} className="shrink-0">{caseData.status}</Badge>
                            </div>
                            <div className={cn("flex flex-wrap items-center gap-3 text-xs md:text-sm", theme.text.secondary)}>
                                <span className={cn("font-mono px-1.5 py-0.5 rounded border shrink-0", theme.surfaceHighlight, theme.border.default)}>{caseData.id}</span>
                                <span className="hidden sm:inline opacity-30">|</span>
                                <span className={cn("flex items-center font-medium truncate max-w-[200px]", theme.text.primary)}><Users className={cn("h-3.5 w-3.5 mr-1.5 shrink-0", theme.text.tertiary)}/> {caseData.client}</span>
                                {caseData.jurisdiction && (
                                    <>
                                        <span className="hidden sm:inline opacity-30">|</span>
                                        <span className="hidden sm:flex items-center truncate max-w-[200px]"><MapPin className={cn("h-3.5 w-3.5 mr-1.5 shrink-0", theme.text.tertiary)}/> {caseData.jurisdiction}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right hidden xl:block">
                                <p className={cn("text-[10px] uppercase font-bold tracking-wider", theme.text.tertiary)}>Matter Value</p>
                                <p className={cn("text-lg font-mono font-bold", theme.text.primary)}>
                                    ${(caseData.value || 0).toLocaleString()}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" className="hidden sm:flex" icon={ArrowUpRight} onClick={handleOpenPortal}>Open in Portal</Button>
                            <button 
                                className={cn("lg:hidden p-2 rounded-full", theme.text.secondary, `hover:${theme.surfaceHighlight}`)}
                                onClick={onShowTimeline}
                            >
                                <Calendar className="h-6 w-6"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
  );
};
