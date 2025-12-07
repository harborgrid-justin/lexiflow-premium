

import { User, UserId, OrgId, GroupId } from '../../types';

export const MOCK_USERS: User[] = [
  // Primary Admin User - Matched to XML Party Data
  { 
    // FIX: Cast string to branded type UserId
    id: 'usr-admin-justin' as UserId, 
    name: 'Justin Jeffrey Saadein-Morales', 
    email: 'justin.saadein@harborgrid.com', 
    role: 'Administrator', 
    // FIX: Cast string to branded type OrgId
    orgId: 'org-1' as OrgId, 
    // FIX: Cast string to branded type GroupId
    groupIds: ['g-1' as GroupId, 'g-3' as GroupId, 'g-admin' as GroupId], 
    userType: 'Internal', 
    office: 'Washington, DC'
  },
  // Secondary Users
  { 
    // FIX: Cast string to branded type UserId
    id: 'usr-partner-alex' as UserId, 
    name: 'Alexandra H.', 
    email: 'alex@lexiflow.com', 
    role: 'Senior Partner', 
    // FIX: Cast string to branded type OrgId
    orgId: 'org-1' as OrgId, 
    // FIX: Cast string to branded type GroupId
    groupIds: ['g-1' as GroupId, 'g-3' as GroupId], 
    userType: 'Internal', 
    office: 'New York' 
  },
  { 
    // FIX: Cast string to branded type UserId
    id: 'usr-assoc-james' as UserId, 
    name: 'James Doe', 
    email: 'james@lexiflow.com', 
    role: 'Associate', 
    // FIX: Cast string to branded type OrgId
    orgId: 'org-1' as OrgId, 
    // FIX: Cast string to branded type GroupId
    groupIds: ['g-1' as GroupId], 
    userType: 'Internal', 
    office: 'Chicago' 
  },
  { 
    // FIX: Cast string to branded type UserId
    id: 'usr-para-sarah' as UserId, 
    name: 'Sarah Jenkins', 
    email: 'sarah@lexiflow.com', 
    role: 'Paralegal', 
    // FIX: Cast string to branded type OrgId
    orgId: 'org-1' as OrgId, 
    // FIX: Cast string to branded type GroupId
    groupIds: ['g-1' as GroupId, 'g-4' as GroupId], 
    userType: 'Internal', 
    office: 'New York' 
  },
  // External Users
  { 
    // FIX: Cast string to branded type UserId
    id: 'usr-client-doe' as UserId, 
    name: 'John Doe (GC)', 
    email: 'j.doe@techcorp.com', 
    role: 'Client User', 
    // FIX: Cast string to branded type OrgId
    orgId: 'org-2' as OrgId, 
    // FIX: Cast string to branded type GroupId
    groupIds: ['g-5' as GroupId], 
    userType: 'External', 
    office: 'San Francisco' 
  }
];

export const HIERARCHY_USERS = MOCK_USERS;