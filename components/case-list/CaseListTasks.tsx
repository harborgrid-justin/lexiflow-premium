
import React, { useState, useEffect } from 'react';
import { Plus, FileText, Scale, Box, Gavel, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { TaskCreationModal } from '../common/TaskCreationModal';
import { WorkflowTask, Case } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';

interface CaseListTasksProps {
  onSelectCase?: (c: Case) => void;
}

export const CaseListTasks: React.FC<CaseListTasksProps> = ({ onSelectCase }) => {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const { theme } = useTheme();

  useEffect(() => {
      const load = async () => {
          const data = await DataService.tasks.getAll();
          setTasks(data);
      };
      load();
  }, []);

  const getModuleIcon = (module?: string) => {
      switch(module) {
          case 'Documents': return <FileText className={cn("h-3 w-3 mr-1", theme.text.tertiary)}/>;
          case 'Discovery': return <Scale className="h-3 w-3 mr-1 text-purple-500"/>;
          case 'Evidence': return <Box className="h-3 w-3 mr-1 text-amber-500"/>;
          case 'Motions': return <Gavel className="h-3 w-3 mr-1 text-blue-500"/>;
          default: return null;
      }
  };

  const filteredTasks = tasks.filter(t => {
      if (filter === 'All') return true;
      if (filter === 'Pending') return t.status === 'Pending' || t.status === 'In Progress';
      if (filter === 'High Priority') return t.priority === 'High';
      return true;
  });

  const handleAddTask = async (newTask: WorkflowTask) => {
      await DataService.tasks.add(newTask);
      const updated = await DataService.tasks.getAll();
      setTasks(updated);
  };

  const handleToggle = async (id: string) => {
      const task = tasks.find(t => t.id === id);
      if (task) {
          const newStatus = task.status === 'Done' ? 'Pending' : 'Done';
          await DataService.tasks.update(id, { status: newStatus as any });
          setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
      }
  };

  const handleTaskClick = async (task: WorkflowTask) => {
      if (task.caseId && onSelectCase) {
          const found = await DataService.cases.getById(task.caseId);
          if (found) onSelectCase(found);
      }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {isModalOpen && <TaskCreationModal isOpen={true} onClose={() => setIsModalOpen(false)} onSave={handleAddTask} />}
      
      <div className={cn("flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-lg border shadow-sm", theme.surface, theme.border.default)}>
        <div>
            <h3 className={cn("font-bold", theme.text.primary)}>Task Manager</h3>
            <p className={cn("text-sm", theme.text.secondary)}>Cross-module workflow & assignments</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <select 
              className={cn("border text-sm rounded-md px-3 py-1.5 outline-none", theme.surface, theme.border.default, theme.text.primary)} 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
            >
                <option value="All">All Tasks</option>
                <option value="Pending">Pending</option>
                <option value="High Priority">High Priority</option>
            </select>
            <button 
              onClick={() => setIsModalOpen(true)}
              className={cn("flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors", theme.primary.DEFAULT, theme.text.inverse, theme.primary.hover)}
            >
              <Plus className="h-4 w-4 mr-2"/> Add Task
            </button>
        </div>
      </div>

      <div className={cn("rounded-lg border divide-y shadow-sm flex-1 overflow-y-auto", theme.surface, theme.border.default, theme.border.light)}>
        {filteredTasks.length === 0 && <div className={cn("p-8 text-center", theme.text.tertiary)}>No tasks found.</div>}
        {filteredTasks.map(t => (
          <div key={t.id} className={cn("p-4 flex items-start transition-colors group", `hover:${theme.surfaceHighlight}`)}>
            <div className="pt-0.5 mr-4">
                <input 
                    type="checkbox" 
                    className="h-5 w-5 text-blue-600 rounded border-slate-300 cursor-pointer" 
                    checked={t.status === 'Done'}
                    onChange={() => handleToggle(t.id)}
                />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                  <p className={cn("text-sm font-bold truncate pr-2", t.status === 'Done' ? "text-slate-400 line-through" : theme.text.primary)}>{t.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={t.priority === 'High' ? 'error' : t.priority === 'Medium' ? 'warning' : 'neutral'}>{t.priority}</Badge>
                    {t.caseId && (
                        <button 
                            onClick={() => handleTaskClick(t)}
                            className={cn("flex items-center px-2 py-1 rounded text-[10px] font-medium transition-colors border border-transparent", "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-200")}
                            title="Go to Case"
                        >
                            Case <ArrowRight className="h-3 w-3 ml-1"/>
                        </button>
                    )}
                  </div>
              </div>
              <p className={cn("text-xs mt-1 flex items-center", theme.text.secondary)}>
                  {t.relatedModule && <span className={cn("flex items-center mr-3 px-1.5 py-0.5 rounded", theme.surfaceHighlight)}>{getModuleIcon(t.relatedModule)} {t.relatedModule}</span>}
                  <span className="mr-3">Due: {t.dueDate}</span>
                  <span>Assignee: {t.assignee}</span>
              </p>
              {t.relatedItemTitle && (
                  <p className={cn("text-xs mt-1 pl-2 border-l-2 truncate opacity-80", theme.primary.text, theme.primary.border)}>
                      Linked: {t.relatedItemTitle}
                  </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
