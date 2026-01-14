/**
 * @module components/pages/ClauseLibraryPage
 * @category Pages
 * @description Clause library page - reusable legal clauses and templates
 */

import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import ClauseLibrary from '@/routes/clauses/components/ClauseLibrary';
import type { Clause } from '@/types/pleadings';
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
