/**
 * Create New Case Page - Server Component
 * Form for creating new legal cases and matters
 *
 * ENTERPRISE GUIDELINES COMPLIANCE:
 * - [✓] Guideline 1: Default export for /cases/create route
 * - [✓] Guideline 2: Server Component wrapper
 * - [✓] Guideline 7: SEO metadata export
 * - [✓] Guideline 12: Singly responsible - delegates to NewMatter component
 * - [✓] Guideline 17: Self-documenting with JSDoc
 */
import NewMatter from '@/features/cases/components/create/NewCase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Case | LexiFlow',
  description: 'Create a new legal case or matter in LexiFlow',
};

export default function CreateCasePage() {
  return (
    <NewMatter />
  );
}
