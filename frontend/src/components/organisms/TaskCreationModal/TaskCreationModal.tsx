/**
 * @module components/common/TaskCreationModal
 * @category Common
 * @description Modal for creating workflow tasks.
 *
 * THEME SYSTEM USAGE:
 * Inherits theme from Modal component.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { CheckSquare, Calendar, Link, Briefcase } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/data/dataService';
import { queryClient } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { useQuery } from '@/hooks/useQueryHooks';

// Hooks & Context
import { useNotify } from '@/hooks/useNotify';

// Components
import { Modal } from '@/components/molecules/Modal';
import { Input } from '@/components/atoms/Input';
import { TextArea } from '@/components/atoms/TextArea';
import { Button } from '@/components/atoms/Button';
import { RuleSelector } from '@/components/molecules/RuleSelector';
import { UserSelect } from '@/components/molecules/UserSelect';

// Types
import { WorkflowTask, TaskId, ProjectId, CaseId, User, TaskStatusBackend, TaskPriorityBackend } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
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
  const notify = useNotify();
  
  // Fetch users from backend API
  const { data: users = [] } = useQuery<User[]>(
    queryKeys.users.all(),
    () => DataService.users.getAll()
  );
  
  const [task, setTask] = useState<Partial<WorkflowTask>>({
    title: initialTitle || '',
    priority: TaskPriorityBackend.MEDIUM,
    status: TaskStatusBackend.TODO,
    assignee: 'James Doe',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    projectId: '',
    linkedRules: []
  });

  const handleSave = async () => {
    if (!task.title) return;
    
    const newTask: WorkflowTask = {
        id: `t-${Date.now()}` as TaskId,
        title: task.title!,
        status: TaskStatusBackend.TODO,
        assignee: task.assignee || 'Unassigned',
        dueDate: task.dueDate || '',
        priority: task.priority as any,
        description: task.description,
        relatedModule: relatedModule as any,
        relatedItemId: relatedItemId,
        relatedItemTitle: relatedItemTitle,
        actionLabel: `View ${relatedModule || 'Item'}`,
        projectId: task.projectId as ProjectId,
        linkedRules: task.linkedRules,
        caseId: 'General' as CaseId, // Default caseId
    };

    if (onSave) {
        onSave(newTask);
    } else {
        await DataService.tasks.add(newTask);
        queryClient.invalidate(queryKeys.tasks.all());
        queryClient.invalidate(queryKeys.dashboard.stats());
        notify.success("Task created. Completion will trigger billing prompt."); // User feedback for Opp #3
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Workflow Task">
      <div className="p-6 space-y-4">
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTask({...task, title: e.target.value})}
            autoFocus
        />
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <UserSelect 
                  label="Assignee"
                  value={task.assignee || ''}
                  onChange={(val) => setTask({...task, assignee: val})}
                  options={users}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTask({...task, dueDate: e.target.value})}
                        aria-label="Due Date"
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
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTask({...task, priority: e.target.value as any})}
                    aria-label="Priority"
                >
                    <option value={TaskPriorityBackend.LOW}>Low</option>
                    <option value={TaskPriorityBackend.MEDIUM}>Medium</option>
                    <option value={TaskPriorityBackend.HIGH}>High</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Link to Project</label>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                    <select 
                        className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={task.projectId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTask({...task, projectId: e.target.value as any})}
                        aria-label="Link to Project"
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
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTask({...task, description: e.target.value})}
        />

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" icon={CheckSquare} onClick={handleSave}>Create Task</Button>
        </div>
      </div>
    </Modal>
  );
};

