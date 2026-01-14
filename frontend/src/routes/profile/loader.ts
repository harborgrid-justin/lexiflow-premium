/**
 * Profile Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "../../services/data/dataService";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  avatar?: string;
  bio?: string;
};

export interface ProfileLoaderData {
  profile: UserProfile | null;
}

export async function profileLoader(): Promise<ProfileLoaderData> {
  const profile = await DataService.profile.getCurrent().catch(() => null);

  return {
    profile,
  };
}
