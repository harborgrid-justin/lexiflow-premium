import type { RealEstateRelocation } from "@/services/domain/RealEstateDomain";

export interface RelocationLoaderData {
  data: RealEstateRelocation[];
  stats: {
    total: number;
    inProgress: number;
    completed: number;
  };
}
