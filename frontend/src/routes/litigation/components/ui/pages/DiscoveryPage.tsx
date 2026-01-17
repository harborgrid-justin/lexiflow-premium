/**
 * @module components/pages/DiscoveryPage
 * @category Pages
 * @description Discovery management page - comprehensive e-discovery platform
 */

import React from "react";

import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import DiscoveryDashboard from '@/routes/discovery/components/platform/dashboard/DiscoveryDashboard';

import { type DiscoveryView } from '@/hooks/useDiscoveryPlatform';


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
