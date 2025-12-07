
import React, { useState } from 'react';
import { ShieldAlert, Users, Smartphone, BookOpen, Activity, AlertOctagon, CheckCircle, Lock } from 'lucide-react';
import { Tabs } from '../common/Tabs';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { MetricTile, SectionTitle } from '../common/RefactoredCommon';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Badge } from '../common/Badge';

export const SecurityOps: React.FC = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('incidents');

    const incidents = [
        { id: 'SEC-001', type: 'Phishing Attempt', user: 'James Doe', severity: 'High', status: 'Mitigated', time: '2 hours ago' },
        { id: 'SEC-002', type: 'Failed Login (5x)', user: 'System Admin', severity: 'Medium', status: 'Investigating', time: '4 hours ago' },
        { id: 'SEC-003', type: 'Unusual Download', user: 'Sarah Jenkins', severity: 'Low', status: 'Cleared', time: 'Yesterday' },
    ];

    return (
        <div className="flex flex-col h-full space-y-4">
             <div className={cn("p-4 border-b shrink-0", theme.border.default)}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={cn("text-lg font-bold", theme.text.primary)}>Security Operations Center</h3>
                    <div className="flex gap-2">
                        <Badge variant="success" className="px-3 py-1 text-sm"><CheckCircle className="h-4 w-4 mr-1"/> System Healthy</Badge>
                    </div>
                </div>
                <Tabs 
                    tabs={[
                        { id: 'incidents', label: 'Incident Log', icon: AlertOctagon },
                        { id: 'access', label: 'Access Reviews', icon: Users },
                        { id: 'devices', label: 'Device Compliance', icon: Smartphone },
                        { id: 'training', label: 'Security Training', icon: BookOpen },
                        { id: 'threats', label: 'Threat Intel', icon: Activity },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'incidents' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MetricTile label="Active Threats" value="0" icon={ShieldAlert} className="border-l-4 border-l-green-500" />
                            <MetricTile label="Failed Logins (24h)" value="12" icon={Lock} className="border-l-4 border-l-amber-500" />
                            <MetricTile label="Phishing Reports" value="3" icon={AlertOctagon} className="border-l-4 border-l-purple-500" />
                            <MetricTile label="Mean Time to Resolve" value="14m" icon={Activity} className="border-l-4 border-l-blue-500" />
                        </div>

                        <SectionTitle>Recent Alerts</SectionTitle>
                        <TableContainer>
                            <TableHeader><TableHead>ID</TableHead><TableHead>Type</TableHead><TableHead>User Context</TableHead><TableHead>Severity</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead></TableHeader>
                            <TableBody>
                                {incidents.map(inc => (
                                    <TableRow key={inc.id}>
                                        <TableCell className="font-mono text-xs">{inc.id}</TableCell>
                                        <TableCell className="font-bold">{inc.type}</TableCell>
                                        <TableCell>{inc.user}</TableCell>
                                        <TableCell><Badge variant={inc.severity === 'High' ? 'error' : inc.severity === 'Medium' ? 'warning' : 'neutral'}>{inc.severity}</Badge></TableCell>
                                        <TableCell>{inc.time}</TableCell>
                                        <TableCell><Badge variant={inc.status === 'Mitigated' ? 'success' : 'info'}>{inc.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableContainer>
                    </div>
                )}
                
                {activeTab !== 'incidents' && (
                    <div className={cn("flex flex-col items-center justify-center h-full text-center p-12", theme.text.tertiary)}>
                         <Lock className="h-16 w-16 mb-4 opacity-20"/>
                         <h3 className="text-lg font-bold">Secure Zone</h3>
                         <p>Detailed view restricted in demo mode.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
