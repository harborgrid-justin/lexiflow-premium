/**
 * Messenger Page - Server Component with Data Fetching
 * Secure messaging interface
 */
import React from 'react';
import SecureMessenger from '@/components/messenger/SecureMessenger';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Messenger | LexiFlow',
  description: 'Secure Messenger',
};

export default async function MessengerPage(): Promise<React.JSX.Element> {
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
