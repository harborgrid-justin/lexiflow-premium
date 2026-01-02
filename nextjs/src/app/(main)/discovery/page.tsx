/**
 * Discovery Page - Server Component
 */
import DiscoveryPlatform from '@/components/discovery/DiscoveryPlatform';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discovery | LexiFlow',
  description: 'Manage discovery process, requests, and legal holds',
};

export default function DiscoveryPage() {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <DiscoveryPlatform />
    </div>
  );
}
