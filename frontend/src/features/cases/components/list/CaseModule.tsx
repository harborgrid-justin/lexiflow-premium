import React from 'react';
import { CaseManagement } from '@features/cases';

/**
 * Case Module Router
 * Renders the full Case Management interface with tabs
 * The CaseManagement component handles all internal routing via tabs
 */
export const CaseModule: React.FC = () => {
  return <CaseManagement />;
};
