
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Badge } from '../common/Badge.tsx';
import { Search } from 'lucide-react';

export const JurisdictionState: React.FC = () => {
  const states = [
    { state: 'California', court: 'Superior Court of Los Angeles', level: 'Trial', eFiling: 'Required', system: 'Journal Tech' },
    { state: 'Delaware', court: 'Court of Chancery', level: 'Equity', eFiling: 'Required', system: 'File & Serve' },
    { state: 'New York', court: 'Supreme Court (Commercial Div)', level: 'Trial', eFiling: 'Required', system: 'NYSCEF' },
    { state: 'Texas', court: 'District Court (Harris County)', level: 'Trial', eFiling: 'Optional', system: 'eFileTexas' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800">State Court Venues</h3>
        <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
            <input className="w-full pl-9 pr-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search state courts..."/>
        </div>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>State</TableHead>
          <TableHead>Court System</TableHead>
          <TableHead>Jurisdiction Level</TableHead>
          <TableHead>e-Filing Policy</TableHead>
          <TableHead>System Provider</TableHead>
        </TableHeader>
        <TableBody>
          {states.map((s, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium text-slate-900">{s.state}</TableCell>
              <TableCell>{s.court}</TableCell>
              <TableCell>{s.level}</TableCell>
              <TableCell>
                <Badge variant={s.eFiling === 'Required' ? 'error' : 'success'}>{s.eFiling}</Badge>
              </TableCell>
              <TableCell className="text-slate-500 text-xs">{s.system}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};
