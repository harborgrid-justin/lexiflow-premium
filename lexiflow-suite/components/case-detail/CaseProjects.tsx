
import React, { useState, useTransition } from 'react';
import { Project, WorkflowTask } from '../../types.ts';
import { 
  Plus, CheckCircle, Clock, FileText, DollarSign, Scale, Gavel, 
  Layout, ChevronDown, ChevronUp, Box, Briefcase, Calendar, User
} from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';
import { Modal } from '../common/Modal.tsx';
import { Input, TextArea } from '../common/Inputs.tsx';
import { TaskCreationModal } from '../common/TaskCreationModal.tsx';
import { Badge } from '../common/Badge.tsx';

interface CaseProjectsProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onAddTask: (projectId: string, task: WorkflowTask) => void;
  onUpdateTaskStatus: (projectId: string, taskId: string) => void;
  onNavigateToModule?: (module: string) => void;
}

export const CaseProjects: React.FC<CaseProjectsProps> = ({ 
  projects, onAddProject, onAddTask, onUpdateTaskStatus, onNavigateToModule 
}) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(projects.find(p => p.status === 'Active')?.id || null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newTaskModalProjectId, setNewTaskModalProjectId] = useState<string | null>(null);
  
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '', description: '', status: 'Planning', priority: 'Medium', lead: 'Current User'
  });

  const [isPending, startTransition] = useTransition();

  const toggleProject = (id: string) => {
      startTransition(() => {
        setExpandedProject(expandedProject === id ? null : id);
      });
  };

  const handleCreateProject = () => {
    if (!newProject.title) return;
    const project: Project = {
      id: `proj-${Date.now()}`,
      title: newProject.title,
      description: newProject.description,
      status: newProject.status as any,
      priority: newProject.priority as any,
      lead: newProject.lead,
      dueDate: newProject.dueDate,
      tasks: []
    };
    onAddProject(project);
    setIsNewProjectModalOpen(false);
    setNewProject({ title: '', description: '', status: 'Planning', priority: 'Medium', lead: 'Current User' });
  };

  const getModuleIcon = (module?: string) => {
      switch(module) {
          case 'Documents': return <FileText className="h-3 w-3"/>;
          case 'Billing': return <DollarSign className="h-3 w-3"/>;
          case 'Discovery': return <Scale className="h-3 w-3"/>;
          case 'Motions': return <Gavel className="h-3 w-3"/>;
          case 'Evidence': return <Box className="h-3 w-3"/>;
          default: return <Layout className="h-3 w-3"/>;
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Active': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
          case 'On Hold': return 'bg-amber-100 text-amber-700 border-amber-200';
          default: return 'bg-slate-100 text-slate-600 border-slate-200';
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {newTaskModalProjectId && (
        <TaskCreationModal 
            isOpen={true} 
            onClose={() => setNewTaskModalProjectId(null)}
            relatedItemTitle={projects.find(p => p.id === newTaskModalProjectId)?.title}
            relatedModule="Project"
            onSave={(task) => onAddTask(newTaskModalProjectId, task)}
        />
      )}

      {/* New Project Modal */}
      <Modal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} title="Create New Project">
          <div className="p-6 space-y-4">
              <Input label="Project Title" placeholder="e.g. Expert Witness Prep" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
              <TextArea label="Description" rows={3} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                      <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value as any})}>
                          <option value="Planning">Planning</option>
                          <option value="Active">Active</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Completed">Completed</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Priority</label>
                      <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" value={newProject.priority} onChange={e => setNewProject({...newProject, priority: e.target.value as any})}>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                      </select>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <Input label="Lead" value={newProject.lead} onChange={e => setNewProject({...newProject, lead: e.target.value})} />
                  <Input type="date" label="Due Date" value={newProject.dueDate || ''} onChange={e => setNewProject({...newProject, dueDate: e.target.value})} />
              </div>
              <div className="flex justify-end pt-6 border-t border-slate-100 mt-2 gap-2">
                  <Button variant="secondary" onClick={() => setIsNewProjectModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleCreateProject}>Create Project</Button>
              </div>
          </div>
      </Modal>

      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
          <div>
              <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2"><Briefcase className="h-5 w-5 text-blue-600"/> Case Projects</h3>
              <p className="text-sm text-slate-500 font-medium">Workstreams and task groupings.</p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setIsNewProjectModalOpen(true)} className="w-full sm:w-auto">New Project</Button>
      </div>

      <div className={`space-y-4 transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
        {projects.length === 0 && (
            <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <div className="bg-slate-100 p-4 rounded-full w-fit mx-auto mb-3"><Briefcase className="h-8 w-8 text-slate-300"/></div>
                <p className="text-slate-500 font-bold text-sm">No projects found.</p>
                <p className="text-xs text-slate-400 mt-1">Create a project to organize tasks.</p>
            </div>
        )}

        {projects.map((project) => {
            const isExpanded = expandedProject === project.id;
            const totalTasks = project.tasks.length;
            const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            return (
                <div key={project.id} className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${project.priority === 'Critical' ? 'border-l-4 border-l-red-500' : 'border-slate-200'} shadow-sm group`}>
                    <div 
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-slate-50 gap-4"
                        onClick={() => toggleProject(project.id)}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                <h4 className="font-bold text-lg text-slate-900 leading-snug">{project.title}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-1 mb-2 font-medium">{project.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100"><UserAvatar name={project.lead || 'Unknown'} size="sm" className="w-5 h-5 text-[9px]"/> {project.lead}</span>
                                {project.dueDate && <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100"><Calendar className="h-3 w-3 text-slate-400"/> {project.dueDate}</span>}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0">
                            <div className="flex-1 md:w-48">
                                <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-500 uppercase tracking-wide">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                            <button className="text-slate-300 group-hover:text-slate-600 p-1 hover:bg-slate-200 rounded transition-colors hidden sm:block">
                                {isExpanded ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                            </button>
                        </div>
                    </div>

                    {isExpanded && (
                        <div className="bg-slate-50 border-t border-slate-200 p-4 space-y-3 animate-in slide-in-from-top-2">
                            {project.tasks.map((task) => (
                                <div key={task.id} className="group/task flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 hover:shadow-sm hover:border-blue-300 transition-all">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <button 
                                            onClick={() => onUpdateTaskStatus(project.id, task.id)}
                                            className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'Done' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-blue-500 text-transparent'}`}
                                        >
                                            <CheckCircle className="h-3.5 w-3.5 fill-current"/>
                                        </button>
                                        <div className="min-w-0">
                                            <h5 className={`text-sm font-bold truncate ${task.status === 'Done' ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900'}`}>{task.title}</h5>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                                <span className="font-medium bg-slate-100 px-1.5 rounded">{task.assignee}</span>
                                                {task.priority === 'High' && <span className="text-red-700 font-bold bg-red-50 px-1.5 rounded border border-red-100">CRITICAL</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {task.relatedModule && onNavigateToModule && (
                                        <button 
                                            onClick={() => onNavigateToModule(task.relatedModule!)}
                                            className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-1 font-bold uppercase tracking-wide shrink-0"
                                        >
                                            {getModuleIcon(task.relatedModule)} {task.actionLabel || 'View'}
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button 
                                onClick={() => setNewTaskModalProjectId(project.id)}
                                className="w-full py-3 text-xs font-bold text-blue-600 bg-white border-2 border-dashed border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="h-3.5 w-3.5"/> Add Task
                            </button>
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};
