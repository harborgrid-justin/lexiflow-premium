/**
 * @module components/pages/ProfilePage
 * @category Pages
 * @description User profile and settings page
 */

import React from 'react';
import { UserProfileManager } from '@/features/profile';
import { PageContainerLayout } from '@/components/layouts';

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
