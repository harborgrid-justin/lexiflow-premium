import type { RealEstateProperty } from "@/services/domain/RealEstateDomain";

export interface InventoryLoaderData {
  data: RealEstateProperty[];
  stats: {
    total: number;
    active: number;
    pending: number;
  };
}
