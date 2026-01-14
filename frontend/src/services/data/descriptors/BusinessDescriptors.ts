import { CRMService } from "@/services/domain/crm.service";
import { MarketingService } from "@/services/domain/marketing.service";
import { ProfileDomain } from "@/services/domain/profile.service";
import { StrategyService } from "@/services/domain/strategy.service";

export const BusinessDescriptors: PropertyDescriptorMap = {
  crm: { get: () => CRMService, enumerable: true },
  marketing: { get: () => MarketingService, enumerable: true },
  profile: { get: () => ProfileDomain, enumerable: true },
  strategy: {
    get: () => StrategyService,
    enumerable: true,
  },
};
