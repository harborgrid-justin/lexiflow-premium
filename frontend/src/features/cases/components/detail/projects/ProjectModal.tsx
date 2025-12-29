/**
 * ProjectModal.tsx
 * 
 * Project creation/editing modal with name, description, lead, and deadline fields.
 * 
 * @module components/case-detail/projects/ProjectModal
 * @category Case Management - Projects
 */

// External Dependencies
import React, { useState } from 'react';

// Internal Dependencies - Components
import { Modal } from '@/components/molecules';
import { Input, TextArea } from '@/components/atoms';
import { Button } from '@/components/atoms';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Types & Interfaces
import { Project } from '@/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave }) => {
  const { theme } = useTheme();
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    lead: 'Current User'
  });

  const handleSave = () => {
    onSave(newProject);
    setNewProject({ name: '', description: '', status: 'Not Started', priority: 'Medium' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <div className="p-6 space-y-4">
        <Input 
          label="Project Title" 
          placeholder="e.g. Expert Witness Prep" 
          value={newProject.title} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProject({...newProject, title: e.target.value})}
        />
        <TextArea 
          label="Description" 
          rows={3} 
          placeholder="Objectives and scope..." 
          value={newProject.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewProject({...newProject, description: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Status</label>
            <select 
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.input, theme.border.default, theme.text.primary)}
              value={newProject.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewProject({...newProject, status: e.target.value as Project['status']})}
              aria-label="Project status"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Priority</label>
            <select 
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.input, theme.border.default, theme.text.primary)}
              value={newProject.priority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewProject({...newProject, priority: e.target.value as Project['priority']})}
              aria-label="Project priority"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Lead" 
            value={newProject.lead} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProject({...newProject, lead: e.target.value})}
          />
          <Input 
            type="date"
            label="Due Date" 
            value={newProject.dueDate || ''} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProject({...newProject, dueDate: e.target.value})}
          />
        </div>
        <div className={cn("flex justify-end pt-4 border-t mt-4", theme.border.subtle)}>
          <Button variant="secondary" onClick={onClose} className="mr-2">Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Create Project</Button>
        </div>
      </div>
    </Modal>
  );
};
