
import React from "react";
import { useMatters } from "../logic/useMatters.js";
import { Briefcase, Filter, ChevronRight, Gavel, Users } from "lucide-react";
import { Badge } from "../components/common/Badge.tsx";
import { Card } from "../components/common/Card.tsx";

/**
 * MatterDashboard: Presentational component for the Case Registry.
 * Focuses purely on layout, styles, and user interaction.
 */
const MatterDashboard = () => {
  const { cases, selectCase, setStatusFilter, statusFilter, loading } = useMatters();

  if (loading) return <div className="p-12 text-center">Inhaling Case Data...</div>;

  return (
    <div className="space-y-8 animate-fade-in p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Matter Registry</h1>
          <p className="text-slate-500 font-medium mt-1">Enterprise litigation portfolio and jurisdiction mapping.</p>
        </div>
        <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
           {["All", "Discovery", "Trial", "Closed"].map(s => (
             <button 
               key={s}
               onClick={() => setStatusFilter(s)}
               className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {s}
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((matter) => (
          <Card 
            key={matter.id} 
            className="hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer group"
            onClick={() => selectCase(matter.id)}
            noPadding
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100">
                  <Briefcase size={20} />
                </div>
                <Badge variant={matter.status === 'Trial' ? 'warning' : 'info'}>
                  {matter.status}
                </Badge>
              </div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                {matter.title}
              </h3>
              <p className="text-xs text-slate-500 font-mono mb-6">{matter.id}</p>
              
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users size={14} className="text-slate-400" />
                  <span className="truncate">{matter.client}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Gavel size={14} className="text-slate-400" />
                  <span className="truncate">{matter.court || 'Jurisdiction Pending'}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50 transition-colors">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">View Timeline</span>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MatterDashboard;
