
import React from 'react';
import { ScrollText, FileText } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';

export const JurisdictionLocalRules: React.FC = () => {
  const rules = [
    { court: 'N.D. Cal.', judge: 'Hon. S. Miller', title: 'Standing Order for Civil Cases', updated: '2024-01-15' },
    { court: 'LA Superior', judge: 'Dept 504', title: 'Tentative Ruling Procedures', updated: '2023-11-20' },
    { court: 'S.D.N.Y.', judge: 'All Judges', title: 'Electronic Device Policy', updated: '2024-02-01' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="bg-indigo-50 p-3 rounded-full"><ScrollText className="h-8 w-8 text-indigo-600"/></div>
        <div>
          <h3 className="font-bold text-lg text-slate-900">Local Rules & Standing Orders</h3>
          <p className="text-slate-500 text-sm">Specific procedural requirements by Judge and Department.</p>
        </div>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Court</TableHead>
          <TableHead>Judge / Dept</TableHead>
          <TableHead>Document Title</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableHeader>
        <TableBody>
          {rules.map((r, i) => (
            <TableRow key={i}>
              <TableCell className="font-bold text-slate-700">{r.court}</TableCell>
              <TableCell>{r.judge}</TableCell>
              <TableCell className="text-blue-600 font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2 text-slate-400"/> {r.title}
              </TableCell>
              <TableCell>{r.updated}</TableCell>
              <TableCell className="text-right">
                <button className="text-xs border px-2 py-1 rounded hover:bg-slate-50 transition-colors">Download</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};
