import type {
  AcquisitionStatus,
  RealEstateAcquisition,
} from "@/services/domain/RealEstateDomain";

export type { AcquisitionStatus, RealEstateAcquisition };

export interface AcquisitionStats {
  total: number;
  pending: number;
  completed: number;
  totalInvestment: number;
}

export interface AcquisitionLoaderData {
  data: RealEstateAcquisition[];
  stats: AcquisitionStats;
}
