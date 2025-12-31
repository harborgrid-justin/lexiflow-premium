
import { ContextMenu } from '@/components/ui/molecules/ContextMenu/ContextMenu';
import { useCanvasDrag } from '@/hooks/ui';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Database, Edit2, Key, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ContextData, ContextMenuItem, ContextMenuType, TableColumn, TableData } from './schemaTypes';

interface SchemaVisualizerProps {
    tables: TableData[];
    onAddColumn: (tableName: string) => void;
    onEditColumn: (tableName: string, column: TableColumn) => void;
    onRemoveColumn: (tableName: string, colName: string) => void;
    onCreateTable: () => void;
    onRenameTable: (oldName: string) => void;
    onDeleteTable: (tableName: string) => void;
    onUpdateTablePos: (tableName: string, pos: { x: number, y: number }) => void;
}

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
        // Note: preventDefault() cannot be called in passive listeners
        // The zoom behavior works without preventing default scroll
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

    // Calculate Relationships for ERD Lines
    const relationships = useMemo(() => {
        const links: { x1: number, y1: number, x2: number, y2: number, from: string, to: string }[] = [];
        // Explicitly type the map to avoid inference issues with [string, TableData] vs (string | TableData)[]
        const tableMap = new Map<string, TableData>();
        tables.forEach(t => tableMap.set(t.name, t));

        const TABLE_WIDTH = 256;

        tables.forEach(t => {
            t.columns.forEach((col, idx) => {
                if (col.fk) {
                    const targetTableName = col.fk.split('.')[0];
                    const targetTable = tableMap.get(targetTableName);

                    if (targetTable) {
                        // Simple anchoring: Right of source to Left of target
                        links.push({
                            x1: t.x + TABLE_WIDTH,
                            y1: t.y + (idx * 32) + 60, // approximate offset
                            x2: targetTable.x,
                            y2: targetTable.y + 30, // Connect to header of target
                            from: t.name,
                            to: targetTableName
                        });
                    }
                }
            });
        });
        return links;
    }, [tables]);

    const gridColor = mode === 'dark' ? '#334155' : '#cbd5e1';
    const lineColor = mode === 'dark' ? '#64748b' : '#94a3b8';

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
                className="w-full h-full transform-gpu"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
            >
                {/* Connection Layer */}
                <svg className="absolute top-0 left-0 w-[10000px] h-[10000px] pointer-events-none overflow-visible -z-10">
                    <defs>
                        <marker id="arrow-end" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L9,3 z" fill={lineColor} />
                        </marker>
                        <marker id="circle-start" markerWidth="8" markerHeight="8" refX="5" refY="5">
                            <circle cx="5" cy="5" r="3" fill={lineColor} />
                        </marker>
                    </defs>
                    {relationships.map((rel, i) => {
                        const midX = (rel.x1 + rel.x2) / 2;
                        return (
                            <path
                                key={`rel-${rel.from}-${rel.to}-${i}`}
                                d={`M ${rel.x1} ${rel.y1} C ${midX} ${rel.y1}, ${midX} ${rel.y2}, ${rel.x2} ${rel.y2}`}
                                stroke={lineColor}
                                strokeWidth="2"
                                fill="none"
                                markerEnd="url(#arrow-end)"
                                markerStart="url(#circle-start)"
                                className="opacity-50"
                            />
                        );
                    })}
                </svg>

                {tables.map(t => (
                    <div
                        key={t.name}
                        data-drag-id={t.name}
                        className={cn("w-64 h-fit max-h-full flex flex-col rounded-lg shadow-xl border overflow-hidden flex-shrink-0 absolute cursor-default transition-shadow", theme.surface.default, theme.border.default)}
                        style={{ transform: `translate(${t.x}px, ${t.y}px)` }}
                        onMouseDown={(e) => handleMouseDown(e, 'item', t.name, { x: t.x, y: t.y })}
                        onContextMenu={(e) => handleContextMenu(e, 'table', { name: t.name })}
                    >
                        <div className={cn("p-3 border-b flex justify-between items-center shrink-0 cursor-move bg-gradient-to-r", theme.surface.highlight, theme.border.default)}>
                            <h4 className={cn("font-bold text-sm flex items-center", theme.text.primary)}><Database className="h-3 w-3 mr-2 text-blue-600" /> {t.name}</h4>
                        </div>
                        <div className={cn("divide-y overflow-y-auto", theme.border.default)}>
                            {t.columns.map((c: TableColumn, i: number) => (
                                <div key={i} className={cn("px-3 py-2 flex justify-between items-center group transition-colors", `hover:${theme.surface.highlight}`)} onContextMenu={(e) => handleContextMenu(e, 'column', { tableName: t.name, column: c })}>
                                    <div className="flex items-center">
                                        {c.pk && <Key className="h-3 w-3 mr-2 text-yellow-500" />}
                                        {c.fk && <LinkIcon className="h-3 w-3 mr-2 text-blue-400" />}
                                        <span className={cn("text-xs font-mono", c.pk ? cn("font-bold", theme.text.primary) : theme.text.secondary)}>{c.name}</span>
                                    </div>
                                    <span className={cn("text-[10px] font-bold uppercase opacity-70", theme.text.tertiary)}>{c.type.split('(')[0]}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => onAddColumn(t.name)} className={cn("w-full py-2 text-xs flex items-center justify-center transition-colors font-medium border-t shrink-0", theme.border.default, theme.primary.text, `hover:${theme.surface.highlight}`)}>
                            <Plus className="h-3 w-3 mr-1" /> Add Column
                        </button>
                    </div>
                ))}
            </div>
            {contextMenu && <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} />}
        </div>
    );
};
