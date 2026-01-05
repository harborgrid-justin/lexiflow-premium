
import React from 'react';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Wand2, Plus, Shield, Mail } from 'lucide-react';
import { MOCK_PRIVILEGE_LOG } from '../../data/mockDiscovery.ts';

export const PrivilegeLog: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 p-4 rounded-lg border border-slate-200 gap-4">
        <div>
          <h3 className="font-bold text-slate-900">Privilege Log (FRCP 26(b)(5))</h3>
          <p className="text-sm text-slate-500">Index of withheld documents claiming Attorney-Client or Work Product privilege.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button variant="outline" icon={Wand2} className="flex-1 md:flex-none">AI Scan</Button>
           <Button variant="primary" icon={Plus} className="flex-1 md:flex-none">Manual Entry</Button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <TableContainer>
          <TableHeader>
            <TableHead>Doc ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Privilege Claim</TableHead>
            <TableHead>Author/Recipient</TableHead>
            <TableHead>Description (Rule 26)</TableHead>
          </TableHeader>
          <TableBody>
            {MOCK_PRIVILEGE_LOG.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">{item.id}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell><Badge variant="warning">{item.basis}</Badge></TableCell>
                <TableCell>
                  <div className="text-xs">
                    <p><span className="text-slate-500">From:</span> {item.author}</p>
                    <p><span className="text-slate-500">To:</span> {item.recipient}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate" title={item.desc}>{item.desc}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {MOCK_PRIVILEGE_LOG.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-500"/>
                <span className="font-mono text-xs font-bold text-slate-700">{item.id}</span>
              </div>
              <Badge variant="warning">{item.basis}</Badge>
            </div>
            
            <div className="text-sm text-slate-900 mb-3 bg-slate-50 p-2 rounded border border-slate-100">
              {item.desc}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 mb-2">
              <div>
                <span className="block text-slate-400 font-medium">Date</span>
                {item.date}
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Type</span>
                {item.type}
              </div>
            </div>

            <div className="flex items-start gap-2 pt-3 border-t border-slate-100 text-xs">
              <Mail className="h-3.5 w-3.5 text-slate-400 mt-0.5"/>
              <div className="flex-1">
                <p><strong>From:</strong> {item.author}</p>
                <p><strong>To:</strong> {item.recipient}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
