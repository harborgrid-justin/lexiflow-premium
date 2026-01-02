import SecureMessenger from '@/components/messenger/SecureMessenger';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messenger | LexiFlow',
  description: 'Secure Messenger',
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SecureMessenger />
    </div>
  );
}
