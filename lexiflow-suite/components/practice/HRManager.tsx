
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { MetricCard } from '../common/Primitives.tsx';
import { Plus, User, Award, TrendingUp, Users, MoreHorizontal, Mail } from 'lucide-react';
import { Card } from '../common/Card.tsx';
import { useData } from '../../hooks/useData.ts';

export const HRManager: React.FC = () => {
  const staffMembers = useData(s => s.staff);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600"/> Staff & Human Capital
          </h3>
          <p className="text-sm text-slate-500 mt-1">Manage firm personnel and utilization metrics.</p>
        </div>
        <Button variant="primary" icon={Plus}>Add Staff</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Headcount" value={staffMembers.length} icon={User} className="border-l-4 border-l-blue-500"/>
        <MetricCard label="Avg Utilization" value="82%" icon={Award} className="border-l-4 border-l-purple-500"/>
        <MetricCard label="Billable YTD" value="4,250" icon={TrendingUp} className="border-l-4 border-l-emerald-500"/>
      </div>

      <Card title="Personnel Roster" noPadding>
        <TableContainer className="border-0 shadow-none rounded-none">
          <TableHeader>
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableHeader>
          <TableBody>
            {staffMembers.map(staff => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={staff.name} size="sm" className="ring-2 ring-white shadow-sm"/>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{staff.name}</p>
                        <p className="text-xs text-slate-500">{staff.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="neutral">{staff.role}</Badge></TableCell>
                  <TableCell><Badge variant={staff.status === 'Active' ? 'success' : 'warning'}>{staff.status}</Badge></TableCell>
                  <TableCell><span className="font-bold text-sm text-blue-600">{staff.utilizationRate}%</span></TableCell>
                  <TableCell className="text-right">
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 transition-colors"><MoreHorizontal className="h-4 w-4"/></button>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      </Card>
    </div>
  );
};
