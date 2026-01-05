
import React from 'react';
import { Globe, Plane } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';

export const JurisdictionInternational: React.FC = () => {
  const treaties = [
    { name: 'Hague Service Convention', type: 'Service of Process', status: 'Ratified', parties: 79 },
    { name: 'New York Convention', type: 'Arbitration Enforcement', status: 'Ratified', parties: 172 },
    { name: 'GDPR (EU)', type: 'Data Privacy', status: 'Enforcement Active', parties: 27 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-8 rounded-lg flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-2xl font-bold flex items-center"><Globe className="h-6 w-6 mr-3"/> Cross-Border Jurisdiction</h2>
          <p className="text-blue-200 mt-2">Manage international service, discovery (Hague Evidence), and enforcement.</p>
        </div>
        <Plane className="h-16 w-16 text-blue-500 opacity-20"/>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Treaty / Convention</TableHead>
          <TableHead>Subject Matter</TableHead>
          <TableHead>Status (US)</TableHead>
          <TableHead>Signatory Count</TableHead>
        </TableHeader>
        <TableBody>
          {treaties.map((t, i) => (
            <TableRow key={i}>
              <TableCell className="font-bold text-slate-900">{t.name}</TableCell>
              <TableCell>{t.type}</TableCell>
              <TableCell><span className="text-green-600 font-bold">{t.status}</span></TableCell>
              <TableCell>{t.parties}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};
