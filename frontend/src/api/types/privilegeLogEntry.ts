/**
 * Privilege Log Entry API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.discovery.getPrivilegeLog() with queryKeys.discovery.privilegeLog() instead.
 * This constant is only for seeding and testing purposes.
 */

import { PrivilegeLogEntry } from '@/types/discovery';
import { UUID } from '@/types/primitives';

/**
 * @deprecated MOCK DATA - Use DataService.discovery instead
 */
export const MOCK_PRIVILEGE_LOG: PrivilegeLogEntry[] = [
  { id: 'PL-001' as UUID, date: '2023-11-10', author: 'J. Smith', recipient: 'K. Jones', type: 'Email', basis: 'Attorney-Client Privilege', desc: 'Legal advice re: termination risk.' },
  { id: 'PL-002' as UUID, date: '2023-11-12', author: 'General Counsel', recipient: 'Board', type: 'Memo', basis: 'Work Product', desc: 'Case strategy and litigation anticipation.' },
];
