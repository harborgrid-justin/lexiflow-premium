/**
 * Matter Operations Center - Centralized Operations Hub
 * 
 * @module MatterOperationsCenter
 * @description Task management, collaboration, and workflow coordination
 * 
 * Features:
 * - Task management and assignment
 * - Team collaboration tools
 * - Document workflow
 * - Deadline tracking
 * - Resource allocation
 * - Activity timeline
 * - Communication hub
 * - Workflow automation
 */

import React, { useState, useMemo } from 'react';
import {
  CheckSquare, Users, FileText, Clock, Calendar, MessageSquare,
  Activity, Filter, Search, Plus, List, Grid, Kanban, Loader2
} from 'lucide-react';
import { useQuery } from '@/hooks/useQueryHooks';
import { api } from '@/services/api';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '@/utils/cn';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';

type ViewMode = 'list' | 'kanban' | 'calendar';

export const MatterOperationsCenter: React.FC = () => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch tasks from workflow API
  const { data: tasks, isLoading: tasksLoading } = useQuery(
    ['workflow', 'tasks'],
    () => api.workflow.getTasks()
  );

  // Fetch team members
  const { data: teamMembers } = useQuery(
    ['users', 'team'],
    () => api.users.getAll()
  );

  // Calculate stats from actual data
  const stats = useMemo(() => {
    if (!tasks) return { active: 0, dueToday: 0, inProgress: 0, completed: 0 };
    
    const today = new Date().toDateString();
    return {
      active: tasks.filter(t => t.status === 'ACTIVE' || t.status === 'PENDING').length,
      dueToday: tasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate).toDateString() === today;
      }).length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    if (filterStatus === 'all') return tasks;
    return tasks.filter(t => t.status.toLowerCase() === filterStatus);
  }, [tasks, filterStatus]);

  return (
    <div className={cn('h-full flex flex-col', theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50')}>
      <div className={cn('border-b px-6 py-4', theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('flex items-center gap-1 p-1 rounded-lg', theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100')}>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-2 rounded',
                  viewMode === 'list'
                    ? theme === 'dark' ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-900 shadow-sm'
                    : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn('p-2 rounded',
                  viewMode === 'kanban'
                    ? theme === 'dark' ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-900 shadow-sm'
                    : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={cn('p-2 rounded',
                  viewMode === 'calendar'
                    ? theme === 'dark' ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-900 shadow-sm'
                    : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')} />
            <input
              type="text"
              placeholder="Search tasks, documents, or team members..."
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg border text-sm',
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
              )}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={cn(
              'px-4 py-2 rounded-lg border text-sm',
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-slate-100'
                : 'bg-white border-slate-300 text-slate-900'
            )}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Active Tasks" value={stats.active.toString()} theme={theme} />
          <StatCard title="Due Today" value={stats.dueToday.toString()} theme={theme} />
          <StatCard title="In Progress" value={stats.inProgress.toString()} theme={theme} />
          <StatCard title="Completed" value={stats.completed.toString()} theme={theme} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <h3 className={cn('text-lg font-semibold mb-4', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
              Active Tasks
            </h3>
            {tasksLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className={cn('text-center py-8 text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
                No tasks found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.slice(0, 10).map((task) => (
                  <TaskItem key={task.id} task={task} theme={theme} />
                ))}
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className={cn('text-lg font-semibold mb-4', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
                Team Activity
              </h3>
              <div className="space-y-3">
                {teamMembers?.slice(0, 5).map((member) => (
                  <ActivityItem key={member.id} member={member} theme={theme} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; theme: string }> = ({ title, value, theme }) => (
  <Card className="p-4">
    <div className={cn('text-xs font-medium mb-1', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
      {title}
    </div>
    <div className={cn('text-2xl font-bold', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
      {value}
    </div>
  </Card>
);

const TaskItem: React.FC<{ task: any; theme: string }> = ({ task, theme }) => (
  <div className={cn('p-4 rounded-lg border', theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white')}>
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3 flex-1">
        <input type="checkbox" className="mt-1" checked={task.status === 'COMPLETED'} readOnly />
        <div className="flex-1">
          <div className={cn('font-medium', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>
            {task.title || task.description}
          </div>
          <div className={cn('text-sm mt-1', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
            {task.matterTitle || 'General Task'}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {task.priority === 'HIGH' && <Badge variant="error">High Priority</Badge>}
            {task.priority === 'MEDIUM' && <Badge variant="warning">Medium Priority</Badge>}
            {task.dueDate && (
              <span className={cn('text-xs', theme === 'dark' ? 'text-slate-500' : 'text-slate-500')}>
                Due {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ActivityItem: React.FC<{ member: any; theme: string }> = ({ member, theme }) => (
  <div className="flex gap-3">
    <div className={cn('w-2 h-2 rounded-full mt-2', 'bg-blue-500')} />
    <div className="flex-1">
      <div className={cn('text-sm font-medium', theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
        {member.name || member.email}
      </div>
      <div className={cn('text-xs mt-1', theme === 'dark' ? 'text-slate-500' : 'text-slate-500')}>
        {member.role || 'Team Member'}
      </div>
    </div>
  </div>
);
