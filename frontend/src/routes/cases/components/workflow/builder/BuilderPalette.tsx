import { X, GripVertical} from 'lucide-react';
import { NodeType, getNodeIcon } from './types';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

interface BuilderPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (type: NodeType) => void;
}

export function BuilderPalette({ isOpen, onClose, onAddNode }: BuilderPaletteProps) {
  const { theme } = useTheme();

  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={cn(
      "absolute md:static inset-y-0 left-0 w-64 border-r z-10 transition-transform duration-300 shadow-xl md:shadow-none flex flex-col",
      theme.surface.default,
      theme.border.default,
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16 lg:w-64'
    )}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 md:hidden lg:flex">
            <h4 className={cn("font-bold text-xs uppercase tracking-wider", theme.text.tertiary)}>Components</h4>
            <button onClick={onClose} className="md:hidden"><X className={cn("h-4 w-4", theme.text.tertiary)}/></button>
        </div>
        
        <div className="space-y-3 flex-1 overflow-y-auto">
          {[
            { type: 'Task', desc: 'Action or Assignment' },
            { type: 'Decision', desc: 'Conditional Branch' },
            { type: 'Delay', desc: 'Time-based Wait' },
            { type: 'Parallel', desc: 'Split Execution' },
            { type: 'End', desc: 'Terminate Flow' }
          ].map((item: { type: string; desc: string }) => (
            <div 
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type as NodeType)}
              onClick={() => onAddNode(item.type as NodeType)}
              className={cn(
                "w-full flex items-center gap-3 p-3 border rounded-lg transition-all group cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5",
                theme.surface.default,
                theme.border.default,
                `hover:${theme.primary.border}`
              )}
            >
              <div className={cn("group-hover:text-slate-400", theme.text.tertiary)}>
                 <GripVertical className="h-4 w-4" />
              </div>
              <div className={cn("p-2 rounded-md shadow-sm border", theme.surface.default, theme.border.default)}>
                {getNodeIcon(item.type as NodeType)}
              </div>
              <div className="md:hidden lg:block">
                <span className={cn("text-sm font-bold block", theme.text.primary)}>{item.type}</span>
                <span className={cn("text-[10px] block", theme.text.secondary)}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className={cn("mt-4 pt-4 border-t md:hidden lg:block", theme.border.default)}>
          <div className={cn("p-3 rounded-lg text-xs border", theme.status.info.bg, theme.status.info.border, theme.status.info.text)}>
            <strong>Designer Tip:</strong> Drag components onto the grid. Hold <strong>Space</strong> to pan.
          </div>
        </div>
      </div>
    </div>
  );
}

BuilderPalette.displayName = 'BuilderPalette';
