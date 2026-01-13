import {
  MousePointer2, PenTool, Highlighter, Type,
  Stamp, FileSignature, Calendar, RotateCw, RotateCcw,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut
} from 'lucide-react';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';

export type PDFTool = 'select' | 'pen' | 'highlight' | 'text' | 'signature' | 'date' | 'initials';

interface AcrobatToolbarProps {
  activeTool: PDFTool;
  setActiveTool: (tool: PDFTool) => void;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  pageNum: number;
  setPageNum: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export function AcrobatToolbar({
  activeTool, setActiveTool,
  scale, setScale,
  setRotation,
  pageNum, setPageNum,
  totalPages
}: AcrobatToolbarProps) {
  const { theme } = useTheme();

  const ToolButton = ({ tool, icon: Icon, label }: { tool: PDFTool; icon: React.ComponentType<{ className?: string }>; label: string }) => (
    <button
      onClick={() => setActiveTool(tool)}
      className={cn(
        "p-2 rounded-md flex flex-col items-center justify-center gap-1 transition-all w-16 h-14",
        activeTool === tool
          ? cn(theme.primary.light, theme.primary.text, "ring-1 shadow-inner", theme.primary.border)
          : cn(theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.text.primary}`)
      )}
      title={label}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[9px] font-semibold uppercase tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className={cn("h-16 border-b flex items-center justify-between px-4 shrink-0 shadow-sm", theme.border.default, theme.surface.default)}>
      {/* Annotation Tools */}
      <div className={cn("flex items-center gap-2 border-r pr-4 mr-4 h-10", theme.border.default)}>
        <ToolButton tool="select" icon={MousePointer2} label="Select" />
        <ToolButton tool="pen" icon={PenTool} label="Draw" />
        <ToolButton tool="highlight" icon={Highlighter} label="Highlight" />
        <ToolButton tool="text" icon={Type} label="Type" />
      </div>

      {/* Signing Tools */}
      <div className={cn("flex items-center gap-2 border-r pr-4 mr-4 h-10", theme.border.default)}>
        <ToolButton tool="signature" icon={FileSignature} label="Sign" />
        <ToolButton tool="initials" icon={Stamp} label="Initial" />
        <ToolButton tool="date" icon={Calendar} label="Date" />
      </div>

      {/* View Controls */}
      <div className="flex items-center gap-4">
        <div className={cn("flex items-center rounded-lg p-1", theme.surface.highlight)}>
            <button onClick={() => setPageNum((prev: number) => Math.max(1, prev - 1))} className={cn("p-1.5 rounded shadow-sm disabled:opacity-30", theme.surface.default, theme.text.secondary, `hover:${theme.text.primary}`)}><ChevronLeft className="h-4 w-4"/></button>
            <span className={cn("text-xs font-mono w-16 text-center", theme.text.secondary)}>{pageNum} / {totalPages || '-'}</span>
            <button onClick={() => setPageNum((prev: number) => prev + 1)} className={cn("p-1.5 rounded shadow-sm disabled:opacity-30", theme.surface.default, theme.text.secondary, `hover:${theme.text.primary}`)}><ChevronRight className="h-4 w-4"/></button>
        </div>

        <div className={cn("flex items-center gap-1")}>
            <button onClick={() => setRotation((prev: number) => (prev - 90) % 360)} className={cn("p-2 rounded", theme.text.tertiary, `hover:${theme.surface.highlight}`)}><RotateCcw className="h-4 w-4"/></button>
            <button onClick={() => setRotation((prev: number) => (prev + 90) % 360)} className={cn("p-2 rounded", theme.text.tertiary, `hover:${theme.surface.highlight}`)}><RotateCw className="h-4 w-4"/></button>
        </div>

        <div className={cn("flex items-center rounded-lg p-1", theme.surface.highlight)}>
            <button onClick={() => setScale((prev: number) => Math.max(0.5, prev - 0.1))} className={cn("p-1.5 rounded shadow-sm", theme.surface.default, theme.text.secondary, `hover:${theme.text.primary}`)}><ZoomOut className="h-4 w-4"/></button>
            <span className={cn("text-xs font-mono w-12 text-center", theme.text.secondary)}>{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale((prev: number) => Math.min(3, prev + 0.1))} className={cn("p-1.5 rounded shadow-sm", theme.surface.default, theme.text.secondary, `hover:${theme.text.primary}`)}><ZoomIn className="h-4 w-4"/></button>
        </div>
      </div>
    </div>
  );
}
