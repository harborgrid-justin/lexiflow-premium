import React, { useState, useEffect } from 'react';
import { Project, WorkflowTask, ProjectId, CaseId } from '../../types';
import { Plus, Briefcase } from 'lucide-react';
import { Button } from '../common/Button';
import { TaskCreationModal } from '../common/TaskCreationModal';
import { ProjectList } from './projects/ProjectList';
import { ProjectModal } from './projects/ProjectModal';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';

interface CaseProjectsProps {
  projects: Project[]; // These come from parent initially, but we will fetch internal as well
  onAddProject: (project: Project) => void; // For optimistic update in parent
  onAddTask: (projectId: string, task: WorkflowTask) => void;
  onUpdateTaskStatus: (projectId: string, taskId: string) => void;
  onNavigateToModule?: (module: string) => void;
}

// Note: We are shifting to DataService but keeping props for backward compatibility with CaseDetail parent state logic
export const CaseProjects: React.FC<CaseProjectsProps> = ({ 
  projects: initialProjects, onAddProject, onAddTask, onUpdateTaskStatus, onNavigateToModule 
}) => {
  const { theme } = useTheme();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newTaskModalProjectId, setNewTaskModalProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  
  // Fetch real data if available (overriding parent props if we want independent loading)
  // For hybrid, we'll sync.
  useEffect(() => {
      if (initialProjects.length > 0 && initialProjects[0].caseId) {
           // Refetch to ensure we have latest from DB
           const load = async () => {
               const data = await DataService.projects.getByCaseId(initialProjects[0].caseId!);
               if (data.length > 0) setProjects(data);
           };
           load();
      }
  }, [initialProjects]);


  const handleCreateProject = async (newProjectData: Partial<Project>) => {
    if (!newProjectData.title) return;
    
    const project: Project = {
// FIX: Cast string to branded type ProjectId
      id: `proj-${Date.now()}` as ProjectId,
// FIX: Cast string to branded type CaseId
      caseId: (initialProjects[0]?.caseId || 'General') as CaseId,
      title: newProjectData.title,
      description: newProjectData.description,
      status: newProjectData.status as any,
      priority: newProjectData.priority as any,
      lead: newProjectData.lead,
      dueDate: newProjectData.dueDate,
      tasks: []
    };
    
    await DataService.projects.add(project);
    setProjects([...projects, project]);
    onAddProject(project); // Notify parent
    setIsNewProjectModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      {newTaskModalProjectId && (
        <TaskCreationModal 
            isOpen={true} 
            onClose={() => setNewTaskModalProjectId(null)}
            relatedItemTitle={projects.find(p => p.id === newTaskModalProjectId)?.title}
            relatedModule="Project"
            onSave={(task) => onAddTask(newTaskModalProjectId, task)}
        />
      )}

      <ProjectModal 
        isOpen={isNewProjectModalOpen} 
        onClose={() => setIsNewProjectModalOpen(false)} 
        onSave={handleCreateProject} 
      />

      {/* Header */}
      <div className={cn("flex flex-col md:flex-row justify-between items-center p-6 rounded-xl border shadow-sm gap-4 shrink-0", theme.surface, theme.border.default)}>
          <div>
              <h3 className={cn("text-lg font-bold mb-1", theme.text.primary)}>Case Projects</h3>
              <p className={cn("text-sm", theme.text.secondary)}>Manage parallel workstreams and group cross-functional tasks.</p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setIsNewProjectModalOpen(true)}>New Project</Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
            <div className={cn("text-center py-12 rounded-xl border-2 border-dashed h-64 flex flex-col items-center justify-center", theme.surfaceHighlight, theme.border.default)}>
                <Briefcase className={cn("h-12 w-12 mx-auto mb-3", theme.text.tertiary)}/>
                <p className={cn("font-medium", theme.text.secondary)}>No projects yet.</p>
                <button onClick={() => setIsNewProjectModalOpen(true)} className="text-blue-600 text-sm hover:underline mt-2">Create your first project</button>
            </div>
        ) : (
            <ProjectList 
                projects={projects}
                onAddTask={setNewTaskModalProjectId}
                onUpdateTaskStatus={onUpdateTaskStatus}
                onNavigateToModule={onNavigateToModule}
            />
        )}
      </div>
    </div>
  );
};