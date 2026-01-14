/**
 * Profile Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import type { ExtendedUserProfile } from "@/types/system";
import { DataService } from "../../services/data/dataService";

export interface ProfileLoaderData {
  profile: ExtendedUserProfile | null;
}

export async function profileLoader(): Promise<ProfileLoaderData> {
  // Cast to ExtendedUserProfile assuming service returns compatible data
  const profile = (await DataService.profile
    .getCurrent()
    .catch(() => null)) as ExtendedUserProfile | null;

  return {
    profile,
  };
}
