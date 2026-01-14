/**
 * Messages & Communication Domain - Page Component
 */

import { MessagesProvider } from './MessagesProvider';
import { MessagesView } from './MessagesView';

export function MessagesPage() {
  return (
    <MessagesProvider>
      <MessagesView />
    </MessagesProvider>
  );
}

export default MessagesPage;
