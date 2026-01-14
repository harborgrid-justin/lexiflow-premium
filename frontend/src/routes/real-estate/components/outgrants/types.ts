import type { RealEstateOutgrant } from "@/services/domain/RealEstateDomain";

export interface OutgrantsLoaderData {
  data: RealEstateOutgrant[];
  stats: {
    total: number;
    active: number;
    pendingRenewal: number;
  };
}
