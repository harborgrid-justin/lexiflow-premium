/**
 * Staff Member API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.hr.getStaff() with queryKeys.hr.staff() instead.
 * This constant is only for seeding and testing purposes.
 * 
 * Backend alignment: /backend/src/hr/entities/employee.entity.ts
 */

import { StaffMember, UUID, UserId } from '@/types';

/**
 * @deprecated MOCK DATA - Use DataService.hr instead
 */
export const MOCK_STAFF: StaffMember[] = [
  { 
    id: 's1' as UUID, 
    userId: 'usr-partner-alex' as UserId,
    name: 'Alexandra H.', role: 'Senior Partner', email: 'alex@lexiflow.com', phone: '555-0101', 
    billableTarget: 1600, currentBillable: 450, utilizationRate: 85, salary: 350000, status: 'Active', startDate: '2015-06-01' 
  },
  { 
    id: 's2' as UUID, 
    userId: 'usr-assoc-james' as UserId,
    name: 'James Doe', role: 'Associate', email: 'james@lexiflow.com', phone: '555-0102', 
    billableTarget: 1950, currentBillable: 620, utilizationRate: 92, salary: 180000, status: 'Active', startDate: '2021-01-15' 
  },
  { 
    id: 's3' as UUID, 
    userId: 'usr-para-sarah' as UserId,
    name: 'Sarah Jenkins', role: 'Paralegal', email: 'sarah@lexiflow.com', phone: '555-0103', 
    billableTarget: 1500, currentBillable: 400, utilizationRate: 78, salary: 85000, status: 'Active', startDate: '2019-09-10' 
  },
  { 
    id: 's4' as UUID, 
    userId: 'usr-admin-justin' as UserId,
    name: 'Justin Jeffrey Saadein-Morales', role: 'Administrator', email: 'justin.saadein@harborgrid.com', phone: '555-9999', 
    billableTarget: 0, currentBillable: 0, utilizationRate: 0, salary: 200000, status: 'Active', startDate: '2022-01-01' 
  },
];
