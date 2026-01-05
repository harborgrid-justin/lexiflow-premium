
import React, { useTransition } from 'react';
import { Card } from '../common/Card.tsx';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { UserPlus, FileCheck, RefreshCw, Play, Database, ShieldAlert, Scale, Archive, Lock, MoreHorizontal, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Process {
  id: string;
  name: string;
  status: string;
  triggers: string;
  tasks: number;
  completed: number;
  owner: string;
}

export const FirmProcessList: React.FC<{ processes: Process[], onSelectProcess?: (id: string) => void }> = ({ processes, onSelectProcess }) => {
  const [isPending, startTransition] = useTransition();

  const handleSelect = (id: string) => {
      if (onSelectProcess) {
          startTransition(() => onSelectProcess(id));
      }
  };

  const getProcessIcon = (name: string) => {
    if (name.includes('Client')) return <UserPlus className="h-5 w-5 text-blue-600"/>;
    if (name.includes('Billing')) return <FileCheck className="h-5 w-5 text-green-600"/>;
    if (name.includes('Audit')) return <ShieldAlert className="h-5 w-5 text-red-600"/>;
    return <RefreshCw className="h-5 w-5 text-gray-600"/>;
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${isPending ? 'opacity-50 grayscale' : 'opacity-100'}`}>
        {processes.map(bp => {
            const pct = Math.round((bp.completed / bp.tasks) * 100);
            return (
            <Card key={bp.id} noPadding className="flex flex-col h-full hover:border-blue-400 hover:shadow-xl transition-all group cursor-pointer rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div 
                    className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50"
                    onClick={() => handleSelect(bp.id)}
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:shadow-md transition-all border border-slate-200">
                            {getProcessIcon(bp.name)}
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors leading-tight">{bp.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{bp.owner}</p>
                        </div>
                    </div>
                    <Badge variant={bp.status === 'Active' ? 'success' : 'neutral'} className="shadow-inner">{bp.status}</Badge>
                </div>
                
                <div className="p-6 flex-1 flex gap-6 items-center">
                    {/* Donut Progress [VZ-21 Pattern] */}
                    <div className="w-16 h-16 shrink-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={[{v:pct}, {v:100-pct}]} dataKey="v" innerRadius={22} outerRadius={30} startAngle={90} endAngle={-270} stroke="none">
                                    <Cell fill={pct === 100 ? '#10b981' : '#3b82f6'}/><Cell fill="#f1f5f9"/>
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-black text-slate-900 tabular-nums">{pct}%</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Trigger</span>
                            <span className="text-slate-900">{bp.triggers}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Node Count</span>
                            <span className="text-slate-900">{bp.tasks} units</span>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600" onClick={() => handleSelect(bp.id)}>View Audit</Button>
                    <Button variant="primary" size="sm" className="flex-1 bg-slate-900 border-none shadow-md hover:bg-slate-800 rounded-xl">Execute Instance</Button>
                </div>
            </Card>
        )})}
        
        <button className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer min-h-[220px] group shadow-inner">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4 group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-blue-500 fill-blue-500"/>
            </div>
            <span className="font-black text-xs uppercase tracking-[0.2em]">Deploy New Logic</span>
            <span className="text-[10px] mt-2 opacity-60">Visual BPMN Architect v3.5</span>
        </button>
    </div>
  );
};
