/**
 * Profile Domain - Page Component
 */

import { ProfileProvider } from './ProfileProvider';
import { ProfileView } from './ProfileView';

export function ProfilePage() {
  return (
    <ProfileProvider>
      <ProfileView />
    </ProfileProvider>
  );
}

export default ProfilePage;
