

import { Organization, OrgId } from '../../types';

export const MOCK_ORGS: Organization[] = [
  // FIX: Cast string to branded type OrgId
  { id: 'org-1' as OrgId, name: 'LexiFlow LLP', type: 'LawFirm', domain: 'lexiflow.com', status: 'Active' },
  // FIX: Cast string to branded type OrgId
  { id: 'org-2' as OrgId, name: 'TechCorp Industries', type: 'Corporate', domain: 'techcorp.com', status: 'Active' },
  // FIX: Cast string to branded type OrgId
  { id: 'org-3' as Org