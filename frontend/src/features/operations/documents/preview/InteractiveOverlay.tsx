import React, { useRef, useState, useEffect } from 'react';
import { X, Move } from 'lucide-react';
import { PDFTool } from './AcrobatToolbar';
import { cn } from '@/utils/cn';
import { useTheme } from '@/contexts/theme/ThemeContext';

interface Point { x: number; y: number }

interface Drawing {
  id: string;
  type: 'pen' | 'highlight';
  points: Point[];
  color: string;
  width: number;
  opacity: number;
}

export interface Field {
  id: string;
  type: 'signature' | 'date' | 'initials' | 'text';
  x: number;
  y: number;
  value?: string;
}

interface InteractiveOverlayProps {
  activeTool: PDFTool;
  dimensions: { width: number; height: number };
  onFieldClick: (field: Field) => void;
  existingFields?: Field[];
  onFieldsUpdate?: (fields: Field[]) => void;
}

export function InteractiveOverlay({ 
  activeTool, dimensions, onFieldClick, existingFields = [], onFieldsUpdate 
}: InteractiveOverlayProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [fields, setFields] = useState<Field[]>(existingFields);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  useEffect(() => {
    setFields(existingFields);
  }, [existingFields]);

  // Initialize Canvas Context for Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawings.forEach(d => {
      if (d.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(d.points[0].x, d.points[0].y);
      d.points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = d.color;
      ctx.lineWidth = d.width;
      ctx.globalAlpha = d.opacity;
      ctx.stroke();
    });

    // Reset
    ctx.globalAlpha = 1.0;

  }, [drawings, dimensions]);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (activeTool === 'pen' || activeTool === 'highlight') {
      setIsDrawing(true);
      setCurrentPath([pos]);
    } else if (['signature', 'date', 'initials', 'text'].includes(activeTool)) {
      // Place Field
      const newField: Field = {
        id: `f-${Date.now()}`,
        type: activeTool as 'signature' | 'date' | 'initials' | 'text',
        x: pos.x - 60, // Center anchor
        y: pos.y - 20,
        value: activeTool === 'date' ? new Date().toLocaleDateString() : ''
      };
      const updatedFields = [...fields, newField];
      setFields(updatedFields);
      if (onFieldsUpdate) onFieldsUpdate(updatedFields);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    setCurrentPath(prev => [...prev, pos]);
    
    // Live Render Current Path
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && currentPath.length > 0) {
        ctx.beginPath();
        const last = currentPath[currentPath.length - 1];
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = activeTool === 'highlight' ? theme.chart.colors.warning : theme.chart.colors.danger;
        ctx.lineWidth = activeTool === 'highlight' ? 12 : 2;
        ctx.globalAlpha = activeTool === 'highlight' ? 0.4 : 1.0;
        ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const newDrawing: Drawing = {
        id: `d-${Date.now()}`,
        type: activeTool === 'highlight' ? 'highlight' : 'pen',
        points: currentPath,
        color: activeTool === 'highlight' ? theme.chart.colors.warning : theme.chart.colors.danger,
        width: activeTool === 'highlight' ? 12 : 2,
        opacity: activeTool === 'highlight' ? 0.4 : 1.0
      };
      setDrawings([...drawings, newDrawing]);
      setCurrentPath([]);
    }
  };

  const handleDeleteField = (id: string) => {
      const updatedFields = fields.filter(f => f.id !== id);
      setFields(updatedFields);
      if (onFieldsUpdate) onFieldsUpdate(updatedFields);
  };

  return (
    <div className="absolute inset-0 w-full h-full">
        {/* Canvas for Drawings */}
        <canvas 
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className={cn("absolute inset-0 z-10", activeTool === 'select' ? 'pointer-events-none' : 'cursor-crosshair')}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        />

        {/* HTML Layer for Fields */}
        <div className="absolute inset-0 z-20 pointer-events-none">
            {fields.map(field => (
                <div 
                    key={field.id}
                    className={cn(
                        "absolute pointer-events-auto border-2 rounded flex items-center justify-center group cursor-pointer shadow-lg transition-transform hover:scale-105",
                        theme.primary.border,
                        theme.surface.highlight,
                        field.type === 'signature' ? "w-40 h-16" :
                        field.type === 'text' ? "w-48 h-8" :
                        "w-32 h-10"
                    )}
                    style={{ left: field.x, top: field.y }}
                    onClick={() => onFieldClick(field)}
                >
                    {field.value ? (
                        <span className={cn("font-handwriting text-xl", theme.primary.text, field.type === 'date' && "font-mono text-sm font-bold")}>{field.value}</span>
                    ) : (
                        <span className={cn("text-xs font-bold uppercase tracking-widest", theme.text.tertiary)}>{field.type}</span>
                    )}
                    
                    <button 
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteField(field.id); }}
                        className={cn("absolute -top-2 -right-2 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm", theme.status.error.bg)}
                    >
                        <X className="h-3 w-3"/>
                    </button>
                    <div className={cn("absolute top-0 left-0 p-1 opacity-0 group-hover:opacity-50", theme.primary.text)}><Move className="h-3 w-3"/></div>
                </div>
            ))}
        </div>
    </div>
  );
}
