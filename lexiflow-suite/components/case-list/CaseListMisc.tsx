
import React, { useState, useTransition } from 'react';
import { ShieldAlert, Search, AlertCircle, Mic2, Plus, FileCheck, ArrowRight, Archive, CheckSquare, Filter, FileText, Scale, Box, Gavel } from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Badge } from '../common/Badge.tsx';
import { TaskCreationModal } from '../common/TaskCreationModal.tsx';
import { MOCK_TASKS } from '../../data/mockWorkflow.ts';
import { WorkflowTask } from '../../types.ts';
import { Skeleton } from '../common/Primitives.tsx';

export const CaseListConflicts: React.FC = () => (
  <div className="max-w-2xl mx-auto mt-8 space-y-6">
    <div className="text-center">
      <div className="bg-slate-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
        <ShieldAlert className="h-10 w-10 text-slate-400"/>
      </div>
      <h3 className="text-xl font-bold text-slate-900">Global Conflict Search</h3>
      <p className="text-slate-500">Search across all matters, parties, and intakes.</p>
    </div>
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500"/>
      <input className="w-full pl-12 pr-28 py-4 rounded-full border border-slate-300 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all" placeholder="Enter name or entity..." />
      <button className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-full font-medium hover:bg-blue-700 transition-colors">Search</button>
    </div>
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <h4 className="font-bold text-amber-800 text-sm mb-2 flex items-center"><AlertCircle className="h-4 w-4 mr-2"/> Recent Potential Hits</h4>
      <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
        <li><strong>John Smith</strong> matched in <em>State v. GreenEnergy</em> (Witness)</li>
        <li><strong>Acme Corp</strong> matched in <em>Archive 2019-044</em> (Opposing Party)</li>
      </ul>
    </div>
  </div>
);

interface CaseListTasksProps {
  isLoading?: boolean;
}

export const CaseListTasks: React.FC<CaseListTasksProps> = ({ isLoading = false }) => {
  const [tasks, setTasks] = useState<WorkflowTask[]>(MOCK_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  
  const [isPending, startTransition] = useTransition();

  const getModuleIcon = (module?: string) => {
      switch(module) {
          case 'Documents': return <FileText className="h-3 w-3 mr-1 text-slate-500"/>;
          case 'Discovery': return <Scale className="h-3 w-3 mr-1 text-purple-500"/>;
          case 'Evidence': return <Box className="h-3 w-3 mr-1 text-amber-500"/>;
          case 'Motions': return <Gavel className="h-3 w-3 mr-1 text-blue-500"/>;
          default: return null;
      }
  };

  const handleFilterChange = (val: string) => {
      startTransition(() => {
          setFilter(val);
      });
  };

  const filteredTasks = tasks.filter(t => {
      if (filter === 'All') return true;
      if (filter === 'Pending') return t.status === 'Pending' || t.status === 'In Progress';
      if (filter === 'High Priority') return t.priority === 'High';
      return true;
  });

  const handleAddTask = (newTask: WorkflowTask) => {
      startTransition(() => {
          setTasks([newTask, ...tasks]);
      });
  };

  const handleToggle = (id: string) => {
      startTransition(() => {
          setTasks.map(t => t.id === id ? { ...t, status: t.status === 'Done' ? 'Pending' : 'Done' } : t);
      });
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {isModalOpen && <TaskCreationModal isOpen={true} onClose={() => setIsModalOpen(false)} onSave={handleAddTask} />}
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <div>
            <h3 className="font-bold text-slate-900">Task Manager</h3>
            <p className="text-sm text-slate-500">Cross-module workflow & assignments</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <select 
                className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-md px-3 py-1.5 outline-none" 
                value={filter} 
                onChange={e => handleFilterChange(e.target.value)}
                disabled={isLoading}
            >
                <option value="All">All Tasks</option>
                <option value="Pending">Pending</option>
                <option value="High Priority">High Priority</option>
            </select>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)} disabled={isLoading}>Add Task</Button>
        </div>
      </div>

      <div className={`bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 shadow-sm flex-1 overflow-y-auto transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-start">
                    <Skeleton className="h-5 w-5 rounded mr-4 mt-1" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-16 rounded" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <>
                {filteredTasks.length === 0 && <div className="p-8 text-center text-slate-400">No tasks found.</div>}
                {filteredTasks.map(t => (
                <div key={t.id} className="p-4 flex items-start hover:bg-slate-50 transition-colors group cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="h-5 w-5 text-blue-600 rounded border-slate-300 mr-4 cursor-pointer mt-1" 
                        checked={t.status === 'Done'}
                        onChange={() => handleToggle(t.id)}
                    />
                    <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <p className={`text-sm font-bold ${t.status === 'Done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{t.title}</p>
                        <Badge variant={t.priority === 'High' ? 'error' : t.priority === 'Medium' ? 'warning' : 'neutral'}>{t.priority}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center">
                        {t.relatedModule && <span className="flex items-center mr-3 bg-slate-100 px-1.5 py-0.5 rounded">{getModuleIcon(t.relatedModule)} {t.relatedModule}</span>}
                        <span className="mr-3">Due: {t.dueDate}</span>
                        <span>Assignee: {t.assignee}</span>
                    </p>
                    {t.relatedItemTitle && (
                        <p className="text-xs text-blue-600 mt-1 pl-2 border-l-2 border-blue-200">
                            Linked: {t.relatedItemTitle}
                        </p>
                    )}
                    </div>
                </div>
                ))}
            </>
        )}
      </div>
    </div>
  );
};

export const CaseListReporters: React.FC = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
      <Mic2 className="h-10 w-10 text-slate-400"/>
    </div>
    <h3 className="text-xl font-medium text-slate-900">Court Reporter Directory</h3>
    <p className="text-slate-500 max-w-sm mx-auto mt-2">Manage preferred reporting agencies, individual reporters, and video services.</p>
    <Button variant="primary" className="mt-6" icon={Plus}>Add Agency</Button>
  </div>
);

export const CaseListClosing: React.FC = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
      <FileCheck className="h-10 w-10 text-slate-400"/>
    </div>
    <h3 className="text-xl font-medium text-slate-900">Closing Binder Generator</h3>
    <p className="text-slate-500 max-w-sm mx-auto mt-2">Compile all final pleadings, orders, and executed agreements into a searchable PDF binder.</p>
    <Button variant="primary" className="mt-6" icon={ArrowRight}>Start New Binder</Button>
  </div>
);

export const CaseListArchived: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-slate-100 p-4 rounded text-center text-slate-500 italic text-sm border border-slate-200">
      Showing cases closed in the last 12 months. Older cases are in Cold Storage.
    </div>
    <TableContainer>
      <TableHeader>
        <TableHead>Closed Date</TableHead>
        <TableHead>Matter</TableHead>
        <TableHead>Client</TableHead>
        <TableHead>Outcome</TableHead>
        <TableHead className="text-right">Action</TableHead>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-slate-500 font-mono text-xs">Jan 15, 2023</TableCell>
          <TableCell className="font-medium text-slate-900">State v. GreenEnergy</TableCell>
          <TableCell>GreenEnergy Corp</TableCell>
          <TableCell><Badge variant="success">Settled</Badge></TableCell>
          <TableCell className="text-right"><Button variant="ghost" size="sm">Retrieve</Button></TableCell>
        </TableRow>
      </TableBody>
    </TableContainer>
  </div>
);
