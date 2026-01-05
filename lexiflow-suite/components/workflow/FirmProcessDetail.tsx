
import React, { useState, useTransition } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { Card } from '../common/Card.tsx';
import { Tabs } from '../common/Tabs.tsx';
import { WorkflowTemplateBuilder } from './WorkflowTemplateBuilder.tsx';
import { WorkflowAnalyticsDashboard } from './WorkflowAnalyticsDashboard.tsx';

interface FirmProcessDetailProps {
  processId: string;
  onBack: () => void;
}

export const FirmProcessDetail: React.FC<FirmProcessDetailProps> = ({ processId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'designer' | 'instances' | 'analytics'>('overview');
  // Guideline 3: Transition for tab switching
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (t: 'overview' | 'designer' | 'instances' | 'analytics') => {
      startTransition(() => {
          setActiveTab(t);
      });
  };

  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-6 animate-fade-in min-h-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">New Client Onboarding</h2>
            <p className="text-sm text-slate-500">Process ID: {processId} • Owner: Admin Team</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="primary" icon={Play} className="flex-1 md:flex-none">Run Manual Instance</Button>
        </div>
      </div>

      <Tabs 
        tabs={['overview', 'designer', 'instances', 'analytics']} 
        activeTab={activeTab} 
        onChange={(t) => handleTabChange(t as any)} 
      />

      <div className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pb-6 h-full">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Process Definition">
                <div className="prose prose-sm max-w-none text-slate-600">
                  <p>This process handles the end-to-end onboarding of new clients, including conflict checks, engagement letter generation, retainer collection, and initial file setup.</p>
                  <h4 className="text-slate-800 font-bold mt-4">Triggers</h4>
                  <ul className="list-disc pl-5">
                    <li>CRM: New Lead Status change to "Converting"</li>
                    <li>Manual: Admin Portal</li>
                  </ul>
                </div>
              </Card>
              <Card title="Recent Executions">
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-sm text-slate-900">Instance #{2040 + i} - TechStartup Inc.</p>
                        <p className="text-xs text-slate-500">Started: 2 hours ago</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">Running</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-6">
              <Card title="Owner & Roles">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">AT</div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">Admin Team</p>
                    <p className="text-xs text-slate-500">Process Owner</p>
                  </div>
                </div>
                <div className="text-sm text-slate-600 space-y-2 border-t pt-3">
                  <div className="flex justify-between"><span>Approvers:</span> <span className="font-medium">Partners</span></div>
                  <div className="flex justify-between"><span>Executors:</span> <span className="font-medium">Paralegals</span></div>
                </div>
              </Card>
              <Card title="SLA Config">
                <div className="text-sm space-y-3">
                  <div className="flex justify-between"><span>Target Duration:</span> <span className="font-bold">48 Hours</span></div>
                  <div className="flex justify-between"><span>Critical Step:</span> <span className="font-bold">Conflict Check</span></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'designer' && (
          <div className="flex-1 h-full min-h-[500px]">
             <WorkflowTemplateBuilder />
          </div>
        )}

        {activeTab === 'instances' && (
          <div className="bg-white rounded-lg border shadow-sm flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Instance ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Step</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">BP-{2040+i}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Client Onboarding: Acme Corp</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">2024-03-{10+i}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${i === 2 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {i === 2 ? 'Stalled' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{i === 2 ? 'Conflict Resolution' : 'Engagement Letter'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'analytics' && (
          <WorkflowAnalyticsDashboard />
        )}
      </div>
    </div>
  );
};
