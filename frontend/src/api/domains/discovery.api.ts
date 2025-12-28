/**
 * Discovery & Evidence Domain API Services
 * Evidence, custodians, depositions, legal holds, productions, privilege log
 */

import { EvidenceApiService } from '../discovery/evidence-api';
import { CustodiansApiService } from '../discovery/custodians-api';
import { ExaminationsApiService } from '../discovery/examinations-api';
import { WitnessesApiService } from '../discovery/witnesses-api';
import { DepositionsApiService } from '../discovery/depositions-api';
import { LegalHoldsApiService } from '../discovery/legal-holds-api';
import { ProductionsApiService } from '../discovery/productions-api';
import { DiscoveryRequestsApiService } from '../discovery/discovery-requests-api';
import { ESISourcesApiService } from '../discovery/esi-sources-api';
import { PrivilegeLogApiService } from '../discovery/privilege-log-api';
import { CustodianInterviewsApiService } from '../discovery/custodian-interviews-api';
import { DiscoveryApiService } from '../discovery/discovery-api';

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
