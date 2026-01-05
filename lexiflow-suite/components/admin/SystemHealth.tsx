
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Server, Database, Globe, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';

export const SystemHealth: React.FC = () => {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600"/>
                <div>
                    <h4 className="font-bold text-green-900">All Systems Operational</h4>
                    <p className="text-xs text-green-700">99.99% Uptime (30d)</p>
                </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-lg flex items-center gap-3 shadow-sm">
                <Cpu className="h-8 w-8 text-blue-500"/>
                <div>
                    <h4 className="font-bold text-slate-900">API Latency</h4>
                    <p className="text-xs text-slate-500 font-mono">45ms (avg)</p>
                </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-lg flex items-center gap-3 shadow-sm">
                <Database className="h-8 w-8 text-purple-500"/>
                <div>
                    <h4 className="font-bold text-slate-900">DB Load</h4>
                    <p className="text-xs text-slate-500 font-mono">12% Capacity</p>
                </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-lg flex items-center gap-3 shadow-sm">
                <Globe className="h-8 w-8 text-slate-500"/>
                <div>
                    <h4 className="font-bold text-slate-900">Global CDN</h4>
                    <p className="text-xs text-slate-500">14 Regions Active</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Server Resources">
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-1 text-sm font-medium text-slate-700">
                            <span className="flex items-center gap-2"><Cpu size={16}/> CPU Usage (Core)</span>
                            <span>32%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-blue-600 h-2 rounded-full w-[32%]"></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1 text-sm font-medium text-slate-700">
                            <span className="flex items-center gap-2"><Server size={16}/> Memory (RAM)</span>
                            <span>64%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-purple-600 h-2 rounded-full w-[64%]"></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1 text-sm font-medium text-slate-700">
                            <span className="flex items-center gap-2"><Database size={16}/> Storage (S3)</span>
                            <span>45%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-green-500 h-2 rounded-full w-[45%]"></div></div>
                    </div>
                </div>
            </Card>

            <Card title="Recent Incidents">
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5"/>
                        <div>
                            <h5 className="text-sm font-bold text-slate-900">Scheduled Maintenance</h5>
                            <p className="text-xs text-slate-500">Completed successfully on Oct 12, 02:00 AM UTC. Database migration v4.2 applied.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded border border-amber-200">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5"/>
                        <div>
                            <h5 className="text-sm font-bold text-amber-900">High Latency (US-East)</h5>
                            <p className="text-xs text-amber-800">Brief spike in response times detected on Oct 10. Auto-scaling triggered.</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};
