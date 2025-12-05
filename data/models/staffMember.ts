
import { StaffMember } from '../../types';

export const MOCK_STAFF: StaffMember[] = [
  { 
    id: 's1', userId: 'usr-partner-alex',
    name: 'Alexandra H.', role: 'Senior Partner', email: 'alex@lexiflow.com', phone: '555-0101', 
    billableTarget: 1600, currentBillable: 450, utilizationRate: 85, salary: 350000, status: 'Active', startDate: '2015-06-01' 
  },
  { 
    id: 's2', userId: 'usr-assoc-james',
    name: 'James Doe', role: 'Associate', email: 'james@lexiflow.com', phone: '555-0102', 
    billableTarget: 1950, currentBillable: 620, utilizationRate: 92, salary: 180000, status: 'Active', startDate: '2021-01-15' 
  },
  { 
    id: 's3', userId: 'usr-para-sarah',
    name: 'Sarah Jenkins', role: 'Paralegal', email: 'sarah@lexiflow.com', phone: '555-0103', 
    billableTarget: 1500, currentBillable: 400, utilizationRate: 78, salary: 85000, status: 'Active', startDate: '2019-09-10' 
  },
  { 
    id: 's4', userId: 'usr-admin-justin',
    name: 'Justin Jeffrey Saadein-Morales', role: 'Administrator', email: 'justin.saadein@harborgrid.com', phone: '555-9999', 
    billableTarget: 0, currentBillable: 0, utilizationRate: 0, salary: 200000, status: 'Active', startDate: '2022-01-01' 
  },
];
