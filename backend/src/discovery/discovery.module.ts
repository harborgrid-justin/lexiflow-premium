import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Discovery Module
 * Comprehensive discovery management system
 *
 * Features:
 * - Evidence tracking and chain of custody
 * - Discovery request management (interrogatories, RFPs, RFAs)
 * - Deposition scheduling and transcript management
 * - Document production with privilege logging
 * - Legal hold and preservation tracking
 * - E-Discovery platform with collection, processing, and review
 * - Technology Assisted Review (TAR) with predictive coding
 * - Bates numbering and production management
 *
 * Sub-modules:
 * - Evidence: Physical and digital evidence cataloging
 * - DiscoveryRequests: Interrogatories, RFPs, RFAs
 * - Depositions: Scheduling, transcripts, exhibits
 * - Productions: Document production and Bates numbering
 * - LegalHolds: Preservation and litigation hold management
 * - E-Discovery: Data collection, processing, review platform, TAR
 */

// Main Discovery Controller & Service
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';

// E-Discovery Platform Entities
import { DiscoveryProject } from './entities/discovery-project.entity';
import { ReviewDocument } from './entities/review-document.entity';
import { TARModel } from './entities/tar-model.entity';

// E-Discovery Platform Services
import { CollectionService } from './collection.service';
import { ProcessingService } from './processing.service';
import { ReviewPlatformService } from './review-platform.service';
import { ProductionService } from './production.service';
import { TARService } from './tar.service';
import { BatesNumberingService } from './bates-numbering.service';

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
      // E-Discovery Platform Entities
      DiscoveryProject,
      ReviewDocument,
      TARModel,
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
    // E-Discovery Platform Services
    CollectionService,
    ProcessingService,
    ReviewPlatformService,
    ProductionService,
    TARService,
    BatesNumberingService,
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
    // E-Discovery Platform Services
    CollectionService,
    ProcessingService,
    ReviewPlatformService,
    ProductionService,
    TARService,
    BatesNumberingService,
  ],
})
export class DiscoveryModule {}
