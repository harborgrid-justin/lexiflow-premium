/**
 * @module components/pages/ClauseLibraryPage
 * @category Pages
 * @description Clause library page - reusable legal clauses and templates
 */

import React from 'react';
import { ClauseLibrary } from '@/features/knowledge/clauses';
import { PageContainerLayout } from '@/components/layouts';
import type { Clause } from '@/types';

/**
 * ClauseLibraryPage - React 18 optimized with React.memo
 */
export const ClauseLibraryPage = React.memo(() => {
  return (
    <PageContainerLayout>
      <ClauseLibrary onSelectClause={(clause: Clause) => console.log('Selected clause:', clause)} />
    </PageContainerLayout>
  );
});
