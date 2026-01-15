/**
 * StrategyToolbar.tsx
 *
 * Toolbar for the Strategy Canvas, providing zoom, export, and sidebar toggle controls.
 *
 * @module components/litigation/StrategyToolbar
 */

import { Download, Menu, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { StrategyToolbarProps } from './types';

export const StrategyToolbar: React.FC<StrategyToolbarProps> = ({
  scale, setScale, onToggleSidebar, onZoomToFit, onExport
}) => {
  const { theme } = useTheme();
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className={cn("h-14 border-b px-4 flex justify-between items-center z-20 shrink-0 shadow-sm", theme.surface.default, theme.border.default)}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={Menu} onClick={onToggleSidebar} className="p-2" />
        <span className={cn("h-6 w-px", theme.border.default)}></span>
        <span className={cn("text-sm font-bold uppercase tracking-wider ml-2", theme.text.tertiary)}>Strategy Canvas</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={cn("flex rounded-lg p-1 mr-2 border", theme.surface.highlight, theme.border.default)}>
          <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className={cn("p-1.5 rounded", theme.text.secondary, `hover:${theme.surface.default}`)}><ZoomOut className="h-4 w-4" /></button>
          <div
            onClick={() => setScale(1)}
            className={cn("px-2 text-xs flex items-center font-mono w-14 justify-center cursor-pointer", theme.text.secondary, `hover:${theme.text.primary}`)}
          >
            {Math.round(scale * 100)}%
          </div>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className={cn("p-1.5 rounded", theme.text.secondary, `hover:${theme.surface.default}`)}><ZoomIn className="h-4 w-4" /></button>
        </div>
        <Button variant="secondary" size="sm" onClick={onZoomToFit}>Zoom to Fit</Button>

        <div className="relative">
          <Button variant="secondary" size="sm" icon={Download} onClick={() => setIsExportOpen(!isExportOpen)}>Export</Button>
          {isExportOpen && (
            <div className={cn("absolute top-full right-0 mt-2 w-40 rounded-md shadow-lg py-1 z-50", theme.surface.default, theme.border.default, "border")}>
              <button onClick={() => { onExport('svg'); setIsExportOpen(false); }} className={cn("w-full text-left px-3 py-1.5 text-sm", `hover:${theme.surface.highlight}`)}>as SVG Image</button>
              <button onClick={() => { onExport('markdown'); setIsExportOpen(false); }} className={cn("w-full text-left px-3 py-1.5 text-sm", `hover:${theme.surface.highlight}`)}>as Markdown Outline</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
