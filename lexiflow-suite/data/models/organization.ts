
import { Organization } from '../../types.ts';

export const MOCK_ORGS: Organization[] = [
  { id: 'org-1', name: 'LexiFlow LLP', type: 'LawFirm', domain: 'lexiflow.com', status: 'Active' },
  { id: 'org-2', name: 'TechCorp Industries', type: 'Corporate', domain: 'techcorp.com', status: 'Active' },
  { id: 'org-3', name: 'Superior Court of CA', type: 'Court', domain: 'courts.ca.gov', status: 'Active' },
  { id: 'org-4', name: 'Forensic Analytics Inc', type: 'Vendor', domain: 'forensics.io', status: 'Active' }
];
