
import React from "react";
import { useWorkflow } from "../logic/useWorkflow.js";
import { KanbanBoard, KanbanColumn, KanbanCard } from "../components/common/Kanban.tsx";
import { GitBranch, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const WorkflowBoard = () => {
  const { stages, tasks, completeTask } = useWorkflow();

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <header>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <GitBranch className="text-blue-600"/> Master Orchestration
        </h1>
        <p className="text-sm text-slate-500 font-medium">Visualizing firm-wide process velocity and bottleneck detection.</p>
      </header>

      <KanbanBoard>
        {stages.map(stage => (
          <KanbanColumn 
            key={stage.id} 
            title={stage.title} 
            count={stage.tasks.length}
          >
            {stage.tasks.map(task => (
              <KanbanCard key={task.id} className="group border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                   {task.status === 'Done' ? <CheckCircle size={14} className="text-green-500"/> : <Clock size={14} className="text-slate-300"/>}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.assignee}</span>
                   {task.status !== 'Done' && (
                     <button 
                       onClick={() => completeTask(task.id)}
                       className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
                     >
                       MARK DONE
                     </button>
                   )}
                </div>
              </KanbanCard>
            ))}
          </KanbanColumn>
        ))}
      </KanbanBoard>
    </div>
  );
};

export default WorkflowBoard;
