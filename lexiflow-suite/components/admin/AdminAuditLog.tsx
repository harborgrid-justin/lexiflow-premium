
import { Activity, Clock, Download, Search, Shield, User } from 'lucide-react';
import React, { useDeferredValue, useMemo, useState } from 'react';
import { AuditLogEntry } from '../../types.ts';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../common/Table.tsx';

interface AdminAuditLogProps {
    logs: AuditLogEntry[];
}

export const AdminAuditLog: React.FC<AdminAuditLogProps> = ({ logs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm);

    const filteredLogs = useMemo(() => {
        return logs.filter(l =>
            l.user.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
            l.action.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
            l.resource.toLowerCase().includes(deferredSearchTerm.toLowerCase())
        );
    }, [logs, deferredSearchTerm]);

    return (
        <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="flex flex-col h-full rounded-lg border overflow-hidden">
            <div style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'var(--color-border)' }} className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-slate-500" /> System Audit Trail
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Immutable record of all user activities and system events.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto items-center">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            className="w-full md:w-64 pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button size="sm" variant="outline" icon={Download}>Export CSV</Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {/* Desktop Table */}
                <div className="hidden md:block min-w-full">
                    <TableContainer className="border-0 shadow-none rounded-none">
                        <TableHeader>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>User / Actor</TableHead>
                            <TableHead>Event Type</TableHead>
                            <TableHead>Resource Target</TableHead>
                            <TableHead>IP Address</TableHead>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.map(l => (
                                <TableRow key={l.id} className="group" style={{ backgroundColor: 'transparent' }}>
                                    <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                                        {l.timestamp}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="h-3 w-3 text-slate-400" />
                                            <span className="font-medium text-slate-900 text-sm">{l.user}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={l.action.includes('DELETE') ? 'error' : l.action.includes('EXPORT') ? 'warning' : 'neutral'}>
                                            {l.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'var(--color-border)', color: 'var(--color-textMuted)' }} className="text-xs font-mono px-2 py-1 rounded border group-hover:border-slate-300 transition-colors">
                                            {l.resource}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-400 font-mono">{l.ip}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableContainer>
                </div>

                {/* Mobile Cards */}
                <div style={{ backgroundColor: 'var(--color-background)' }} className="md:hidden space-y-4 p-4">
                    {filteredLogs.map(l => (
                        <div key={l.id} style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="p-4 rounded-lg shadow-sm border">
                            <div className="flex justify-between items-start mb-2">
                                <span style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-textMuted)', borderColor: 'var(--color-border)' }} className="font-mono text-[10px] flex items-center px-2 py-0.5 rounded">
                                    <Clock className="h-3 w-3 mr-1" /> {l.timestamp}
                                </span>
                            </div>
                            <div className="flex items-center mb-3">
                                <User className="h-4 w-4 text-slate-400 mr-2" />
                                <span className="font-bold text-sm text-slate-900">{l.user}</span>
                            </div>
                            <div style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'var(--color-border)' }} className="flex justify-between items-center p-2 rounded border mb-2">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs font-bold text-slate-700">{l.action}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600 font-mono truncate max-w-[150px]">{l.resource}</span>
                                <span className="text-slate-400">{l.ip}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
