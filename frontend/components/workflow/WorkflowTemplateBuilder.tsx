
import React, { useState, useRef, useCallback } from 'react';
import { WorkflowTemplateData, WorkflowTemplateId } from '../../types';
import { NodeType } from './builder/types';
import { BuilderToolbar } from './builder/BuilderToolbar';
import { BuilderPalette } from './builder/BuilderPalette';
import { BuilderCanvas } from './builder/BuilderCanvas';
import { BuilderProperties } from './builder/BuilderProperties';
import { PageHeader } from '../common/PageHeader';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Save, Rocket, ArrowLeft, Loader2 } from 'lucide-react';
import { useWorkflowBuilder } from '@/hooks/useWorkflowBuilder';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useToggle } from '../../hooks/useToggle';
import { DataService } from '../../services/data/dataService';
import { useNotify } from '../../hooks/useNotify';

interface WorkflowTemplateBuilderProps {
  initialTemplate?: WorkflowTemplateData | null;
  onBack?: () => void;
}

export const WorkflowTemplateBuilder: React.FC<WorkflowTemplateBuilderProps> = ({ initialTemplate, onBack }) => {
  const { theme } = useTheme();
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

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow') as NodeType;
    if (!type || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x) / scale - 75;
    const y = (event.clientY - rect.top - pan.y) / scale - 40;
    const id = addNode(type, x, y);
    setSelectedNodeId(id);
    propertiesToggle.open();
  }, [pan, scale, addNode]);

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
              stages: nodes.filter(n => n.type === 'Task').map(n => n.label),
              // @ts-ignore - Storing graph data for restoration
              graphData: { nodes, connections }
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

  return (
    <ErrorBoundary scope="WorkflowTemplateBuilder">
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader title={initialTemplate ? "Editing Template" : "New Workflow Draft"} actions={
            <div className="flex gap-2">
                {onBack && <Button variant="ghost" onClick={onBack} icon={ArrowLeft}>Back</Button>}
                <Button variant="secondary" icon={isSaving ? Loader2 : Save} onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button variant="primary" icon={Rocket} onClick={handleDeploy} disabled={isSaving}>Deploy</Button>
            </div>
        }/>
      </div>
      <div className="flex-1 overflow-hidden pb-6 min-h-0">
         <div className={cn("h-full border-t flex flex-col relative", theme.border.default)}>
            <BuilderToolbar scale={scale} setScale={setScale} onToggleSidebar={sidebarToggle.toggle} />
            <div className="flex-1 flex overflow-hidden relative" onDrop={onDrop} onDragOver={e => e.preventDefault()} onMouseMove={handleMouseMove} onMouseUp={() => setDraggingNodeId(null)}>
                <BuilderPalette isOpen={sidebarToggle.isOpen} onClose={sidebarToggle.close} onAddNode={(type) => {
                    const centerX = (canvasRef.current?.clientWidth || 800) / 2 / scale - pan.x/scale - 75;
                    const centerY = (canvasRef.current?.clientHeight || 600) / 2 / scale - pan.y/scale - 40;
                    const id = addNode(type, centerX, centerY);
                    setSelectedNodeId(id);
                }} />
                <BuilderCanvas 
                    nodes={nodes} connections={connections} selectedNodeId={selectedNodeId} 
                    scale={scale} pan={pan} setPan={setPan} canvasRef={canvasRef} 
                    onMouseDownNode={handleMouseDownNode} onBackgroundClick={() => setSelectedNodeId(null)}
                    selectedConnectionId={null}
                    onSelectConnection={() => {}}
                    onAddConnection={() => {}}
                />
                <BuilderProperties isOpen={propertiesToggle.isOpen} onClose={propertiesToggle.close} selectedNode={nodes.find(n => n.id === selectedNodeId) || null} onUpdateNode={updateNode} onDeleteNode={deleteNode} />
            </div>
         </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

