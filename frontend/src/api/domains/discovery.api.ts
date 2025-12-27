/**
 * Discovery & Evidence Domain API Services
 * Evidence, custodians, depositions, legal holds, productions, privilege log
 */

import { EvidenceApiService } from '@/api';
import { CustodiansApiService } from '@/api';
import { ExaminationsApiService } from '@/api';
import { WitnessesApiService } from '@/api';
import { DepositionsApiService } from '@/api';
import { LegalHoldsApiService } from '@/api';
import { ProductionsApiService } from '@/api';
import { DiscoveryRequestsApiService } from '@/api';
import { ESISourcesApiService } from '@/api';
import { PrivilegeLogApiService } from '@/api';
import { CustodianInterviewsApiService } from '@/api';
import { DiscoveryApiService } from '@/api';

// Export service classes
export {
  EvidenceApiService,
  CustodiansApiService,
  ExaminationsApiService,
  WitnessesApiService,
  DepositionsApiService,
  LegalHoldsApiService,
  ProductionsApiService,
  DiscoveryRequestsApiService,
  ESISourcesApiService,
  PrivilegeLogApiService,
  CustodianInterviewsApiService,
  DiscoveryApiService,
};

// Export singleton instances
export const discoveryApi = {
  evidence: new EvidenceApiService(),
  custodians: new CustodiansApiService(),
  examinations: new ExaminationsApiService(),
  witnesses: new WitnessesApiService(),
  depositions: new DepositionsApiService(),
  legalHolds: new LegalHoldsApiService(),
  productions: new ProductionsApiService(),
  discoveryRequests: new DiscoveryRequestsApiService(),
  esiSources: new ESISourcesApiService(),
  privilegeLog: new PrivilegeLogApiService(),
  custodianInterviews: new CustodianInterviewsApiService(),
  discovery: new DiscoveryApiService(),
} as const;
