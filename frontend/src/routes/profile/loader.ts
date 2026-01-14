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
    .getCurrent()
    .catch(() => null)) as ExtendedUserProfile | null;

  return {
    profile,
  };
}
