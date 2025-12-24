/**
 * @module components/visual/GraphOverlay
 * @category Visual
 * @description Graph controls overlay with zoom and physics controls.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { ZoomIn, ZoomOut, RefreshCw, Activity, Layers } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { Button } from '@/components/atoms/Button';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface GraphOverlayProps {
  /** Current zoom scale. */
  scale: number;
  /** Callback to update scale. */
  setScale: React.Dispatch<React.SetStateAction<number>>;
  /** Callback to reheat physics simulation. */
  onReheat: () => void;
  /** Whether physics simulation is stable. */
  isStable: boolean;
  /** Number of nodes in graph. */
  nodeCount: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const GraphOverlay: React.FC<GraphOverlayProps> = ({ scale: _scale, setScale, onReheat, isStable, nodeCount }) => {
  const { theme } = useTheme();

  return (
    <>
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <div className={cn("rounded-lg shadow-sm border p-1 flex flex-col bg-opacity-90 backdrop-blur-sm", theme.surface.default, theme.border.default)}>
                <button onClick={() => setScale(s => Math.min(s + 0.1, 3))} className={cn("p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300")} title="Zoom In"><ZoomIn className="h-4 w-4"/></button>
                <button onClick={() => setScale(s => Math.max(s - 0.1, 0.1))} className={cn("p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300")} title="Zoom Out"><ZoomOut className="h-4 w-4"/></button>
            </div>
            <Button size="sm" variant="primary" icon={RefreshCw} className="shadow-lg w-10 h-10 p-0 flex items-center justify-center rounded-lg" onClick={onReheat} title="Re-run Physics" />
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 transition-colors shadow-sm",
                isStable 
                    ? cn(theme.surface.default, theme.text.secondary, theme.border.default) 
                    : cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border)
            )}>
                <Activity className={cn("h-3 w-3", !isStable && "animate-pulse")} />
                {isStable ? "Physics Idle" : "Simulating"}
            </span>
            <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shadow-sm", theme.surface.default, theme.text.secondary, theme.border.default)}>
                <Layers className="h-3 w-3"/> {nodeCount} Nodes
            </span>
        </div>

        {/* Legend */}
        <div className={cn("absolute bottom-4 left-4 z-10 p-3 rounded-lg border shadow-md text-xs space-y-2 pointer-events-none select-none backdrop-blur-md bg-opacity-90", theme.surface.default, theme.border.default)}>
            <div className={cn("font-bold uppercase mb-1 tracking-wider text-[10px]", theme.text.tertiary)}>Entity Types</div>
            <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600"></div> Case / Root</div>
            <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-blue-500"></div> Individual</div>
            <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-purple-500"></div> Organization</div>
            <div className={cn("flex items-center gap-2", theme.text.secondary)}><div className="w-3 h-3 rounded-full bg-amber-500"></div> Evidence</div>
        </div>
    </>
  );
};
