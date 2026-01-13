import { useState } from 'react';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { ExtendedUserProfile } from '@/types';

export const useUserProfileManager = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: profile, isLoading } = useQuery<ExtendedUserProfile>(
    ['profile', 'current'],
    () => DataService.profile.getCurrentProfile()
  );

  return {
    activeTab,
    setActiveTab,
    profile,
    isLoading
  };
};
