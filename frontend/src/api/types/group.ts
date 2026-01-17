/**
 * Group API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.admin.getGroups() with queryKeys.admin.groups() instead.
 * This constant is only for seeding and testing purposes.
 * 
 * Backend alignment: /backend/src/groups/entities/group.entity.ts
 */

import { type GroupId, type OrgId } from '@/types/primitives';
import { type Group } from '@/types/system';

/**
 * @deprecated MOCK DATA - Use DataService.admin instead
 */
export const MOCK_GROUPS: Group[] = [
  // LexiFlow Groups
  { id: 'g-1' as GroupId, orgId: 'org-1' as OrgId, name: 'Litigation Team A', description: 'Primary Civil Litigation Unit', permissions: ['case_view', 'case_edit', 'billing_log'] },
  { id: 'g-2' as GroupId, orgId: 'org-1' as OrgId, name: 'M&A Department', description: 'Mergers & Acquisitions', permissions: ['case_view', 'case_edit', 'contract_review'] },
  { id: 'g-3' as GroupId, orgId: 'org-1' as OrgId, name: 'Partner Committee', description: 'Senior Management', permissions: ['admin', 'billing_approve'] },
  { id: 'g-4' as GroupId, orgId: 'org-1' as OrgId, name: 'Paralegal Pool', description: 'Support Staff', permissions: ['case_view', 'discovery_log'] },
  
  // TechCorp Groups
  { id: 'g-5' as GroupId, orgId: 'org-2' as OrgId, name: 'Legal Department', description: 'In-House Counsel', permissions: ['case_view', 'portal_access'] },
  { id: 'g-6' as GroupId, orgId: 'org-2' as OrgId, name: 'HR Leadership', description: 'Human Resources Execs', permissions: ['limited_view'] },
];
