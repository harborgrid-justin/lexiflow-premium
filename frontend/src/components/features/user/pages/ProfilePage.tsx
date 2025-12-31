/**
 * @module components/pages/ProfilePage
 * @category Pages
 * @description User profile and settings page
 */

import React from 'react';
import { UserProfileManager } from '@/features/profile/UserProfileManager';
import { PageContainerLayout } from '@/components/ui/layouts/PageContainerLayout/PageContainerLayout';

/**
 * ProfilePage - React 18 optimized with React.memo
 */
export const ProfilePage = React.memo(() => {
  return (
    <PageContainerLayout maxWidth="5xl">
      <UserProfileManager />
    </PageContainerLayout>
  );
});
