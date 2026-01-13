import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/dataService";
import { ExtendedUserProfile } from "@/types";
import { useCallback, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface UserProfileManagerState {
  activeTab: string;
  profile: ExtendedUserProfile | undefined;
  isLoading: boolean;
}

export interface UserProfileManagerActions {
  setActiveTab: (tab: string) => void;
  refreshProfile: () => void;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Manager hook for the User Profile feature.
 *
 * Adheres to Advanced React Guidelines:
 * - Rule 43: Stable return shape [state, actions]
 * - Rule 53: Semantic stability for actions
 */
export const useUserProfileManager = (): [
  UserProfileManagerState,
  UserProfileManagerActions,
] => {
  const [activeTab, setActiveTabState] = useState("overview");

  // Check if user is authenticated before fetching profile
  const isAuthenticated =
    typeof window !== "undefined"
      ? !!localStorage.getItem("lexiflow_auth_token")
      : false;

  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery<ExtendedUserProfile>(
    ["profile", "current"],
    () => DataService.profile.getCurrentProfile(),
    { enabled: isAuthenticated } // Only fetch if authenticated
  );

  // Rule 53: Stable callbacks
  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
  }, []);

  const refreshProfile = useCallback(() => {
    refetch();
  }, [refetch]);

  return [
    {
      activeTab,
      profile,
      isLoading,
    },
    {
      setActiveTab,
      refreshProfile,
    },
  ];
};
