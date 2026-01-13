/**
 * @module components/profile/UserProfileManager
 * @category User Profile
 * @description Tabbed user profile management interface with overview, preferences, access matrix,
 * security settings, and audit logs. Uses TabbedPageLayout with lazy-loaded sub-components and
 * DataService for profile data fetching.
 *
 * THEME SYSTEM USAGE:
 * - theme.surface.default - Page background
 * - Tab theming handled by TabbedPageLayout component
 * - Child components handle their own theme integration
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Components
import { TabbedPageLayout } from '@/components/layouts';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { AccessMatrixEditor } from './AccessMatrixEditor';
import { PreferencePane } from './PreferencePane';
import { ProfileOverview } from './ProfileOverview';
import { SecurityPane } from './SecurityPane';

// Services & Data
import { USER_PROFILE_TAB_CONFIG } from '@/config/tabs.config';

// Hooks
import { useUserProfileManager } from './hooks/useUserProfileManager';

// ========================================
// COMPONENT
// ========================================
export const UserProfileManager = () => {
  const [{ activeTab, profile, isLoading }, { setActiveTab }] = useUserProfileManager();

  const renderContent = () => {
    // LAYOUT-STABLE: Always render something to prevent layout shift
    if (!profile) {
      return (
        <div className="p-6 flex items-center justify-center">
          <div className="text-slate-400 animate-pulse">Loading profile data...</div>
        </div>
      );
    }
    switch (activeTab) {
      case 'overview': return <ProfileOverview profile={profile} />;
      case 'preferences': return <PreferencePane profile={profile} />;
      case 'access': return <AccessMatrixEditor profile={profile} />;
      case 'security': return <SecurityPane profile={profile} />;
      case 'audit': return <div className="p-6 text-center text-slate-500">Audit logs visualization component placeholder.</div>;
      default: return <ProfileOverview profile={profile} />;
    }
  };

  if (isLoading) return <LazyLoader message="Loading User Profile..." />;

  return (
    <TabbedPageLayout
      pageTitle="User Profile"
      pageSubtitle="Manage identity, granular permissions, and workspace preferences."
      tabConfig={USER_PROFILE_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="h-full">
        {renderContent()}
      </div>
    </TabbedPageLayout>
  );
};
export default UserProfileManager;
