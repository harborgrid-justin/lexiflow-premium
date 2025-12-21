/**
 * Type definitions for Citation components
 * Extracted from individual component files for better organization and reusability
 */

import { Citation } from '../../types';

export type CitationView = 'library' | 'analyzer';

export interface CitationManagerProps {
  caseId?: string;
}

export interface CitationDetailProps {
  citation: Citation;
  onClose: () => void;
}

export interface CitationLibraryProps {
  onSelect: (citation: Citation) => void;
  caseId?: string;
}
