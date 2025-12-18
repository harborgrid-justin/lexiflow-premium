/**
 * CaseDetailHeader.tsx
 * 
 * Sticky header bar for case detail views showing key case metadata, status badges,
 * and quick action buttons with live counts for tasks and messages.
 * 
 * @module components/case-detail/CaseDetailHeader
 * @category Case Management - Detail Views
 */

// External Dependencies
import React from 'react';
import { ArrowLeft, MapPin, ArrowUpRight, Calendar, Users, CheckSquare, MessageCircle } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ClientPortalModal } from '../crm/ClientPortalModal';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useWindow } from '../../context/WindowContext';
import { useQuery } from '../../services/queryClient';

// Internal Dependencies - Services & Utils
import { DataService } from '../../services/data/dataService'';
import { cn } from '../../utils/cn';

// Types & Interfaces
import { Case } from '../../types';

interface CaseDetailHeaderProps {
  id: string;
  title: string;
  status: Case['status'];
  client: string;
  clientId?: string;
  jurisdiction?: string;
  onBack: () => void;
  onShowTimeline: () => void;
}

export const CaseDetailHeader: React.FC<CaseDetailHeaderProps> = React.memo(({ 
  id, title, status, client, clientId, jurisdiction, onBack, onShowTimeline
}) => {
  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const { data: openTasks } = useQuery(['tasks', id, 'count'], () => DataService.tasks.countByCaseId(id), { refetchOnWindowFocus: true, staleTime: 5000 });
  const { data: unreadMessages } = useQuery(['messages', id, 'count'], () => DataService.messenger.countUnread(id), { refetchOnWindowFocus: true, staleTime: 5000 });

  const handleOpenPortal = () => {
      const winId = `portal-${clientId}`;
      openWindow(
          winId,
          `Client Portal: ${client}`,
          <ClientPortalModal 
             client={{ id: (clientId || 'unknown') as any, name: client, industry: 'General', status: 'Active', totalBilled: 0, matters: [id as any] }} 
             onClose={() => closeWindow(winId)}
          />
      );
  };

  return (
    <div className={cn("border-b sticky top-0 z-20 shadow-sm shrink-0 backdrop-blur-sm bg-opacity-90", theme.surface.default, theme.border.default)}>
        <div className="px-4 md:px-6 py-4">
            <div className="flex items-start gap-4">
                <button onClick={onBack} className={cn("mt-1 p-1.5 rounded-md transition-colors border shadow-sm shrink-0", theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.surface.highlight}`)}>
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <h1 className={cn("text-xl md:text-2xl font-bold truncate tracking-tight max-w-full", theme.text.primary)} title={title}>{title}</h1>
                                <Badge variant={status === 'Trial' ? 'warning' : 'info'} className="shrink-0">{status}</Badge>
                            </div>
                            <div className={cn("flex flex-wrap items-center gap-3 text-xs md:text-sm", theme.text.secondary)}>
                                <span className={cn("font-mono px-1.5 py-0.5 rounded border shrink-0", theme.surface.highlight, theme.border.default)}>{id}</span>
                                <span className="hidden sm:inline opacity-30">|</span>
                                <span className={cn("flex items-center font-medium truncate max-w-[200px]", theme.text.primary)}><Users className={cn("h-3.5 w-3.5 mr-1.5 shrink-0", theme.text.tertiary)}/> {client}</span>
                                {jurisdiction && (
                                    <>
                                        <span className="hidden sm:inline opacity-30">|</span>
                                        <span className="hidden sm:flex items-center truncate max-w-[200px]"><MapPin className={cn("h-3.5 w-3.5 mr-1.5 shrink-0", theme.text.tertiary)}/> {jurisdiction}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="hidden md:flex gap-3">
                                {typeof openTasks === 'number' && openTasks > 0 && (
                                    <span className={cn("flex items-center text-xs font-bold px-2 py-1 rounded border animate-in fade-in", theme.status.warning.text, theme.status.warning.bg, theme.status.warning.border)}>
                                        <CheckSquare className="h-3 w-3 mr-1"/> {openTasks} Open Tasks
                                    </span>
                                )}
                                {typeof unreadMessages === 'number' && unreadMessages > 0 && (
                                    <span className={cn("flex items-center text-xs font-bold px-2 py-1 rounded border animate-pulse", theme.status.error.text, theme.status.error.bg, theme.status.error.border)}>
                                        <MessageCircle className="h-3 w-3 mr-1"/> {unreadMessages} Unread
                                    </span>
                                )}
                            </div>
                            <Button variant="outline" size="sm" className="hidden sm:flex" icon={ArrowUpRight} onClick={handleOpenPortal}>Client Portal</Button>
                            <button 
                                className={cn("lg:hidden p-2 rounded-full", theme.text.secondary, `hover:${theme.surface.highlight}`)}
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
});
CaseDetailHeader.displayName = 'CaseDetailHeader';

