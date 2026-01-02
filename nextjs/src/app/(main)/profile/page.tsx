import UserProfileManager from '@/components/profile/UserProfileManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | LexiFlow',
  description: 'User Profile',
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfileManager />
    </div>
  );
}
