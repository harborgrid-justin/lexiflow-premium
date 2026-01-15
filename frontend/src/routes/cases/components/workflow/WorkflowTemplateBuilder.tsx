import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary/ErrorBoundary';
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';
import { useTheme } from '@/theme';
import { WorkflowTemplateData } from '@/types';
import { ArrowLeft, Loader2, Rocket, Save } from 'lucide-react';
import { useWorkflowDesigner } from '../../_hooks/useWorkflowDesigner';
import { BuilderCanvas } from './builder/BuilderCanvas';
import { BuilderPalette } from './builder/BuilderPalette';
import { BuilderProperties } from './builder/BuilderProperties';
import { BuilderToolbar } from './builder/BuilderToolbar';

interface WorkflowTemplateBuilderProps {
  initialTemplate?: WorkflowTemplateData | null;
  onBack?: () => void;
}

export function WorkflowTemplateBuilder({ initialTemplate, onBack }: WorkflowTemplateBuilderProps) {
  const { theme } = useTheme();

  const {
    // Refs
    canvasRef,

    // State
    nodes,
    connections,
    scale, setScale,
    pan, setPan,
    selectedNodeId,
    sidebarOpen, toggleSidebar, closeSidebar,
    propertiesOpen, closeProperties,
    isSaving,

    // Actions
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
  } = useWorkflowDesigner(initialTemplate);

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
          } />
        </div>
        <div className="flex-1 overflow-hidden pb-6 min-h-0">
          <div className={cn("h-full border-t flex flex-col relative", theme.border.default)}>
            <BuilderToolbar scale={scale} setScale={setScale} onToggleSidebar={toggleSidebar} />
            <div
              className="flex-1 flex overflow-hidden relative"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <BuilderPalette
                isOpen={sidebarOpen}
                onClose={closeSidebar}
                onAddNode={handleAddNodeFromPalette}
              />
              <BuilderCanvas
                nodes={nodes}
                connections={connections}
                selectedNodeId={selectedNodeId}
                scale={scale}
                pan={pan}
                setPan={setPan}
                canvasRef={canvasRef}
                onMouseDownNode={handleMouseDownNode}
                onBackgroundClick={handleBackgroundClick}
                selectedConnectionId={null} // TODO: Add connection support to hook
                onSelectConnection={() => { }}
                onAddConnection={() => { }}
              />
              <BuilderProperties
                isOpen={propertiesOpen}
                onClose={closeProperties}
                selectedNode={nodes.find(n => n.id === selectedNodeId) || null}
                onUpdateNode={updateNode}
                onDeleteNode={deleteNode}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
