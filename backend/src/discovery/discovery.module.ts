import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

// Main Discovery Controller & Service
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';

// Evidence
import { Evidence } from './evidence/entities/evidence.entity';
import { EvidenceController } from './evidence/evidence.controller';
import { EvidenceService } from './evidence/evidence.service';

// Discovery Requests
import { DiscoveryRequest } from './discovery-requests/entities/discovery-request.entity';
import { DiscoveryRequestsController } from './discovery-requests/discovery-requests.controller';
import { DiscoveryRequestsService } from './discovery-requests/discovery-requests.service';

// Depositions
import { Deposition } from './depositions/entities/deposition.entity';
import { DepositionsController } from './depositions/depositions.controller';
import { DepositionsService } from './depositions/depositions.service';

// ESI Sources
import { ESISource } from './esi-sources/entities/esi-source.entity';
import { ESISourcesController } from './esi-sources/esi-sources.controller';
import { ESISourcesService } from './esi-sources/esi-sources.service';

// Custodians
import { Custodian } from './custodians/entities/custodian.entity';
import { CustodiansController } from './custodians/custodians.controller';
import { CustodiansService } from './custodians/custodians.service';

// Productions
import { Production } from './productions/entities/production.entity';
import { ProductionsController } from './productions/productions.controller';
import { ProductionsService } from './productions/productions.service';

// Privilege Log
import { PrivilegeLogEntry } from './privilege-log/entities/privilege-log-entry.entity';
import { PrivilegeLogController } from './privilege-log/privilege-log.controller';
import { PrivilegeLogService } from './privilege-log/privilege-log.service';

// Legal Holds
import { LegalHold } from './legal-holds/entities/legal-hold.entity';
import { LegalHoldsController } from './legal-holds/legal-holds.controller';
import { LegalHoldsService } from './legal-holds/legal-holds.service';

// Examinations
import { Examination } from './examinations/entities/examination.entity';
import { ExaminationsController } from './examinations/examinations.controller';
import { ExaminationsService } from './examinations/examinations.service';

// Custodian Interviews
import { CustodianInterview } from './custodian-interviews/entities/custodian-interview.entity';
import { CustodianInterviewsController } from './custodian-interviews/custodian-interviews.controller';
import { CustodianInterviewsService } from './custodian-interviews/custodian-interviews.service';

// Witnesses
import { Witness } from './witnesses/entities/witness.entity';
import { WitnessesController } from './witnesses/witnesses.controller';
import { WitnessesService } from './witnesses/witnesses.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Evidence,
      DiscoveryRequest,
      Deposition,
      ESISource,
      Custodian,
      Production,
      PrivilegeLogEntry,
      LegalHold,
      Examination,
      CustodianInterview,
      Witness,
    ]),
  ],
  controllers: [
    DiscoveryController,
    EvidenceController,
    DiscoveryRequestsController,
    DepositionsController,
    ESISourcesController,
    CustodiansController,
    ProductionsController,
    PrivilegeLogController,
    LegalHoldsController,
    ExaminationsController,
    CustodianInterviewsController,
    WitnessesController,
  ],
  providers: [
    DiscoveryService,
    EvidenceService,
    DiscoveryRequestsService,
    DepositionsService,
    ESISourcesService,
    CustodiansService,
    ProductionsService,
    PrivilegeLogService,
    LegalHoldsService,
    ExaminationsService,
    CustodianInterviewsService,
    WitnessesService,
  ],
  exports: [
    DiscoveryService,
    EvidenceService,
    DiscoveryRequestsService,
    DepositionsService,
    ESISourcesService,
    CustodiansService,
    ProductionsService,
    PrivilegeLogService,
    LegalHoldsService,
    ExaminationsService,
    CustodianInterviewsService,
    WitnessesService,
  ],
})
export class DiscoveryModule {}
