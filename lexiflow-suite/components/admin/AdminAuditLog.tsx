
import React, { useState, useDeferredValue, useMemo } from 'react';
import { AuditLogEntry } from '../../types.ts';
import { Clock, User, Activity, Download, Filter, Shield, Search } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';

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
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-500"/> System Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-1">Immutable record of all user activities and system events.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto items-center">
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"/>
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
                    <TableRow key={l.id} className="hover:bg-slate-50 group">
                        <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                            {l.timestamp}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-slate-400"/>
                                <span className="font-medium text-slate-900 text-sm">{l.user}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={l.action.includes('DELETE') ? 'error' : l.action.includes('EXPORT') ? 'warning' : 'neutral'}>
                                {l.action}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <span className="text-xs font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-600 group-hover:border-slate-300 transition-colors">
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
        <div className="md:hidden space-y-4 p-4 bg-slate-50">
            {filteredLogs.map(l => (
                <div key={l.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-[10px] text-slate-500 flex items-center bg-slate-100 px-2 py-0.5 rounded">
                            <Clock className="h-3 w-3 mr-1"/> {l.timestamp}
                        </span>
                    </div>
                    <div className="flex items-center mb-3">
                        <User className="h-4 w-4 text-slate-400 mr-2"/>
                        <span className="font-bold text-sm text-slate-900">{l.user}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100 mb-2">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500"/>
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
