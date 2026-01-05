
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Badge } from '../common/Badge.tsx';
import { Calendar, AlertCircle } from 'lucide-react';
import { WorkflowTask } from '../../types.ts';

interface CalendarDeadlinesProps {
  tasks: WorkflowTask[];
}

export const CalendarDeadlines: React.FC<CalendarDeadlinesProps> = ({ tasks }) => {
  const deadlines = tasks.filter(t => t.dueDate).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-4 relative group/container h-full">
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-center justify-between gap-3">
        <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0"/>
            <div>
            <h4 className="font-bold text-amber-800 text-sm">Deadline Calculation Rules Active</h4>
            <p className="text-xs text-amber-700">Dates calculated based on FRCP and Local Rules (CA Superior). Weekends/Holidays excluded where applicable.</p>
            </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <TableContainer>
            <TableHeader>
            <TableHead>Due Date</TableHead>
            <TableHead>Event Description</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            </TableHeader>
            <TableBody>
            {deadlines.map(d => (
                <TableRow key={d.id}>
                <TableCell className="font-bold text-slate-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400"/> {d.dueDate}
                </TableCell>
                <TableCell className="font-medium text-slate-900">{d.title}</TableCell>
                <TableCell>{d.assignee}</TableCell>
                <TableCell><Badge variant={d.priority === 'High' ? 'error' : 'neutral'}>{d.priority}</Badge></TableCell>
                <TableCell>
                    <Badge variant={d.status === 'Done' ? 'success' : 'warning'}>
                    {d.status}
                    </Badge>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </TableContainer>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {deadlines.map(d => (
            <div key={d.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <span className="flex items-center text-sm font-bold text-slate-900">
                        <Calendar className="h-4 w-4 mr-2 text-slate-500"/> {d.dueDate}
                    </span>
                    <Badge variant={d.priority === 'High' ? 'error' : 'neutral'}>
                        {d.priority}
                    </Badge>
                </div>
                <h4 className="text-sm font-semibold text-blue-600 mb-1">{d.title}</h4>
                <p className="text-xs text-slate-500 mb-2">Assignee: {d.assignee}</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Status: <strong>{d.status}</strong></span>
                </div>
            </div>
        ))}
      </div>

      <div className="absolute bottom-2 right-2 opacity-0 group-hover/container:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded pointer-events-none z-20">
        CAL-02
      </div>
    </div>
  );
};
