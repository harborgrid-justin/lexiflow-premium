/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Profile Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";
import type { ExtendedUserProfile } from "@/types/system";

export interface ProfileLoaderData {
  profile: ExtendedUserProfile | null;
}

export async function profileLoader() {
  // Cast to ExtendedUserProfile assuming service returns compatible data
  const profile = (await DataService.profile
    .getCurrentProfile()
    .catch(() => null)) as ExtendedUserProfile | null;

  return {
    profile,
  };
}
