import React, { useState } from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { UserAvatar } from '../common/UserAvatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MetricCard } from '../common/Primitives';
import { Plus, User, Award, TrendingUp, MoreHorizontal, Trash2 } from 'lucide-react';
import { StaffMember } from '../../types';
import { DataService } from '../../services/dataService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { AddStaffModal } from './hr/AddStaffModal';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';

export const HRManager: React.FC = () => {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Enterprise Data Access
  const { data: staffList = [] } = useQuery<StaffMember[]>(
      [STORES.STAFF, 'all'],
      DataService.hr.getStaff
  );

  const { mutate: addStaff } = useMutation(
      DataService.hr.addStaff,
      { 
          invalidateKeys: [[STORES.STAFF, 'all']],
          onSuccess: () => setIsModalOpen(false)
      }
  );

  const { mutate: deleteStaff } = useMutation(
      DataService.hr.deleteStaff,
      { invalidateKeys: [[STORES.STAFF, 'all']] }
  );

  const handleAddStaff = (newStaff: Partial<StaffMember>) => {
      const staff: StaffMember = {
          id: `s-${Date.now()}`,
          userId: `u-${Date.now()}`,
          name: newStaff.name!,
          email: newStaff.email!,
          role: (newStaff.role as any) || 'Associate',
          phone: newStaff.phone || '',
          billableTarget: Number(newStaff.billableTarget) || 1800,
          currentBillable: 0,
          utilizationRate: 0,
          salary: Number(newStaff.salary) || 150000,
          status: 'Active',
          startDate: new Date().toISOString().split('T')[0]
      };
      addStaff(staff);
  };

  const handleDelete = (id: string) => {
      if (confirm('Are you sure you want to remove this staff member?')) {
          deleteStaff(id);
      }
  };

  const totalBillable = staffList.reduce((acc, s) => acc + s.currentBillable, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold text-lg", theme.text.primary)}>Staff Directory</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Manage attorney profiles, utilization targets, and performance.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>Add Staff</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          label="Total Headcount" 
          value={staffList.length} 
          icon={User} 
          trend="+2 hires this quarter" 
          trendUp={true}
          className="border-l-4 border-l-blue-600"
        />
        <MetricCard 
          label="Avg Utilization" 
          value="82%" 
          icon={Award} 
          trend="Target: 85%" 
          trendUp={false}
          className="border-l-4 border-l-purple-600"
        />
        <MetricCard 
          label="Billable Hours YTD" 
          value={totalBillable.toLocaleString()} 
          icon={TrendingUp} 
          trend="On track" 
          trendUp={true}
          className="border-l-4 border-l-emerald-600"
        />
      </div>

      <TableContainer responsive="card">
        <TableHeader>
          <TableHead>Employee</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Utilization</TableHead>
          <TableHead>Billable Target (Annual)</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableHeader>
        <TableBody>
          {staffList.map(staff => {
            const progress = (staff.currentBillable / staff.billableTarget) * 100;
            return (
              <TableRow key={staff.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={staff.name} size="sm"/>
                    <div>
                      <p className={cn("font-bold text-sm", theme.text.primary)}>{staff.name}</p>
                      <p className={cn("text-xs", theme.text.secondary)}>{staff.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{staff.role}</TableCell>
                <TableCell>
                  <Badge variant={staff.status === 'Active' ? 'success' : 'warning'}>{staff.status}</Badge>
                </TableCell>
                <TableCell>
                  <span className={`font-bold ${staff.utilizationRate < 75 ? 'text-red-500' : 'text-green-600'}`}>
                    {staff.utilizationRate}%
                  </span>
                </TableCell>
                <TableCell>
                  <div className="w-full max-w-[140px]">
                    <div className={cn("flex justify-between text-xs mb-1", theme.text.secondary)}>
                      <span>{staff.currentBillable} hrs</span>
                      <span className={theme.text.tertiary}>/ {staff.billableTarget}</span>
                    </div>
                    <div className={cn("w-full rounded-full h-1.5", theme.surfaceHighlight)}>
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button className={cn("p-1.5 rounded hover:bg-slate-100 transition-colors", theme.text.tertiary, `hover:${theme.text.primary}`)}>
                        <MoreHorizontal className="h-4 w-4"/>
                    </button>
                    <button onClick={() => handleDelete(staff.id)} className={cn("p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors")}>
                        <Trash2 className="h-4 w-4"/>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </TableContainer>

      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddStaff} 
      />
    </div>
  );
};