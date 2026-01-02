/**
 * Exhibits Page - Server Component
 */
import ExhibitManager from '@/components/exhibits/ExhibitManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exhibits | LexiFlow',
  description: 'Trial exhibit management and digital stickering',
};

export default function ExhibitsPage() {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <ExhibitManager />
    </div>
  );
}
