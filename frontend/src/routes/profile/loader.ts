/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Profile Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { authApi } from "@/lib/frontend-api";

import type { ExtendedUserProfile } from "@/types/system";

export interface ProfileLoaderData {
  profile: ExtendedUserProfile | null;
}

export async function clientLoader(): Promise<ProfileLoaderData> {
  try {
    const result = await authApi.getCurrentUser();
    const profile = (
      result.ok ? result.data : null
    ) as ExtendedUserProfile | null;

    return {
      profile,
    };
  } catch (error: unknown) {
    console.error("Failed to load profile:", error);
    return {
      profile: null,
    };
  }
}
