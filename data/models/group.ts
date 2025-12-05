
import { Group } from '../../types';

export const MOCK_GROUPS: Group[] = [
  // LexiFlow Groups
  { id: 'g-1', orgId: 'org-1', name: 'Litigation Team A', description: 'Primary Civil Litigation Unit', permissions: ['case_view', 'case_edit', 'billing_log'] },
  { id: 'g-2', orgId: 'org-1', name: 'M&A Department', description: 'Mergers & Acquisitions', permissions: ['case_view', 'case_edit', 'contract_review'] },
  { id: 'g-3', orgId: 'org-1', name: 'Partner Committee', description: 'Senior Management', permissions: ['admin', 'billing_approve'] },
  { id: 'g-4', orgId: 'org-1', name: 'Paralegal Pool', description: 'Support Staff', permissions: ['case_view', 'discovery_log'] },
  
  // TechCorp Groups
  { id: 'g-5', orgId: 'org-2', name: 'Legal Department', description: 'In-House Counsel', permissions: ['case_view', 'portal_access'] },
  { id: 'g-6', orgId: 'org-2', name: 'HR Leadership', description: 'Human Resources Execs', permissions: ['limited_view'] },
];
