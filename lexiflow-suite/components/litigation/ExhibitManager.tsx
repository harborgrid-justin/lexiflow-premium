
import React, { useState } from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Stamp, Eye, Download, Plus, Search, Gavel, AlertCircle, CheckCircle } from 'lucide-react';

export const ExhibitManager: React.FC = () => {
  const [exhibits, setExhibits] = useState([
    { id: 'DEF-101', title: 'Email Chain re: Merger', status: 'Marked', admitted: false, objection: 'Hearsay', file: 'email_chain.pdf' },
    { id: 'DEF-102', title: 'Q3 Financial Report', status: 'Admitted', admitted: true, objection: 'None', file: 'q3_report.pdf' },
    { id: 'DEF-103', title: 'Server Access Logs', status: 'Pending', admitted: false, objection: 'Foundation', file: 'logs.csv' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Stamp className="h-5 w-5 text-blue-600"/> Exhibit Manager</h3>
          <p className="text-sm text-slate-500">Track exhibits, objections, and admissibility status for trial.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <Search className="absolute left-2.5 top-1.5 h-4 w-4 text-slate-400"/>
             <input className="pl-8 pr-3 py-1.5 border rounded text-sm w-48" placeholder="Search exhibits..."/>
           </div>
           <Button variant="primary" icon={Plus}>Add Exhibit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
            <h4 className="text-xs font-bold text-slate-500 uppercase">Total Marked</h4>
            <p className="text-2xl font-bold text-slate-800">{exhibits.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <h4 className="text-xs font-bold text-green-700 uppercase">Admitted</h4>
            <p className="text-2xl font-bold text-green-800">{exhibits.filter(e => e.admitted).length}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-center">
            <h4 className="text-xs font-bold text-amber-700 uppercase">Pending Objection</h4>
            <p className="text-2xl font-bold text-amber-800">{exhibits.filter(e => e.objection !== 'None').length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
            <h4 className="text-xs font-bold text-blue-700 uppercase">Next Exhibit ID</h4>
            <p className="text-2xl font-mono font-bold text-blue-800">DEF-104</p>
        </div>
      </div>

      <TableContainer>
        <TableHeader>
            <TableHead>Exhibit ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Filename</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Objections</TableHead>
            <TableHead className="text-right">Actions</TableHead>
        </TableHeader>
        <TableBody>
            {exhibits.map(ex => (
                <TableRow key={ex.id}>
                    <TableCell><span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-xs">{ex.id}</span></TableCell>
                    <TableCell className="font-medium text-slate-900">{ex.title}</TableCell>
                    <TableCell className="text-xs text-slate-500">{ex.file}</TableCell>
                    <TableCell>
                        <Badge variant={ex.admitted ? 'success' : 'neutral'}>{ex.status}</Badge>
                    </TableCell>
                    <TableCell>
                        {ex.objection !== 'None' ? (
                            <span className="flex items-center text-xs text-red-600 font-bold"><AlertCircle className="h-3 w-3 mr-1"/> {ex.objection}</span>
                        ) : (
                            <span className="flex items-center text-xs text-green-600"><CheckCircle className="h-3 w-3 mr-1"/> Clear</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500" title="View"><Eye size={14}/></button>
                            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500" title="Stamp & Download"><Stamp size={14}/></button>
                            {ex.status !== 'Admitted' && (
                                <button className="p-1.5 hover:bg-green-100 text-green-600 rounded" title="Mark Admitted"><Gavel size={14}/></button>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};
