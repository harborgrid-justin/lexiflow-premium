
import React, { useTransition } from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';
import { CheckSquare, FileText, Scale, ArrowRight, BarChart3, Database } from 'lucide-react';
import { MOCK_DISCOVERY, MOCK_LEGAL_HOLDS, MOCK_PRIVILEGE_LOG } from '../../data/mockDiscovery.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DiscoveryDashboardProps {
    onNavigate: (view: any, id?: string) => void;
}

export const DiscoveryDashboard: React.FC<DiscoveryDashboardProps> = ({ onNavigate }) => {
  const [isPending, startTransition] = useTransition();

  const handleNavClick = (view: string, id?: string) => {
    startTransition(() => {
        onNavigate(view, id);
    });
  };

  const funnelData = [
      { name: 'Collection', value: 120000, label: '120k Docs' },
      { name: 'Processing', value: 85000, label: '85k De-NIST' },
      { name: 'Review', value: 24000, label: '24k Responsive' },
      { name: 'Production', value: 1500, label: '1.5k Produced' },
  ];

  const custodianData = [
      { name: 'J. Doe', docs: 4500 },
      { name: 'J. Smith', docs: 3200 },
      { name: 'HR Dept', docs: 8900 },
      { name: 'IT Admin', docs: 1200 },
  ];

  return (
    <div className={`space-y-6 animate-fade-in transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card noPadding className="border-l-4 border-l-blue-600">
          <div className="p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleNavClick('requests')}>
            <p className="text-xs font-bold text-slate-500 uppercase">Pending Requests</p>
            <p className="text-2xl font-bold text-slate-900">{MOCK_DISCOVERY.filter(r => r.status === 'Served').length}</p>
          </div>
        </Card>
        <Card noPadding className="border-l-4 border-l-amber-500">
          <div className="p-4">
            <p className="text-xs font-bold text-slate-500 uppercase">Upcoming Deadlines (7d)</p>
            <p className="text-2xl font-bold text-slate-900">3</p>
          </div>
        </Card>
        <Card noPadding className="border-l-4 border-l-red-600">
          <div className="p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleNavClick('holds')}>
            <p className="text-xs font-bold text-slate-500 uppercase">Legal Hold Pending</p>
            <p className="text-2xl font-bold text-slate-900">{MOCK_LEGAL_HOLDS.filter(h => h.status === 'Pending').length}</p>
          </div>
        </Card>
        <Card noPadding className="border-l-4 border-l-purple-600">
          <div className="p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleNavClick('privilege')}>
            <p className="text-xs font-bold text-slate-500 uppercase">Privileged Items</p>
            <p className="text-2xl font-bold text-slate-900">{MOCK_PRIVILEGE_LOG.length}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="EDRM Data Funnel" className="lg:col-span-2">
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funnelData} layout="horizontal" barCategoryGap="20%">
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value) => value.toLocaleString()} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, formatter: (v:any) => funnelData.find(d => d.value === v)?.label }}>
                            {funnelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#94a3b8', '#64748b', '#3b82f6', '#22c55e'][index]} />
                            ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </Card>

          <Card title="Custodian Volume">
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={custodianData} layout="vertical" margin={{ left: 20 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" fontSize={11} width={60} />
                          <Tooltip cursor={{fill: '#f8fafc'}} />
                          <Bar dataKey="docs" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Review Progress">
           <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                   <span>Responsive Documents Review</span>
                   <span className="font-bold">78%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                   <div className="bg-blue-600 h-2 rounded-full w-[78%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                   <span>Privilege Redactions</span>
                   <span className="font-bold">45%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                   <div className="bg-amber-500 h-2 rounded-full w-[45%]"></div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-xs text-slate-500">Next Production Volume Due: March 31</span>
                 <Button size="sm" variant="outline" icon={ArrowRight} onClick={() => handleNavClick('production')}>Create Production Set</Button>
              </div>
           </div>
        </Card>

        <Card title="Active Integrations">
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-slate-500"/>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Relativity Server</p>
                            <p className="text-xs text-slate-500">Sync: 15 mins ago</p>
                        </div>
                    </div>
                    <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-500"/>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Office 365 Purview</p>
                            <p className="text-xs text-slate-500">Collection Active</p>
                        </div>
                    </div>
                    <Badge variant="warning">Ingesting</Badge>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
};
