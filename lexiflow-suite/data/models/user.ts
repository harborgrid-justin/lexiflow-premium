
import { User } from '../../types.ts';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alexandra H.', role: 'Senior Partner', office: 'New York' }, 
  { id: 'u2', name: 'James Doe', role: 'Associate', office: 'Chicago' },
  { id: 'u3', name: 'Sarah Jenkins', role: 'Paralegal', office: 'New York' }, 
  { id: 'u4', name: 'Admin User', role: 'Administrator', office: 'Remote' }
];

export const HIERARCHY_USERS: User[] = [
  // LexiFlow Internal
  { id: 'u1', name: 'Alexandra H.', email: 'alex@lexiflow.com', role: 'Senior Partner', orgId: 'org-1', groupIds: ['g-1', 'g-3'], userType: 'Internal', office: 'New York' },
  { id: 'u2', name: 'James Doe', email: 'james@lexiflow.com', role: 'Associate', orgId: 'org-1', groupIds: ['g-1'], userType: 'Internal', office: 'Chicago' },
  { id: 'u3', name: 'Sarah Jenkins', email: 'sarah@lexiflow.com', role: 'Paralegal', orgId: 'org-1', groupIds: ['g-1', 'g-4'], userType: 'Internal', office: 'New York' },
  { id: 'u4', name: 'Admin User', email: 'admin@lexiflow.com', role: 'Administrator', orgId: 'org-1', groupIds: ['g-3'], userType: 'Internal', office: 'Remote' },
  
  // External Clients
  { id: 'u5', name: 'John Doe (GC)', email: 'j.doe@techcorp.com', role: 'Client User', orgId: 'org-2', groupIds: ['g-5'], userType: 'External', office: 'San Francisco' },
  { id: 'u6', name: 'Jane Smith (HR)', email: 'j.smith@techcorp.com', role: 'Client User', orgId: 'org-2', groupIds: ['g-6'], userType: 'External', office: 'San Francisco' },
  
  // External Vendors
  { id: 'u7', name: 'Dr. Aris', email: 'aris@forensics.io', role: 'Guest', orgId: 'org-4', groupIds: [], userType: 'External', office: 'Lab A' }
];
