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
import { Activity, Settings, Shield, Sliders, UserCircle } from 'lucide-react';
import { useState } from 'react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Components
import { TabbedPageLayout } from '@/components/layouts';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { AccessMatrixEditor } from './AccessMatrixEditor';
import { PreferencePane } from './PreferencePane';
import { ProfileOverview } from './ProfileOverview';
import { SecurityPane } from './SecurityPane';

// Services & Data
import { DataService } from '@/services/data/dataService';

// Hooks & Context
import { useQuery } from '@/hooks/useQueryHooks';

// Types
import { ExtendedUserProfile } from '@/types';

// ========================================
// CONSTANTS
// ========================================
const PROFILE_TABS = [
  {
    id: 'general', label: 'General', icon: UserCircle,
    subTabs: [
      { id: 'overview', label: 'Overview', icon: UserCircle },
      { id: 'preferences', label: 'Preferences', icon: Sliders },
    ]
  },
  {
    id: 'security', label: 'Security & Access', icon: Shield,
    subTabs: [
      { id: 'access', label: 'Access Matrix', icon: Settings },
      { id: 'security', label: 'Security & Sessions', icon: Shield },
      { id: 'audit', label: 'Audit Log', icon: Activity },
    ]
  }
];

// ========================================
// COMPONENT
// ========================================
export const UserProfileManager = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: profile, isLoading } = useQuery<ExtendedUserProfile>(
    ['profile', 'current'],
    DataService.profile.getCurrentProfile
  );

  const renderContent = () => {
    if (!profile) return null;
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
      tabConfig={PROFILE_TABS}
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
