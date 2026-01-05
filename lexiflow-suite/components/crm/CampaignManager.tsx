
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Megaphone, Users, MousePointer, Mail } from 'lucide-react';
import { MetricCard } from '../common/Primitives.tsx';
import { Button } from '../common/Button.tsx';

export const CampaignManager: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Campaigns</h2>
                <Button variant="primary" icon={Megaphone}>Create Campaign</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard label="Active Campaigns" value="3" icon={Megaphone} className="border-l-4 border-l-blue-500"/>
                <MetricCard label="Total Leads" value="1,240" icon={Users} trend="+12% this month" trendUp={true} className="border-l-4 border-l-green-500"/>
                <MetricCard label="Click Rate" value="4.2%" icon={MousePointer} className="border-l-4 border-l-purple-500"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Recent Campaigns">
                    <div className="space-y-4">
                        {[
                            { name: 'Q1 Newsletter', status: 'Sent', sent: 5000, open: '45%' },
                            { name: 'Webinar Invite', status: 'Scheduled', sent: 2000, open: '-' },
                            { name: 'Client Alert: New Regs', status: 'Draft', sent: '-', open: '-' },
                        ].map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                                    <span className="text-xs text-slate-500">Status: {c.status}</span>
                                </div>
                                <div className="text-right text-xs">
                                    <p><span className="font-bold">{c.sent}</span> Recipients</p>
                                    <p className="text-green-600 font-bold">{c.open} Open Rate</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title="Lead Sources">
                     <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm"><span className="font-medium">Referral</span> <span className="font-bold">45%</span></div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="w-[45%] h-full bg-blue-600"></div></div>
                        
                        <div className="flex justify-between text-sm mt-2"><span className="font-medium">Organic Search</span> <span className="font-bold">30%</span></div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="w-[30%] h-full bg-green-500"></div></div>

                        <div className="flex justify-between text-sm mt-2"><span className="font-medium">Paid Ads</span> <span className="font-bold">25%</span></div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="w-[25%] h-full bg-purple-500"></div></div>
                     </div>
                </Card>
            </div>
        </div>
    );
};
