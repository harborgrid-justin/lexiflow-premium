
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Database, Settings, Plus, Key, Link as LinkIcon, X, Edit2, Trash2 } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';

interface SchemaVisualizerProps {
    tables: any[];
    onAddColumn: (tableName: string) => void;
    onEditColumn: (tableName: string, column: any) => void;
    onRemoveColumn: (tableName: string, colName: string) => void;
    onCreateTable: () => void;
    onRenameTable: (oldName: string) => void;
    onDeleteTable: (tableName: string) => void;
    onUpdateTablePos: (tableName: string, pos: {x: number, y: number}) => void;
}

const ContextMenu: React.FC<{ x: number, y: number, items: any[], onClose: () => void }> = ({ x, y, items, onClose }) => {
    const { theme } = useTheme();
    return (
        <div className={cn("absolute z-50 p-1 border rounded-lg shadow-xl", theme.surface, theme.border.default)} style={{ top: y, left: x }}>
            {items.map((item, i) => (
                <button key={i} onClick={() => { item.action(); onClose(); }} className={cn("w-full text-left text-sm flex items-center px-3 py-1.5 rounded-md transition-colors", `hover:${theme.surfaceHighlight}`, item.danger ? 'text-red-600' : theme.text.primary)}>
                    {item.icon && <item.icon className="h-3 w-3 mr-2"/>} {item.label}
                </button>
            ))}
        </div>
    );
};

export const SchemaVisualizer: React.FC<SchemaVisualizerProps> = ({ tables, onAddColumn, onEditColumn, onRemoveColumn, onCreateTable, onRenameTable, onDeleteTable, onUpdateTablePos }) => {
  const { theme, mode } = useTheme();
  const canvasRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef(new Map());

  // View State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, items: any[] } | null>(null);
  
  // Drag State
  const dragState = useRef<{ type: 'pan' | 'table', id?: string, startX: number, startY: number, initialPan?: {x: number, y:number}, initialPos?: {x: number, y:number} } | null>(null);

  useEffect(() => {
    colRefs.current = new Map();
    tables.forEach(t => t.columns.forEach((c: any) => colRefs.current.set(`${t.name}.${c.name}`, React.createRef())));
  }, [tables]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.key === ' ' || e.nativeEvent.buttons === 4) { // Middle mouse or space
        e.preventDefault();
        dragState.current = { type: 'pan', startX: e.clientX, startY: e.clientY, initialPan: { ...pan } };
    }
    setContextMenu(null);
  };

  const handleTableMouseDown = (e: React.MouseEvent, tableName: string) => {
    e.stopPropagation();
    const table = tables.find(t => t.name === tableName);
    if (!table) return;
    dragState.current = { type: 'table', id: tableName, startX: e.clientX / zoom, startY: e.clientY / zoom, initialPos: { x: table.x, y: table.y }};
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current) return;
    e.preventDefault();
    const { type, startX, startY } = dragState.current;
    
    if (type === 'pan') {
      const { initialPan } = dragState.current;
      if (!initialPan) return;
      setPan({ x: initialPan.x + (e.clientX - startX), y: initialPan.y + (e.clientY - startY) });
    } else if (type === 'table') {
        const { id, initialPos } = dragState.current;
        if (!id || !initialPos) return;
        const newX = initialPos.x + (e.clientX / zoom - startX);
        const newY = initialPos.y + (e.clientY / zoom - startY);
        // Live update for visuals
        const tableEl = canvasRef.current?.querySelector(`[data-table-name="${id}"]`) as HTMLElement;
        if(tableEl) tableEl.style.transform = `translate(${newX}px, ${newY}px)`;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
      if (dragState.current?.type === 'table') {
          const { id, startX, startY, initialPos } = dragState.current;
          if (id && initialPos) {
              const newX = initialPos.x + (e.clientX / zoom - startX);
              const newY = initialPos.y + (e.clientY / zoom - startY);
              onUpdateTablePos(id, { x: newX, y: newY });
          }
      }
      dragState.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(0.2, Math.min(2, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
  };
  
  const handleContextMenu = (e: React.MouseEvent, type: 'table' | 'column' | 'canvas', data: any) => {
      e.preventDefault();
      e.stopPropagation();
      let items = [];
      if (type === 'table') {
          items = [
              { label: 'Rename Table', icon: Edit2, action: () => onRenameTable(data.name) },
              { label: 'Add Column', icon: Plus, action: () => onAddColumn(data.name) },
              { label: 'Delete Table', icon: Trash2, danger: true, action: () => onDeleteTable(data.name) }
          ];
      } else if (type === 'column') {
          items = [
              { label: 'Edit Column', icon: Edit2, action: () => onEditColumn(data.tableName, data.column) },
              { label: 'Delete Column', icon: Trash2, danger: true, action: () => onRemoveColumn(data.tableName, data.column.name) }
          ];
      } else { // Canvas
          items = [{ label: 'Create Table', icon: Plus, action: onCreateTable }];
      }
      setContextMenu({ x: e.clientX, y: e.clientY, items });
  };
  
  const gridColor = mode === 'dark' ? '#334155' : '#cbd5e1';

  return (
    <div 
        className="h-full overflow-hidden relative cursor-grab active:cursor-grabbing" 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => handleContextMenu(e, 'canvas', null)}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(${gridColor} 1px, transparent 1px)`, backgroundSize: `${20 * zoom}px ${20 * zoom}px`, backgroundPosition: `${pan.x}px ${pan.y}px`, opacity: 0.5 }}
      />
      
      <div 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
      >
        {/* SVG layer for relationship lines */}
        
        {/* Tables */}
        {tables.map(t => (
            <div 
                key={t.name}
                data-table-name={t.name}
                className={cn("w-64 h-fit max-h-full flex flex-col rounded-lg shadow-md border overflow-hidden flex-shrink-0 absolute cursor-default", theme.surface, theme.border.default)}
                style={{ transform: `translate(${t.x}px, ${t.y}px)` }}
                onMouseDown={(e) => handleTableMouseDown(e, t.name)}
                onContextMenu={(e) => handleContextMenu(e, 'table', { name: t.name })}
            >
                <div className={cn("p-3 border-b flex justify-between items-center shrink-0 cursor-move", theme.surfaceHighlight, theme.border.default)}>
                    <h4 className={cn("font-bold text-sm flex items-center", theme.text.primary)}><Database className="h-3 w-3 mr-2 text-blue-600"/> {t.name}</h4>
                </div>
                <div className={cn("divide-y overflow-y-auto", theme.border.light)}>
                    {t.columns.map((c: any, i: number) => (
                        <div key={i} className={cn("px-3 py-2 flex justify-between items-center group transition-colors", `hover:${theme.surfaceHighlight}`)} onContextMenu={(e) => handleContextMenu(e, 'column', { tableName: t.name, column: c })}>
                            <div className="flex items-center">
                                {c.pk && <Key className="h-3 w-3 mr-2 text-yellow-500"/>}
                                {c.fk && <LinkIcon className="h-3 w-3 mr-2 text-blue-400"/>}
                                <span className={cn("text-xs font-mono", c.pk ? cn("font-bold", theme.text.primary) : theme.text.secondary)}>{c.name}</span>
                            </div>
                            <span className={cn("text-[9px] uppercase font-bold", theme.text.tertiary)}>{c.type}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => onAddColumn(t.name)} className={cn("w-full py-2 text-xs flex items-center justify-center transition-colors font-medium border-t shrink-0", theme.border.default, theme.primary.text, `hover:${theme.surfaceHighlight}`)}>
                    <Plus className="h-3 w-3 mr-1"/> Add Column
                </button>
            </div>
        ))}
      </div>
      {contextMenu && <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} />}
    </div>
  );
};
