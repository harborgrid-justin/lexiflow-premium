

import { Organization, OrgId, OrganizationStatusEnum } from '../../types';

/**
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.organizations.getAll() with queryKeys.organizations.all() instead
 * This constant is only for seeding and testing purposes.
 */
export const MOCK_ORGS: Organization[] = [
  { id: 'org-1' as OrgId, name: 'LexiFlow LLP', type: 'LawFirm', domain: 'lexiflow.com', status: OrganizationStatusEnum.ACTIVE },
  { id: 'org-2' as OrgId, name: 'TechCorp Industries', type: 'Corporate', domain: 'techcorp.com', status: OrganizationStatusEnum.ACTIVE },
  { id: 'org-3' as OrgId, name: 'Vendor Corp', type: 'Vendor', domain: 'vendor.com', status: OrganizationStatusEnum.ACTIVE },
];
