
import { StaffMember } from '../../types.ts';

export const MOCK_STAFF: StaffMember[] = [
  { id: 's1', name: 'Alexandra H.', role: 'Senior Partner', email: 'alex@lexiflow.com', phone: '555-0101', billableTarget: 1600, currentBillable: 450, utilizationRate: 85, salary: 350000, status: 'Active', startDate: '2015-06-01' },
  { id: 's2', name: 'James Doe', role: 'Associate', email: 'james@lexiflow.com', phone: '555-0102', billableTarget: 1950, currentBillable: 620, utilizationRate: 92, salary: 180000, status: 'Active', startDate: '2021-01-15' },
  { id: 's3', name: 'Sarah Jenkins', role: 'Paralegal', email: 'sarah@lexiflow.com', phone: '555-0103', billableTarget: 1500, currentBillable: 400, utilizationRate: 78, salary: 85000, status: 'Active', startDate: '2019-09-10' },
  { id: 's4', name: 'Michael Chen', role: 'Associate', email: 'mike@lexiflow.com', phone: '555-0104', billableTarget: 1950, currentBillable: 150, utilizationRate: 60, salary: 175000, status: 'On Leave', startDate: '2022-03-01' },
];
