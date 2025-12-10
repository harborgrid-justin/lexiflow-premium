
import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { BuilderToolbar } from '../workflow/builder/BuilderToolbar';
import { BuilderCanvas } from '../workflow/builder/BuilderCanvas';
import { LitigationPalette } from './LitigationPalette';
import { LitigationProperties } from './LitigationProperties';
import { WorkflowNode, NodeType, WorkflowConnection } from '../workflow/builder/types';
import { ContextMenu, ContextMenuItem } from '../common/ContextMenu';
import { Edit2, Copy, Trash2, Layout, GitBranch, BoxSelect } from 'lucide-react';

// Define props interface for lifted state
interface StrategyCanvasProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  addNode: (type: NodeType, x: number, y: number, label?: string) => string;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  addConnection: (from: string, to: string, fromPort?: string) => void;
  updateConnection: (id: string, updates: Partial<WorkflowConnection>) => void;
  deleteConnection: (id: string) => void;
}

export const StrategyCanvas: React.FC<StrategyCanvasProps> = ({
  nodes, connections, addNode, updateNode, deleteNode, 
  addConnection, updateConnection, deleteConnection
}) => {
  const { theme } = useTheme();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow') as NodeType;
    const litType = event.dataTransfer.getData('application/litigation-node');
    
    if (!type && !litType) return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x) / scale - 75;
    const y = (event.clientY - rect.top - pan.y) / scale - 40;
    
    const finalType: NodeType = (type || 'Task') as NodeType;
    const id = addNode(finalType, x, y, litType);
    
    if (litType) {
        updateNode(id, { config: { litigationType: litType, description: getLitigationDesc(litType) } });
    }

    setSelectedNodeId(id);
    setSelectedConnectionId(null);
    setIsPropertiesOpen(true);
  }, [pan, scale, addNode, updateNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale - dragOffset.x;
      const y = (e.clientY - rect.top - pan.y) / scale - dragOffset.y;
      updateNode(draggingNodeId, { x, y });
    }
  }, [draggingNodeId, dragOffset, scale, pan, updateNode]);

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / scale;
      const mouseY = (e.clientY - rect.top - pan.y) / scale;
      setDragOffset({ x: mouseX - node.x, y: mouseY - node.y });
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
        
        setContextMenu({
            x: e.clientX, y: e.clientY,
            items: [
                { label: 'Edit Properties', icon: Edit2, action: () => { setSelectedNodeId(nodeId); setIsPropertiesOpen(true); } },
                { label: 'Duplicate Node', icon: Copy, action: () => addNode(node.type, node.x + 20, node.y + 20, node.label) },
                { label: 'Delete Node', icon: Trash2, danger: true, action: () => deleteNode(nodeId) }
            ]
        });
    } else { // Canvas context menu
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - pan.x) / scale;
        const y = (e.clientY - rect.top - pan.y) / scale;
        setContextMenu({
            x: e.clientX, y: e.clientY,
            items: [
                { label: 'Add Task Node', icon: Layout, action: () => addNode('Task', x - 75, y - 40) },
                { label: 'Add Decision Node', icon: GitBranch, action: () => addNode('Decision', x - 56, y - 56) },
                { label: 'Add Phase Container', icon: BoxSelect, action: () => addNode('Phase', x - 300, y - 200) }
            ]
        });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
        <BuilderToolbar scale={scale} setScale={setScale} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div 
          className="flex-1 flex overflow-hidden relative" 
          onDrop={onDrop} 
          onDragOver={e => e.preventDefault()} 
          onMouseMove={handleMouseMove} 
          onMouseUp={() => setDraggingNodeId(null)}
          onContextMenu={handleContextMenu}
        >
            <LitigationPalette isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
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
                isOpen={isPropertiesOpen} 
                onClose={() => setIsPropertiesOpen(false)} 
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

function getLitigationDesc(type: string): string {
    switch(type) {
        case 'Rule 12(b)(6)': return 'Motion to Dismiss for failure to state a claim. Standard: Assuming all facts true, plaintiff cannot win.';
        case 'Rule 56': return 'Summary Judgment. Standard: No genuine dispute of material fact.';
        case 'Rule 50': return 'Directed Verdict / Judgment as a Matter of Law.';
        default: return 'Standard litigation event.';
    }
}
