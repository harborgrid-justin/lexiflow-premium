/**
 * Evidence Page - Server Component
 */
import EvidenceVault from '@/components/evidence/EvidenceVault';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evidence Vault | LexiFlow',
  description: 'Secure chain of custody and forensic asset management',
};

export default function EvidencePage() {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <EvidenceVault />
    </div>
  );
}
