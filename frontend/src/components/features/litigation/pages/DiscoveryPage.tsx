/**
 * @module components/pages/DiscoveryPage
 * @category Pages
 * @description Discovery management page - comprehensive e-discovery platform
 */

import DiscoveryDashboard from '@/features/litigation/discovery/dashboard/DiscoveryDashboard';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import { DiscoveryView } from '@/hooks/useDiscoveryPlatform';
import React from "react";

interface DiscoveryPageProps {
  onNavigate: (view: DiscoveryView, id?: string) => void;
}

/**
 * DiscoveryPage - React 18 optimized with React.memo
 */
export const DiscoveryPage = React.memo<DiscoveryPageProps>(({ onNavigate }) => {
  return (
    <PageContainerLayout>
      <DiscoveryDashboard onNavigate={onNavigate} />
    </PageContainerLayout>
  );
});