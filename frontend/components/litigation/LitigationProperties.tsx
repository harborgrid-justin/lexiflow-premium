
/**
 * LitigationProperties.tsx
 * 
 * Properties panel for editing selected nodes or connections in the strategy canvas.
 * Allows configuring node labels, probabilities, and descriptions.
 * 
 * @module components/litigation/LitigationProperties
 */

import React from 'react';
import { Settings, X, BookOpen } from 'lucide-react';

// Internal Components
import { Button } from '../common/Button';
import { Input, TextArea } from '../common/Inputs';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Utils
import { cn } from '../../utils/cn';

// Types
import { LitigationPropertiesProps } from './types';

export const LitigationProperties: React.FC<LitigationPropertiesProps> = ({
  isOpen, onClose, selectedNode, selectedConnection, onUpdateNode, onDeleteNode, onUpdateConnection, onDeleteConnection
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const renderNodeProperties = () => (
    <>
        <div className="space-y-6">
            <Input 
                label="Stage / Motion Name"
                value={selectedNode!.label}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateNode(selectedNode!.id, { label: e.target.value })}
            />

            {selectedNode!.type === 'Decision' && (
                <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Success Probability</label>
                    <div className="flex items-center gap-3">
                        <input 
                            type="range" 
                            min="0" max="100" 
                            value={selectedNode!.config.probability || 50}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateNode(selectedNode!.id, { config: { ...selectedNode!.config, probability: parseInt(e.target.value) } })}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="font-mono text-sm font-bold w-12 text-right">{selectedNode!.config.probability || 50}%</span>
                    </div>
                </div>
            )}

            <TextArea 
                label="Strategic Notes"
                rows={4}
                placeholder="Why are we filing this? What is the probability of success?"
                value={selectedNode!.config.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateNode(selectedNode!.id, { config: { ...selectedNode!.config, description: e.target.value } })}
            />
        </div>
        <div className={cn("pt-4 mt-auto border-t flex flex-col gap-2", theme.border.default)}>
            <Button variant="outline" icon={BookOpen}>View Applicable Rule</Button>
            <Button variant="danger" onClick={() => onDeleteNode(selectedNode!.id)}>Remove Node</Button>
        </div>
    </>
  );

  const renderConnectionProperties = () => (
    <>
      <div className="space-y-4">
        <Input 
            label="Condition / Label"
            value={selectedConnection!.label || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateConnection(selectedConnection!.id, { label: e.target.value })}
            placeholder="e.g., Granted, Default"
        />
        <div className={cn("text-xs p-2 rounded border", theme.surface.highlight, theme.border.default)}>
            <p>From: <span className="font-mono">{selectedConnection!.from}</span></p>
            <p>To: <span className="font-mono">{selectedConnection!.to}</span></p>
        </div>
      </div>
      <div className={cn("pt-4 mt-auto border-t", theme.border.default)}>
        <Button variant="danger" onClick={() => onDeleteConnection(selectedConnection!.id)}>Delete Connection</Button>
      </div>
    </>
  );

  return (
    <div className={cn(
      "absolute md:static inset-y-0 right-0 w-80 border-l z-30 shadow-2xl md:shadow-none transition-transform duration-300 flex flex-col",
      theme.surface.default,
      theme.border.default,
      isOpen ? 'translate-x-0' : 'translate-x-full'
    )}>
      <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default, theme.surface.highlight)}>
          <h4 className={cn("font-bold text-sm flex items-center", theme.text.primary)}>
            <Settings className="h-4 w-4 mr-2" /> {selectedConnection ? 'Connection' : 'Node'} Properties
          </h4>
          <button onClick={onClose} className={cn(theme.text.tertiary, `hover:${theme.text.primary}`)}>
            <X className="h-4 w-4" />
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {selectedNode ? renderNodeProperties() : selectedConnection ? renderConnectionProperties() : (
            <div className={cn("text-center py-10 text-sm", theme.text.tertiary)}>
                Select a node or connection to configure.
            </div>
        )}
      </div>
    </div>
  );
};
