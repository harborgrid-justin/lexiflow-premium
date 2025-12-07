import React, { useState } from 'react';
import { Database, Plus, Key, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { useCanvasDrag } from '../../../../hooks/useCanvasDrag';

// Shared interfaces mirroring SchemaArchitect
// FIX: Export interfaces so they can be imported by SchemaArchitect.
export interface TableColumn {
  name: string;
  type: string;
  pk?: boolean;
  notNull?: boolean;
  unique?: boolean;
  fk?: string;
  index?: boolean;
}

export interface TableData {
  name: string;
  x: number;
  y: number;
  columns: TableColumn[];
}

interface SchemaVisualizerProps {
    tables: TableData[];
    onAddColumn: (tableName: string) => void;
    onEditColumn: (tableName: string, column: TableColumn) => void;
    onRemoveColumn: (tableName: string, colName: string) => void;
    onCreateTable: () => void;
    onRenameTable: (oldName: string) => void;
    onDeleteTable: (tableName: string) => void;
    onUpdateTablePos: (tableName: string, pos: {x: number, y: number}) => void;
}

interface ContextMenuItem {
    label: string;
    icon?: React.ElementType;
    action: () => void;
    danger?: boolean;
}

const ContextMenu: React.FC<{ x: number, y: number, items: ContextMenuItem[], onClose: () => void }> = ({ x, y, items, onClose }) => {
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

type ContextMenuType = 'table' | 'column' | 'canvas';
type ContextData = { name: string } | { tableName: string, column: TableColumn } | null;

export const SchemaVisualizer: React.FC<SchemaVisualizerProps> = ({ tables, onAddColumn, onEditColumn, onRemoveColumn, onCreateTable, onRenameTable, onDeleteTable, onUpdateTablePos }) => {
  const { theme, mode } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, items: ContextMenuItem[] } | null>(null);

  // Hook Integration
  const { pan, handleMouseDown } = useCanvasDrag({ 
      onUpdateItemPos: onUpdateTablePos,
      zoom 
  });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(0.2, Math.min(2, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
  };
  
  const handleContextMenu = (e: React.MouseEvent, type: ContextMenuType, data: ContextData) => {
      e.preventDefault();
      e.stopPropagation();
      let items: ContextMenuItem[] = [];
      
      if (type === 'table' && data && 'name' in data) {
          items = [
              { label: 'Rename Table', icon: Edit2, action: () => onRenameTable(data.name) },
              { label: 'Add Column', icon: Plus, action: () => onAddColumn(data.name) },
              { label: 'Delete Table', icon: Trash2, danger: true, action: () => onDeleteTable(data.name) }
          ];
      } else if (type === 'column' && data && 'column' in data) {
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
        onMouseDown={(e) => { handleMouseDown(e, 'pan'); setContextMenu(null); }}
        onWheel={handleWheel}
        onContextMenu={(e) => handleContextMenu(e, 'canvas', null)}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(${gridColor} 1px, transparent 1px)`, backgroundSize: `${20 * zoom}px ${20 * zoom}px`, backgroundPosition: `${pan.x}px ${pan.y}px`, opacity: 0.5 }}
      />
      
      <div 
        className="w-full h-full"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
      >
        {tables.map(t => (
            <div 
                key={t.name}
                data-drag-id={t.name}
                className={cn("w-64 h-fit max-h-full flex flex-col rounded-lg shadow-md border overflow-hidden flex-shrink-0 absolute cursor-default", theme.surface, theme.border.default)}
                style={{ transform: `translate(${t.x}px, ${t.y}px)` }}
                onMouseDown={(e) => handleMouseDown(e, 'item', t.name, { x: t.x, y: t.y })}
                onContextMenu={(e) => handleContextMenu(e, 'table', { name: t.name })}
            >
                <div className={cn("p-3 border-b flex justify-between items-center shrink-0 cursor-move", theme.surfaceHighlight, theme.border.default)}>
                    <h4 className={cn("font-bold text-sm flex items-center", theme.text.primary)}><Database className="h-3 w-3 mr-2 text-blue-600"/> {t.name}</h4>
                </div>
                <div className={cn("divide-y overflow-y-auto", theme.border.light)}>
                    {t.columns.map((c: TableColumn, i: number) => (
                        <div key={i} className={cn("px-3 py-2 flex justify-between items-center group transition-colors", `hover:${theme.surfaceHighlight}`)} onContextMenu={(e) => handleContextMenu(e, 'column', { tableName: t.name, column: c })}>
                            <div className="flex items-center">
                                {c.pk && <Key className="h-3 w-3 mr-2 text-yellow-500"/>}
                                {c.fk && <LinkIcon className="h-3 w-3 mr-2 text-blue-400"/>}
                                <span className={cn("text-xs font-mono", c.pk ? cn("font-bold", theme.text.primary) : theme.text.secondary)}>{c.name}</span>
                            </div>
                            <span className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>{c.type}</span>
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