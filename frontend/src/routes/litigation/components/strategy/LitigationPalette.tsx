/**
 * LitigationPalette.tsx
 * 
 * Sidebar palette containing draggable nodes for the strategy canvas.
 * Grouped by litigation phases and event types.
 * 
 * @module components/litigation/LitigationPalette
 */

import { X, GripVertical } from 'lucide-react';

// Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Utils
import { cn } from '@/lib/cn';

// Types & Constants
import { LitigationPaletteProps } from './types';
import { PALETTE_SECTIONS } from './constants';

export const LitigationPalette: React.FC<LitigationPaletteProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();

  const handleDragStart = (e: React.DragEvent, type: string, litType: string) => {
    e.dataTransfer.setData('application/reactflow', type); // Base type for engine
    e.dataTransfer.setData('application/litigation-node', litType); // Specific metadata
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={cn(
      "absolute md:static inset-y-0 left-0 w-72 border-r z-10 transition-transform duration-300 shadow-xl md:shadow-none flex flex-col",
      theme.surface.default,
      theme.border.default,
      isOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:overflow-hidden'
    )}>
      <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default)}>
          <h4 className={cn("font-bold text-sm uppercase tracking-wider", theme.text.primary)}>Strategy Toolkit</h4>
          <button onClick={onClose} className="md:hidden"><X className={cn("h-4 w-4", theme.text.tertiary)}/></button>
      </div>

      <div className="p-4 h-full flex flex-col overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
            {PALETTE_SECTIONS.map((section, idx) => (
                <div key={idx}>
                    <h5 className={cn("text-[10px] font-bold uppercase tracking-wide mb-3 pl-1", theme.text.tertiary)}>{section.title}</h5>
                    <div className="space-y-2">
                        {section.items.map(item => (
                            <div 
                                key={item.label}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item.type, item.label)}
                                className={cn(
                                    "flex items-center gap-3 p-3 border rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-all group",
                                    theme.surface.default,
                                    theme.border.default,
                                    `hover:${theme.primary.border}`
                                )}
                            >
                                <GripVertical className={cn("h-4 w-4 text-slate-300 group-hover:text-slate-400")} />
                                <div className={cn("p-1.5 rounded-md", 
                                    item.type === 'Phase' ? "bg-indigo-100 text-indigo-600" :
                                    item.type === 'Decision' ? "bg-purple-100 text-purple-600" :
                                    item.type === 'End' ? "bg-red-100 text-red-600" :
                                    "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                )}>
                                    <item.icon className="h-4 w-4"/>
                                </div>
                                <div>
                                    <span className={cn("text-xs font-bold block", theme.text.primary)}>{item.label}</span>
                                    <span className={cn("text-[9px] block", theme.text.tertiary)}>{item.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
