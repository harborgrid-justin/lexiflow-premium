import { CRMService } from "@/services/domain/CRMDomain";
import { MarketingService } from "@/services/domain/MarketingDomain";
import { ProfileDomain } from "@/services/domain/ProfileDomain";
import { StrategyService } from "@/services/domain/StrategyDomain";

export const BusinessDescriptors: PropertyDescriptorMap = {
  crm: { get: () => CRMService, enumerable: true },
  marketing: { get: () => MarketingService, enumerable: true },
  profile: { get: () => ProfileDomain, enumerable: true },
  strategy: {
    get: () => StrategyService,
    enumerable: true,
  },
};
