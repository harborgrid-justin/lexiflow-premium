import { User } from '../types';

export const MOCK_USERS: User[] = [
  // Primary Admin User - Matched to XML Party Data
  {
    id: 'usr-admin-justin',
    name: 'Justin Jeffrey Saadein-Morales',
    email: 'justin.saadein@harborgrid.com',
    role: 'Administrator',
    orgId: 'org-1',
    groupIds: ['g-1', 'g-3', 'g-admin'],
    userType: 'Internal',
    office: 'Washington, DC'
  },
  // Secondary Users
  {
    id: 'usr-partner-alex',
    name: 'Alexandra H.',
    email: 'alex@lexiflow.com',
    role: 'Senior Partner',
    orgId: 'org-1',
    groupIds: ['g-1', 'g-3'],
    userType: 'Internal',
    office: 'New York'
  },
  {
    id: 'usr-assoc-james',
    name: 'James Doe',
    email: 'james@lexiflow.com',
    role: 'Associate',
    orgId: 'org-1',
    groupIds: ['g-1'],
    userType: 'Internal',
    office: 'Chicago'
  },
  {
    id: 'usr-para-sarah',
    name: 'Sarah Jenkins',
    email: 'sarah@lexiflow.com',
    role: 'Paralegal',
    orgId: 'org-1',
    groupIds: ['g-1', 'g-4'],
    userType: 'Internal',
    office: 'New York'
  },
  // External Users
  {
    id: 'usr-client-doe',
    name: 'John Doe (GC)',
    email: 'j.doe@techcorp.com',
    role: 'Client User',
    orgId: 'org-2',
    groupIds: ['g-5'],
    userType: 'External',
    office: 'San Francisco'
  }
];

export const HIERARCHY_USERS = MOCK_USERS;