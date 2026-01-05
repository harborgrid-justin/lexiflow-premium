
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Badge } from '../common/Badge.tsx';
import { ExternalLink } from 'lucide-react';

export const JurisdictionFederal: React.FC = () => {
  const courts = [
    { name: 'U.S. Supreme Court', circuit: 'SCOTUS', type: 'Highest', judges: 9, status: 'Active Session' },
    { name: '9th Circuit Court of Appeals', circuit: '9th', type: 'Appellate', judges: 29, status: 'Recess' },
    { name: 'N.D. California', circuit: '9th', type: 'District', judges: 14, status: 'Active' },
    { name: 'S.D. New York', circuit: '2nd', type: 'District', judges: 28, status: 'Active' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold">Federal Judiciary System</h3>
        <p className="text-slate-400 text-sm mt-1">Access Pacer records, standing orders, and circuit rules.</p>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Court Name</TableHead>
          <TableHead>Circuit / District</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Active Judges</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Rules</TableHead>
        </TableHeader>
        <TableBody>
          {courts.map((court, i) => (
            <TableRow key={i}>
              <TableCell className="font-bold text-slate-900">{court.name}</TableCell>
              <TableCell>{court.circuit}</TableCell>
              <TableCell><Badge variant="neutral">{court.type}</Badge></TableCell>
              <TableCell>{court.judges}</TableCell>
              <TableCell>
                <span className={`text-xs font-bold ${court.status === 'Active' || court.status === 'Active Session' ? 'text-green-600' : 'text-amber-600'}`}>
                  {court.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <button className="text-blue-600 hover:underline text-xs flex items-center justify-end">
                  View Rules <ExternalLink className="h-3 w-3 ml-1"/>
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};
