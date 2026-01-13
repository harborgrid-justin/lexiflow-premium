/**
 * ProjectList.tsx
 * 
 * Scrollable list of project cards with expand/collapse functionality.
 * 
 * @module components/case-detail/projects/ProjectList
 * @category Case Management - Projects
 */

// External Dependencies
import { useState } from 'react';

// Internal Dependencies - Components
import { ProjectCard } from './ProjectCard';

// Types & Interfaces
import { Project } from '@/types';

interface ProjectListProps {
  projects: Project[];
  onAddTask: (projectId: string) => void;
  onUpdateTaskStatus: (projectId: string, taskId: string) => void;
  onNavigateToModule?: (module: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onAddTask, onUpdateTaskStatus, onNavigateToModule }) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(projects.find(p => p.status === 'In Progress')?.id || null);

  return (
    <div className="space-y-6">
      {projects.map((project) => (
          <ProjectCard 
              key={project.id}
              project={project}
              isExpanded={expandedProject === project.id}
              onToggleExpand={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
              onAddTask={onAddTask}
              onUpdateTaskStatus={onUpdateTaskStatus}
              onNavigateToModule={onNavigateToModule}
          />
      ))}
    </div>
  );
};
