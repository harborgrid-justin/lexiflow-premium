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
