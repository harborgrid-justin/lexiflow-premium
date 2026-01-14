/**
 * Profile Domain - View Component
 * Enterprise React Architecture
 */

import { TabbedPageLayout } from '@/components/layouts';
import { USER_PROFILE_TAB_CONFIG } from '@/config/tabs.config';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { Suspense } from 'react';
import { useProfile } from './ProfileProvider';
import { AccessMatrixEditor } from './components/AccessMatrixEditor';
import { PreferencePane } from './components/PreferencePane';
import { ProfileOverview } from './components/ProfileOverview';
import { SecurityPane } from './components/SecurityPane';

export function ProfileView() {
  const { profile, activeTab, setActiveTab } = useProfile();

  if (!profile) {
    return <LazyLoader message="Loading User Profile..." />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <ProfileOverview profile={profile} />;
      case 'preferences': return <PreferencePane profile={profile} />;
      case 'access': return <AccessMatrixEditor profile={profile} />;
      case 'security': return <SecurityPane profile={profile} />;
      case 'audit': return <div className="p-6 text-center text-slate-500">Audit logs visualization component placeholder.</div>;
      default: return <ProfileOverview profile={profile} />;
    }
  };

  return (
    <TabbedPageLayout
      pageTitle="User Profile"
      pageSubtitle="Manage identity, granular permissions, and workspace preferences."
      tabConfig={USER_PROFILE_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
    >
      <div className="h-full">
        <Suspense fallback={<LazyLoader />}>
          {renderContent()}
        </Suspense>
      </div>
    </TabbedPageLayout>
  );
}
