
import React, { useState, useTransition, useCallback } from 'react';
import { ShieldCheck, Users, Search, AlertTriangle, Lock, CheckCircle, Activity, FileWarning, Layers } from 'lucide-react';
import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { useData } from '../hooks/useData.ts';
import { Button } from './common/Button.tsx';

export const ComplianceDashboard: React.FC = () => {
  const auditLogs = useData(s => s.auditLogs);
  const [activeTab, setActiveTab] = useState('conflicts');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = useCallback((t: string) => {
      startTransition(() => {
          setActiveTab(t);
      });
  }, []);

  const tabs = [
      { id: 'conflicts', label: 'Conflict Check Logs', icon: Users },
      { id: 'walls', label: 'Ethical Walls', icon: Layers },
      { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in bg-slate-50">
      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title="Risk & Compliance" 
            subtitle="Global Audit Logs and Regulatory Oversight."
            actions={
                <Button variant="outline" icon={FileWarning}>Incident Report</Button>
            }
        />
        <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
        />
      </div>

      <div className={`flex-1 min-h-0 overflow-y-auto p-6 pt-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'conflicts' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center text-sm uppercase tracking-wide"><CheckCircle className="mr-2 h-4 w-4 text-green-500"/> System Activity Logs</h3>
                        <button className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-bold shadow-sm hover:bg-slate-800 transition-colors">Export PDF Report</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {auditLogs.map(log => (
                            <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all"><Activity size={16}/></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{log.action}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{log.user} • {log.resource}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{log.timestamp}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{log.ip}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {activeTab === 'walls' && (
                <div className="flex flex-col items-center justify-center h-96 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Lock className="h-12 w-12 mb-3 opacity-20"/>
                    <p className="text-sm font-bold">No active Ethical Walls detected.</p>
                </div>
            )}
            
            {activeTab === 'risk' && (
                 <div className="flex flex-col items-center justify-center h-96 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <ShieldCheck className="h-12 w-12 mb-3 opacity-20"/>
                    <p className="text-sm font-bold">System-wide risk assessment: Stable (98%).</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
