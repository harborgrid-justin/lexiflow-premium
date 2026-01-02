/**
 * Messenger Page - Server Component with Data Fetching
 * Secure messaging interface
 */
import SecureMessenger from '@/components/messenger/SecureMessenger';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Messenger | LexiFlow',
  description: 'Secure Messenger',
};

export default async function MessengerPage(): Promise<JSX.Element> {
  // Fetch recent messages
  let messages = [];

  try {
    messages = await apiFetch(API_ENDPOINTS.MESSAGING.LIST);
  } catch (error) {
    console.error('Failed to load messages:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading messenger...</div>}>
        <SecureMessenger initialMessages={messages} />
      </Suspense>
    </div>
  );
}
