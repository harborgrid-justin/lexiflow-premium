import { useState, useRef, useCallback } from 'react';

import { useNotify } from '@/hooks/useNotify';
import { useToggle } from '@/hooks/useToggle';
import { useWorkflowBuilder } from '@/hooks/useWorkflowBuilder';
import { DataService } from '@/services/data/data-service.service';
import { type WorkflowTemplateData, type WorkflowTemplateId, type NodeType } from '@/types';

export function useWorkflowDesigner(initialTemplate?: WorkflowTemplateData | null) {
  const notify = useNotify();
  const { nodes, connections, addNode, updateNode, deleteNode } = useWorkflowBuilder(initialTemplate);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const sidebarToggle = useToggle(true);
  const propertiesToggle = useToggle(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow') as NodeType;
    if (!type || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x) / scale - 75;
    const y = (event.clientY - rect.top - pan.y) / scale - 40;
    
    const id = addNode(type, x, y);
    setSelectedNodeId(id);
    propertiesToggle.open();
  }, [pan.x, pan.y, scale, addNode, propertiesToggle]);

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
      propertiesToggle.open();
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleBackgroundClick = () => {
    setSelectedNodeId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddNodeFromPalette = (type: NodeType) => {
    const centerX = (canvasRef.current?.clientWidth || 800) / 2 / scale - pan.x/scale - 75;
    const centerY = (canvasRef.current?.clientHeight || 600) / 2 / scale - pan.y/scale - 40;
    const id = addNode(type, centerX, centerY);
    setSelectedNodeId(id);
    propertiesToggle.open();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const template: WorkflowTemplateData = {
            id: initialTemplate?.id || `wt-${Date.now()}` as WorkflowTemplateId,
            title: initialTemplate?.title || 'New Workflow Draft',
            category: 'Custom',
            complexity: 'Medium',
            duration: '2 Weeks',
            tags: ['Draft'],
            auditReady: false,
            stages: nodes.filter(n => n.type === 'Task').map(n => n.label)
        };

        await DataService.workflow.saveTemplate(template);
        notify.success("Workflow template saved.");
    } catch (error) {
        console.error(error);
        notify.error("Failed to save template.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!initialTemplate?.id) {
        notify.error("Please save the template first.");
        return;
    }
    setIsSaving(true);
    try {
        await DataService.workflow.deploy(initialTemplate.id);
        notify.success("Workflow deployed successfully.");
    } catch (error) {
        console.error(error);
        notify.error("Failed to deploy workflow.");
    } finally {
        setIsSaving(false);
    }
  };

  return {
    // Refs
    canvasRef,

    // State
    nodes,
    connections,
    scale, setScale,
    pan, setPan,
    selectedNodeId,
    sidebarOpen: sidebarToggle.isOpen, toggleSidebar: sidebarToggle.toggle, closeSidebar: sidebarToggle.close,
    propertiesOpen: propertiesToggle.isOpen, closeProperties: propertiesToggle.close,
    isSaving,
    
    // Actions
    addNode,
    updateNode,
    deleteNode,
    handleSave,
    handleDeploy,
    handleAddNodeFromPalette,
    
    // Event Handlers
    handleDrop,
    handleDragOver,
    handleMouseMove,
    handleMouseDownNode,
    handleMouseUp,
    handleBackgroundClick
  };
}
