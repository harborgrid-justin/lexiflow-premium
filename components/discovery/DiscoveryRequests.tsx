/**
 * DiscoveryRequests.tsx
 * 
 * Discovery request tracking table with status indicators, due dates,
 * and task creation integration for managing discovery obligations.
 * 
 * @module components/discovery/DiscoveryRequests
 * @category Discovery - Requests
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { Wand2, Upload, CheckSquare } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { TableContainer, TableHeader, TableHead } from '../common/Table';
import { TaskCreationModal } from '../common/TaskCreationModal';
import { VirtualList } from '../common/VirtualList';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useWindow } from '../../context/WindowContext';
import { DiscoveryView } from './types';

// Utils
import { cn } from '../../utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { DiscoveryRequest } from '../../types';
import { DiscoveryRequestsProps } from './types';

export const DiscoveryRequests: React.FC<DiscoveryRequestsProps> = ({ onNavigate, items = [] }) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleCreateTask = (req: DiscoveryRequest, e: React.MouseEvent) => {
      e.stopPropagation();
      const winId = `task-create-${req.id}`;
      openWindow(
          winId,
          'Create Discovery Task',
          <div className="p-4">
              <TaskCreationModal 
                isOpen={true} 
                onClose={() => closeWindow(winId)} 
                initialTitle={`Respond to: ${req.title}`}
                relatedModule="Discovery"
                relatedItemId={req.id}
                relatedItemTitle={req.title}
            />
          </div>
      );
  };

  const renderRow = (req: DiscoveryRequest) => {
    const daysLeft = getDaysRemaining(req.dueDate);
    return (
        <div key={req.id} onClick={() => onNavigate('response', req.id)} className={cn("flex items-center border-b h-[72px] px-6 transition-colors cursor-pointer group", theme.border.default, `hover:${theme.surface.highlight}`)}>
             <div className="w-[30%] pr-4">
                 <div className="flex flex-col">
                    <span className={cn("font-medium truncate", theme.text.primary)}>{req.title}</span>
                    <span className={cn("text-xs font-mono", theme.text.secondary)}>{req.id}</span>
                </div>
             </div>
             <div className="w-[15%]"><Badge variant="neutral">{req.type}</Badge></div>
             <div className="w-[15%] text-sm text-slate-600">{req.serviceDate}</div>
             <div className="w-[20%]">
                <div className="flex flex-col">
                    <span className={cn("font-medium text-sm", theme.text.primary)}>{req.dueDate}</span>
                    {req.status !== 'Responded' && (
                    <span className={`text-[10px] font-bold ${daysLeft < 5 ? 'text-red-600' : theme.text.secondary}`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
                    </span>
                    )}
                </div>
             </div>
             <div className="w-[10%]">
                 <Badge variant={req.status === 'Overdue' ? 'error' : req.status === 'Responded' ? 'success' : 'info'}>
                    {req.status}
                </Badge>
             </div>
             <div className="w-[10%] flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                 <Button size="sm" variant="ghost" className={theme.text.secondary} icon={CheckSquare} onClick={(e) => handleCreateTask(req, e)} title="Create Task" />
                 {req.type === 'Production' && (
                    <Button size="sm" variant="outline" icon={Upload} onClick={() => onNavigate('production_wizard', req.id)} title="Produce">
                    </Button>
                 )}
                 <Button size="sm" variant="ghost" icon={Wand2} onClick={() => onNavigate('response', req.id)} title="Draft Response">
                 </Button>
             </div>
        </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-4 h-full flex flex-col">
        {/* Desktop Table */}
        <div className={cn("hidden md:flex flex-col flex-1 border rounded-lg overflow-hidden", theme.surface.default, theme.border.default)}>
            <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider shrink-0", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                <div className="w-[30%]">Request</div>
                <div className="w-[15%]">Type</div>
                <div className="w-[15%]">Service Date</div>
                <div className="w-[20%]">Deadline</div>
                <div className="w-[10%]">Status</div>
                <div className="w-[10%] text-right">Action</div>
            </div>

            <div className="flex-1 relative">
                <VirtualList 
                    items={items}
                    height="100%"
                    itemHeight={72}
                    renderItem={renderRow}
                    emptyMessage="No discovery requests found."
                />
            </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
            {items.map((req) => {
                const daysLeft = getDaysRemaining(req.dueDate);
                return (
                    <div 
                        key={req.id} 
                        onClick={() => onNavigate('response', req.id)} 
                        className={cn("p-4 rounded-lg shadow-sm border cursor-pointer active:scale-[0.98] transition-transform", theme.surface.default, theme.border.default)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={cn("text-xs font-mono", theme.text.secondary)}>{req.id}</span>
                            <Badge variant={req.status === 'Overdue' ? 'error' : req.status === 'Responded' ? 'success' : 'info'}>
                                {req.status}
                            </Badge>
                        </div>
                        <h4 className={cn("font-bold mb-1", theme.text.primary)}>{req.title}</h4>
                        <div className="flex gap-2 mb-3">
                            <Badge variant="neutral">{req.type}</Badge>
                        </div>
                        
                        <div className={cn("flex justify-between items-center text-xs p-2 rounded mb-3", theme.surface.highlight, theme.text.secondary)}>
                            <span className="flex items-center">Due: {req.dueDate}</span>
                            {req.status !== 'Responded' && (
                                <span className={`font-bold ${daysLeft < 5 ? 'text-red-600' : theme.text.secondary}`}>
                                    {daysLeft < 0 ? 'OVERDUE' : `${daysLeft}d left`}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                            <Button size="sm" variant="ghost" icon={CheckSquare} onClick={(e) => handleCreateTask(req, e)}>Task</Button>
                            {req.type === 'Production' && (
                                <Button size="sm" variant="outline" icon={Upload} onClick={() => onNavigate('production_wizard', req.id)}>
                                Produce
                                </Button>
                            )}
                            <Button size="sm" variant="ghost" icon={Wand2} onClick={() => onNavigate('response', req.id)}>
                                Draft
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default DiscoveryRequests;
