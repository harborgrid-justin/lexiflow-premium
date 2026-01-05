
import React from 'react';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { AlertCircle, Plus, User, Building2, Calendar } from 'lucide-react';
import { MOCK_LEGAL_HOLDS } from '../../data/mockDiscovery.ts';

export const LegalHolds: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-4">
       <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4 flex gap-3">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0"/>
          <div>
            <h4 className="font-bold text-amber-800 text-sm">Spoliation Warning</h4>
            <p className="text-xs text-amber-700 mt-1">Ensure all custodians are notified. Failure to preserve evidence may result in adverse inference sanctions (FRCP 37(e)).</p>
          </div>
       </div>

       <div className="flex justify-between items-center mb-2">
         <h3 className="font-bold text-slate-900">Active Custodians</h3>
         <Button variant="primary" icon={Plus}>Issue New Hold</Button>
       </div>

       {/* Desktop View */}
       <div className="hidden md:block">
         <TableContainer>
            <TableHeader>
              <TableHead>Custodian</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Date Issued</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {MOCK_LEGAL_HOLDS.map((hold) => (
                 <TableRow key={hold.id}>
                    <TableCell className="font-medium text-slate-900">{hold.custodian}</TableCell>
                    <TableCell>{hold.dept}</TableCell>
                    <TableCell>{hold.issued}</TableCell>
                    <TableCell>
                      {hold.status === 'Acknowledged' 
                        ? <Badge variant="success">Acknowledged</Badge> 
                        : <Badge variant="warning">Pending Ack</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Remind</Button>
                    </TableCell>
                 </TableRow>
              ))}
            </TableBody>
         </TableContainer>
       </div>

       {/* Mobile Card View */}
       <div className="md:hidden space-y-4">
         {MOCK_LEGAL_HOLDS.map(hold => (
           <div key={hold.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
             <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500"/>
                  <span className="font-bold text-slate-900">{hold.custodian}</span>
                </div>
                {hold.status === 'Acknowledged' 
                  ? <Badge variant="success">Ack</Badge> 
                  : <Badge variant="warning">Pending</Badge>
                }
             </div>
             
             <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 mb-4">
               <div className="flex items-center gap-1">
                 <Building2 className="h-3 w-3 text-slate-400"/>
                 {hold.dept}
               </div>
               <div className="flex items-center gap-1">
                 <Calendar className="h-3 w-3 text-slate-400"/>
                 Issued: {hold.issued}
               </div>
             </div>

             <div className="flex gap-2">
               <Button size="sm" variant="outline" className="flex-1">View Notice</Button>
               {hold.status === 'Pending' && <Button size="sm" variant="ghost" className="flex-1 text-blue-600">Resend</Button>}
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};
