
import React, { useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Tabs } from '../common/Tabs';
import { WorkflowTemplateBuilder } from './WorkflowTemplateBuilder';
import { WorkflowAnalyticsDashboard } from './WorkflowAnalyticsDashboard';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface FirmProcessDetailProps {
  processId: string;
  onBack: () => void;
}

export const FirmProcessDetail: React.FC<FirmProcessDetailProps> = ({ processId, onBack }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'designer' | 'instances' | 'analytics'>('overview');

  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-6 animate-fade-in min-h-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={cn("p-2 rounded-full transition-colors border border-transparent", theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.border.default}`)}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className={cn("text-xl md:text-2xl font-bold", theme.text.primary)}>New Client Onboarding</h2>
            <p className={cn("text-sm", theme.text.secondary)}>Process ID: {processId} • Owner: Admin Team</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="primary" icon={Play} className="flex-1 md:flex-none">Run Manual Instance</Button>
        </div>
      </div>

      <Tabs 
        tabs={['overview', 'designer', 'instances', 'analytics']} 
        activeTab={activeTab} 
        onChange={(t) => setActiveTab(t as any)} 
      />

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pb-6 h-full">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Process Definition">
                <div className={cn("prose prose-sm max-w-none", theme.text.secondary)}>
                  <p>This process handles the end-to-end onboarding of new clients, including conflict checks, engagement letter generation, retainer collection, and initial file setup.</p>
                  <h4 className={cn("font-bold mt-4", theme.text.primary)}>Triggers</h4>
                  <ul className="list-disc pl-5">
                    <li>CRM: New Lead Status change to "Converting"</li>
                    <li>Manual: Admin Portal</li>
                  </ul>
                </div>
              </Card>
              <Card title="Recent Executions">
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={cn("flex justify-between items-center p-3 border rounded-lg", theme.border.default, `hover:${theme.surface.highlight}`)}>
                      <div>
                        <p className={cn("font-bold text-sm", theme.text.primary)}>Instance #{2040 + i} - TechStartup Inc.</p>
                        <p className={cn("text-xs", theme.text.secondary)}>Started: 2 hours ago</p>
                      </div>
                      <span className={cn("px-2 py-1 text-xs rounded-full font-bold", theme.status.info.bg, theme.status.info.text)}>Running</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-6">
              <Card title="Owner & Roles">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold", theme.surface.highlight, theme.text.secondary)}>AT</div>
                  <div>
                    <p className={cn("font-bold text-sm", theme.text.primary)}>Admin Team</p>
                    <p className={cn("text-xs", theme.text.secondary)}>Process Owner</p>
                  </div>
                </div>
                <div className={cn("text-sm space-y-2 border-t pt-3", theme.text.secondary, theme.border.default)}>
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
          <div className={cn("rounded-lg border shadow-sm flex-1 overflow-auto", theme.surface.default, theme.border.default)}>
            <table className={cn("min-w-full divide-y", theme.border.default)}>
              <thead className={cn("sticky top-0", theme.surface.highlight)}>
                <tr>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>Instance ID</th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>Subject</th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>Start Date</th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>Status</th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>Current Step</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme.surface.default, theme.border.default)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className={cn("px-6 py-4 whitespace-nowrap text-sm font-mono", theme.text.secondary)}>BP-{2040+i}</td>
                    <td className={cn("px-6 py-4 whitespace-nowrap text-sm font-medium", theme.text.primary)}>Client Onboarding: Acme Corp</td>
                    <td className={cn("px-6 py-4 whitespace-nowrap text-sm", theme.text.secondary)}>2024-03-{10+i}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", i === 2 ? theme.status.error.bg + " " + theme.status.error.text : theme.status.success.bg + " " + theme.status.success.text)}>
                        {i === 2 ? 'Stalled' : 'Active'}
                      </span>
                    </td>
                    <td className={cn("px-6 py-4 whitespace-nowrap text-sm", theme.text.secondary)}>{i === 2 ? 'Conflict Resolution' : 'Engagement Letter'}</td>
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
