
import React, { useState, useEffect } from 'react';
import { TabbedPageLayout } from '../layout/TabbedPageLayout';
import { UserCircle, Shield, Settings, Sliders, Activity } from 'lucide-react';
import { ProfileOverview } from './ProfileOverview';
import { AccessMatrixEditor } from './AccessMatrixEditor';
import { SecurityPane } from './SecurityPane';
import { PreferencePane } from './PreferencePane';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { ExtendedUserProfile } from '../../types';
import { LazyLoader } from '../common/LazyLoader';

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

export const UserProfileManager: React.FC = () => {
  const { theme } = useTheme();
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
      <div className={cn("h-full", theme.surface)}>
        {renderContent()}
      </div>
    </TabbedPageLayout>
  );
};
export default UserProfileManager;
