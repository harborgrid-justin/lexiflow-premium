
import React, { useState, useTransition } from 'react';
import { Modal } from './Modal.tsx';
import { Input, TextArea } from './Inputs.tsx';
import { Button } from './Button.tsx';
import { CheckSquare, Calendar, Link, Briefcase } from 'lucide-react';
import { WorkflowTask } from '../../types.ts';
import { RuleSelector } from './RuleSelector.tsx';
import { UserSelect } from './UserSelect.tsx';
import { MOCK_USERS } from '../../data/mockUsers.ts';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  relatedModule?: string;
  relatedItemId?: string;
  relatedItemTitle?: string;
  projects?: { id: string; title: string }[]; 
  onSave?: (task: WorkflowTask) => void;
}

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({ 
  isOpen, onClose, initialTitle, relatedModule, relatedItemId, relatedItemTitle, projects = [], onSave 
}) => {
  const [task, setTask] = useState<Partial<WorkflowTask>>({
    title: initialTitle || '',
    priority: 'Medium',
    status: 'Pending',
    assignee: 'James Doe',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    projectId: '',
    linkedRules: []
  });
  
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!task.title) return;
    
    startTransition(() => {
        const newTask: WorkflowTask = {
            id: `t-${Date.now()}`,
            title: task.title,
            status: 'Pending',
            assignee: task.assignee || 'Unassigned',
            dueDate: task.dueDate || '',
            priority: task.priority as any,
            description: task.description,
            relatedModule: relatedModule as any,
            relatedItemId: relatedItemId,
            relatedItemTitle: relatedItemTitle,
            actionLabel: `View ${relatedModule || 'Item'}`,
            projectId: task.projectId,
            linkedRules: task.linkedRules
        };

        if (onSave) {
            onSave(newTask);
        } else {
            alert("Task created and added to global workflow queue.");
            console.log("New Task Created:", newTask);
        }
        onClose();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Workflow Task">
      <div className={`p-6 space-y-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {relatedItemTitle && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800 flex items-center mb-4">
                <Link className="h-3 w-3 mr-2"/>
                Linked to {relatedModule}: <strong>{relatedItemTitle}</strong>
            </div>
        )}

        <Input 
            label="Task Title" 
            placeholder="e.g. Review Document" 
            value={task.title} 
            onChange={e => setTask({...task, title: e.target.value})}
            autoFocus
        />
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <UserSelect 
                  label="Assignee"
                  value={task.assignee || ''}
                  onChange={(val) => setTask({...task, assignee: val})}
                  options={MOCK_USERS}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Due Date</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                    <input 
                        type="date"
                        className="w-full pl-9 pr-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={task.dueDate}
                        onChange={e => setTask({...task, dueDate: e.target.value})}
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Priority</label>
                <select 
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={task.priority}
                    onChange={e => setTask({...task, priority: e.target.value as any})}
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Link to Project</label>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                    <select 
                        className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={task.projectId}
                        onChange={e => setTask({...task, projectId: e.target.value})}
                    >
                        <option value="">-- No Project --</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Governing Rules</label>
            <RuleSelector 
              selectedRules={task.linkedRules || []} 
              onRulesChange={rules => setTask({...task, linkedRules: rules})} 
            />
        </div>

        <TextArea 
            label="Instructions" 
            rows={3} 
            placeholder="Add specific instructions for the assignee..."
            value={task.description || ''}
            onChange={e => setTask({...task, description: e.target.value})}
        />

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" icon={CheckSquare} onClick={handleSave} isLoading={isPending}>Create Task</Button>
        </div>
      </div>
    </Modal>
  );
};
