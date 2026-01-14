import type { RealEstateCostShare } from "@/services/domain/RealEstateDomain";

export interface CostShareLoaderData {
  data: RealEstateCostShare[];
  stats: {
    total: number;
    active: number;
    totalAmount: number;
  };
}
