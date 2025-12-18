/**
 * Discovery & Evidence Domain API Services
 * Evidence, custodians, depositions, legal holds, productions, privilege log
 */

import { EvidenceApiService } from '../evidence-api';
import { CustodiansApiService } from '../custodians-api';
import { ExaminationsApiService } from '../examinations-api';
import { WitnessesApiService } from '../witnesses-api';
import { DepositionsApiService } from '../depositions-api';
import { LegalHoldsApiService } from '../legal-holds-api';
import { ProductionsApiService } from '../productions-api';
import { DiscoveryRequestsApiService } from '../discovery-requests-api';
import { ESISourcesApiService } from '../esi-sources-api';
import { PrivilegeLogApiService } from '../privilege-log-api';
import { CustodianInterviewsApiService } from '../custodian-interviews-api';
import { DiscoveryApiService } from '../discovery-api';

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
