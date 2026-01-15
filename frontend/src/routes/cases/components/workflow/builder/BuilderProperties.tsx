import { useModalState } from '@/hooks/core';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { TextArea } from '@/components/atoms/TextArea';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog/ConfirmDialog';
import { useTheme } from '@/theme';
import { Move, Settings, Trash2, X } from 'lucide-react';
import React from 'react';
import { WorkflowNode, getNodeIcon } from './types';

interface BuilderPropertiesProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: WorkflowNode | null;
  onUpdateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  onDeleteNode: (id: string) => void;
}

export function BuilderProperties({
  isOpen, onClose, selectedNode, onUpdateNode, onDeleteNode
}: BuilderPropertiesProps) {
  const { theme } = useTheme();
  const deleteModal = useModalState();
  const [nodeToDelete, setNodeToDelete] = React.useState<string | null>(null);

  const handleDeleteClick = () => {
    if (selectedNode) {
      setNodeToDelete(selectedNode.id);
      deleteModal.open();
    }
  };

  const confirmDelete = () => {
    if (nodeToDelete) {
      onDeleteNode(nodeToDelete);
      setNodeToDelete(null);
      onClose();
    }
  };

  return (
    <div className={cn(
      "absolute md:static inset-y-0 right-0 w-80 border-l z-30 shadow-2xl md:shadow-none transition-transform duration-300",
      theme.surface.default,
      theme.border.default,
      isOpen ? 'translate-x-0' : 'translate-x-full md:hidden'
    )}>
      <div className="h-full flex flex-col">
        <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default, theme.surface.highlight)}>
          <h4 className={cn("font-bold text-sm flex items-center", theme.text.primary)}>
            <Settings className="h-4 w-4 mr-2" /> Configuration
          </h4>
          <button onClick={onClose} className={cn(theme.text.tertiary, `hover:${theme.text.primary}`)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {selectedNode ? (
            <>
              <div>
                <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Label / Name</label>
                <Input
                  value={selectedNode.label}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateNode(selectedNode.id, { label: e.target.value })}
                />
              </div>

              <div>
                <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Component Type</label>
                <div className={cn("flex items-center gap-2 p-2 rounded border text-sm", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                  {getNodeIcon(selectedNode.type)}
                  {selectedNode.type}
                </div>
              </div>

              {selectedNode.type === 'Task' && (
                <>
                  <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Assignee Role</label>
                    <select
                      className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary, "focus:ring-2 focus:ring-blue-500")}
                      value={String(selectedNode.config.assignee || '')}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdateNode(selectedNode.id, { config: { ...selectedNode.config, assignee: e.target.value } })}
                    >
                      <option value="">Select Role...</option>
                      <option value="Senior Partner">Senior Partner</option>
                      <option value="Associate">Associate</option>
                      <option value="Paralegal">Paralegal</option>
                      <option value="Finance">Finance</option>
                      <option value="System">System (Automated)</option>
                    </select>
                  </div>

                  <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>SLA (Hours)</label>
                    <Input
                      type="number"
                      value={String(selectedNode.config.sla || '')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateNode(selectedNode.id, { config: { ...selectedNode.config, sla: e.target.value } })}
                    />
                  </div>
                </>
              )}

              <TextArea
                label="Description / Logic Instructions"
                rows={4}
                placeholder="Describe what needs to happen in this step..."
                value={String(selectedNode.config.description || '')}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateNode(selectedNode.id, { config: { ...selectedNode.config, description: e.target.value } })}
              />

              <div className={cn("pt-4 border-t", theme.border.default)}>
                <Button variant="danger" size="sm" icon={Trash2} onClick={handleDeleteClick} className="w-full">
                  Delete Node
                </Button>
              </div>
            </>
          ) : (
            <div className={cn("text-center py-10", theme.text.tertiary)}>
              <Move className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Select a node on the canvas to configure it.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={confirmDelete}
        title="Delete Workflow Node"
        message={`Are you sure you want to delete the node "${selectedNode?.label || 'Untitled'}"? This will also remove any connections to this node.`}
        variant="danger"
        confirmText="Delete Node"
      />
    </div>
  );
};
