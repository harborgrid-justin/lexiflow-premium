/**
 * Discovery & Evidence Domain API Services
 * Evidence, custodians, depositions, legal holds, productions, privilege log
 */

import { CollectionsApiService } from "../discovery/collections-api";
import { CustodianInterviewsApiService } from "../discovery/custodian-interviews-api";
import { CustodiansApiService } from "../discovery/custodians-api";
import { DepositionsApiService } from "../discovery/depositions-api";
import { DiscoveryApiService } from "../discovery/discovery-api";
import { DiscoveryRequestsApiService } from "../discovery/discovery-requests-api";
import { ESISourcesApiService } from "../discovery/esi-sources-api";
import { EvidenceApiService } from "../discovery/evidence-api";
import { ExaminationsApiService } from "../discovery/examinations-api";
import { LegalHoldsApiService } from "../discovery/legal-holds-api";
import { PrivilegeLogApiService } from "../discovery/privilege-log-api";
import { ProcessingApiService } from "../discovery/processing-api";
import { ProductionsApiService } from "../discovery/productions-api";
import { ReviewApiService } from "../discovery/review-api";
import { WitnessesApiService } from "../discovery/witnesses-api";

// Export service classes
export {
  CollectionsApiService,
  CustodianInterviewsApiService,
  CustodiansApiService,
  DepositionsApiService,
  DiscoveryApiService,
  DiscoveryRequestsApiService,
  ESISourcesApiService,
  EvidenceApiService,
  ExaminationsApiService,
  LegalHoldsApiService,
  PrivilegeLogApiService,
  ProcessingApiService,
  ProductionsApiService,
  ReviewApiService,
  WitnessesApiService,
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
  collections: new CollectionsApiService(),
  processing: new ProcessingApiService(),
  review: new ReviewApiService(),
} as const;
