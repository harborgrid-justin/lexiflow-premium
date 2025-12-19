
/**
 * @module components/litigation/StrategyCanvas
 * @category Litigation
 * @description Node-based strategy canvas with drag-and-drop and context menus.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

import React, { useState, useRef, useCallback } from 'react';

// Internal Components
import { BuilderToolbar } from '../workflow/builder/BuilderToolbar';
import { BuilderCanvas } from '../workflow/builder/BuilderCanvas';
import { LitigationPalette } from './LitigationPalette';
import { LitigationProperties } from './LitigationProperties';
import { ContextMenu, ContextMenuItem } from '../common/ContextMenu';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useToggle } from '../../hooks/useToggle';

// Types
import { NodeType } from '../workflow/builder/types';
import { StrategyCanvasProps } from './types';
import { LITIGATION_DESCRIPTIONS } from './constants';
import { 
  calculateDropPosition, 
  calculateCanvasMousePosition,
  generateNodeContextMenuItems,
  generateCanvasContextMenuItems 
} from './utils';

export const StrategyCanvas: React.FC<StrategyCanvasProps> = ({
  nodes, connections, addNode, updateNode, deleteNode, 
  addConnection, updateConnection, deleteConnection
}) => {
  const { theme } = useTheme();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const sidebarToggle = useToggle(true);
  const propertiesToggle = useToggle(true);
  
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);

  const getLitigationDesc = (type: string): string => {
    return LITIGATION_DESCRIPTIONS[type] || 'Standard litigation event.';
  };

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow') as NodeType;
    const litType = event.dataTransfer.getData('application/litigation-node');
    
    if (!type && !litType) return;
    if (!canvasRef.current) return;

    const { x, y } = calculateDropPosition(event, canvasRef.current, pan, scale);
    
    const finalType: NodeType = (type || 'Task') as NodeType;
    const id = addNode(finalType, x, y, litType);
    
    if (litType) {
        updateNode(id, { config: { litigationType: litType, description: getLitigationDesc(litType) } });
    }

    setSelectedNodeId(id);
    setSelectedConnectionId(null);
    propertiesToggle.open();
  }, [pan, scale, addNode, updateNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNodeId && canvasRef.current) {
      const pos = calculateCanvasMousePosition(e, canvasRef.current, pan, scale);
      updateNode(draggingNodeId, { x: pos.x - dragOffset.x, y: pos.y - dragOffset.y });
    }
  }, [draggingNodeId, dragOffset, scale, pan, updateNode]);

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    if (node && canvasRef.current) {
      const mousePos = calculateCanvasMousePosition(e, canvasRef.current, pan, scale);
      setDragOffset({ x: mousePos.x - node.x, y: mousePos.y - node.y });
      setDraggingNodeId(id);
      setSelectedNodeId(id);
      setSelectedConnectionId(null);
      setIsPropertiesOpen(true);
    }
  };

  const handleSelectConnection = (id: string) => {
    setSelectedNodeId(null);
    setSelectedConnectionId(id);
    setIsPropertiesOpen(true);
  };
  
  const handleBackgroundClick = () => {
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
    setContextMenu(null);
  };

  const handleDeleteNode = (id: string) => {
      deleteNode(id);
      if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    const nodeId = target.closest('[data-drag-id]')?.getAttribute('data-drag-id');
    
    if (nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        const items = generateNodeContextMenuItems(
          nodeId,
          (id) => { setSelectedNodeId(id); propertiesToggle.open(); },
          (id) => {
            const n = nodes.find(n => n.id === id);
            if (n) addNode(n.type, n.x + 20, n.y + 20, n.label);
          },
          deleteNode
        );
        setContextMenu({ x: e.clientX, y: e.clientY, items });
    } else { // Canvas context menu
        if (!canvasRef.current) return;
        const position = calculateCanvasMousePosition(e, canvasRef.current, pan, scale);
        const items = generateCanvasContextMenuItems(position, addNode);
        setContextMenu({ x: e.clientX, y: e.clientY, items });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
        <BuilderToolbar scale={scale} setScale={setScale} onToggleSidebar={sidebarToggle.toggle} />
        <div 
          className="flex-1 flex overflow-hidden relative" 
          onDrop={onDrop} 
          onDragOver={e => e.preventDefault()} 
          onMouseMove={handleMouseMove} 
          onMouseUp={() => setDraggingNodeId(null)}
          onContextMenu={handleContextMenu}
        >
            <LitigationPalette isOpen={sidebarToggle.isOpen} onClose={sidebarToggle.close} />
            
            <BuilderCanvas 
                nodes={nodes} 
                connections={connections} 
                selectedNodeId={selectedNodeId} 
                selectedConnectionId={selectedConnectionId}
                onSelectConnection={handleSelectConnection}
                scale={scale} 
                pan={pan} 
                setPan={setPan} 
                canvasRef={canvasRef} 
                onMouseDownNode={handleMouseDownNode} 
                onBackgroundClick={handleBackgroundClick}
                onAddConnection={addConnection}
            />
            
            <LitigationProperties 
                isOpen={propertiesToggle.isOpen} 
                onClose={propertiesToggle.close} 
                selectedNode={nodes.find(n => n.id === selectedNodeId) || null} 
                selectedConnection={connections.find(c => c.id === selectedConnectionId) || null}
                onUpdateNode={updateNode} 
                onDeleteNode={handleDeleteNode} 
                onUpdateConnection={updateConnection}
                onDeleteConnection={deleteConnection}
            />

            {contextMenu && <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} />}
        </div>
    </div>
  );
};
