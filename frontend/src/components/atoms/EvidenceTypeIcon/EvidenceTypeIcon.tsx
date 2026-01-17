/**
 * @module components/common/EvidenceTypeIcon
 * @category Common
 * @description Icon selector for evidence types.
 *
 * THEME SYSTEM USAGE:
 * Uses hardcoded colors for evidence type differentiation.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Box, Activity, FileText, Fingerprint } from 'lucide-react';

import { type EvidenceType } from '@/types';

import { getIconClass } from './EvidenceTypeIcon.styles';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Types

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EvidenceTypeIconProps {
  type: EvidenceType;
  className?: string;
}

export function EvidenceTypeIcon({ type, className = "h-5 w-5" }: EvidenceTypeIconProps) {
  switch(type) {
    case 'Physical': return <Box className={getIconClass(type, className)}/>;
    case 'Digital': return <Activity className={getIconClass(type, className)}/>;
    case 'Document': return <FileText className={getIconClass(type, className)}/>;
    default: return <Fingerprint className={getIconClass(type, className)}/>;
  }
}
