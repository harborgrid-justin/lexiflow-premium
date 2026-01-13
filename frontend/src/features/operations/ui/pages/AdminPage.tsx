/**
 * @module components/pages/AdminPage
 * @category Pages
 * @description System administration page - security, data management, and configuration
 */

import { AdminPanel } from '@/features/admin/AdminPanel';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import React from "react";

type AdminView = 'hierarchy' | 'security' | 'db' | 'data' | 'logs' | 'integrations';

interface AdminPageProps {
  initialTab?: AdminView;
}

/**
 * AdminPage - React 18 optimized with React.memo
 */
export const AdminPage = React.memo<AdminPageProps>(({ initialTab }) => {
  return (
    <PageContainerLayout>
      <AdminPanel initialTab={initialTab} />
    </PageContainerLayout>
  );
});
