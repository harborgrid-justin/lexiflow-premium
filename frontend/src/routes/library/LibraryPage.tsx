/**
 * Library Domain - Page Component
 */

import { LibraryProvider } from './LibraryProvider';
import { LibraryView } from './LibraryView';

export function LibraryPage() {
  return (
    <LibraryProvider>
      <LibraryView />
    </LibraryProvider>
  );
}

export default LibraryPage;
