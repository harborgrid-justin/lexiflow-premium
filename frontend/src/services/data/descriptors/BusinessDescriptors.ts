import { CRMService } from "@/services/domain/CRMDomain";
import { MarketingService } from "@/services/domain/MarketingDomain";
import { ProfileDomain } from "@/services/domain/ProfileDomain";

export const BusinessDescriptors: PropertyDescriptorMap = {
  crm: { get: () => CRMService, enumerable: true },
  marketing: { get: () => MarketingService, enumerable: true },
  profile: { get: () => ProfileDomain, enumerable: true },
  strategy: {
    get: () =>
      import("@/services/domain/StrategyDomain").then((m) => m.StrategyService),
    enumerable: true,
  },
};
