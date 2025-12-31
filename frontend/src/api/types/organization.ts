import { Organization, OrganizationStatusEnum, OrganizationTypeEnum } from '@/types/system';
import { OrgId } from '@/types/primitives';

/**
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.organizations.getAll() with queryKeys.organizations.all() instead
 * This constant is only for seeding and testing purposes.
 */
export const MOCK_ORGS: Organization[] = [
  { id: 'org-1' as OrgId, name: 'LexiFlow LLP', organizationType: OrganizationTypeEnum.PARTNERSHIP, type: 'LawFirm', domain: 'lexiflow.com', status: OrganizationStatusEnum.ACTIVE },
  { id: 'org-2' as OrgId, name: 'TechCorp Industries', organizationType: OrganizationTypeEnum.CORPORATION, type: 'Corporate', domain: 'techcorp.com', status: OrganizationStatusEnum.ACTIVE },
  { id: 'org-3' as OrgId, name: 'Vendor Corp', organizationType: OrganizationTypeEnum.CORPORATION, type: 'Vendor', domain: 'vendor.com', status: OrganizationStatusEnum.ACTIVE },
];
