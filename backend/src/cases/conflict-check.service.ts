import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ConflictCheck } from '@compliance/conflict-checks/entities/conflict-check.entity';
import { Case } from './entities/case.entity';
import { Matter } from '@matters/entities/matter.entity';
import { Party } from '@parties/entities/party.entity';
import { Client } from '@clients/entities/client.entity';

export interface ConflictCheckRequest {
  matterId?: string;
  caseId?: string;
  potentialClientName: string;
  matterDescription: string;
  partiesInvolved: string[];
  relatedEntities?: string[];
  opposingParties?: string[];
  opposingCounsel?: string[];
  requestedBy: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictSeverity?: 'low' | 'medium' | 'high' | 'critical';
  conflictType?: string;
  conflictingCases?: Array<{
    caseId: string;
    caseNumber: string;
    title: string;
    conflictReason: string;
  }>;
  conflictingClients?: Array<{
    clientId: string;
    clientName: string;
    conflictReason: string;
  }>;
  conflictingParties?: Array<{
    partyName: string;
    role: string;
    conflictReason: string;
  }>;
  recommendations?: string[];
  requiresWaiver: boolean;
}

/**
 * Conflict Check Service
 *
 * Performs comprehensive conflict of interest checks for matters and cases:
 * - Party-based conflict detection
 * - Client conflict checking
 * - Adverse representation detection
 * - Related entity conflict analysis
 * - Automated conflict screening
 * - Waiver tracking and management
 */
@Injectable()
export class ConflictCheckService {
  constructor(
    @InjectRepository(ConflictCheck)
    private conflictCheckRepository: Repository<ConflictCheck>,
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
    @InjectRepository(Matter)
    private matterRepository: Repository<Matter>,
    @InjectRepository(Party)
    private partyRepository: Repository<Party>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  /**
   * Perform a comprehensive conflict check
   */
  async performConflictCheck(
    request: ConflictCheckRequest,
  ): Promise<ConflictCheckResult> {
    const result: ConflictCheckResult = {
      hasConflict: false,
      conflictingCases: [],
      conflictingClients: [],
      conflictingParties: [],
      recommendations: [],
      requiresWaiver: false,
    };

    // Check for client conflicts
    const clientConflicts = await this.checkClientConflicts(
      request.potentialClientName,
      request.opposingParties || [],
    );
    if (clientConflicts.length > 0) {
      result.hasConflict = true;
      result.conflictingClients = clientConflicts;
      result.conflictSeverity = 'high';
      result.conflictType = 'direct_representation';
      result.requiresWaiver = true;
    }

    // Check for party conflicts
    const partyConflicts = await this.checkPartyConflicts(
      request.partiesInvolved,
      request.opposingParties || [],
    );
    if (partyConflicts.length > 0) {
      result.hasConflict = true;
      result.conflictingParties = partyConflicts;
      result.conflictSeverity = result.conflictSeverity || 'medium';
      result.conflictType = result.conflictType || 'adverse_interest';
    }

    // Check for case conflicts
    const caseConflicts = await this.checkCaseConflicts(
      request.partiesInvolved,
      request.relatedEntities || [],
    );
    if (caseConflicts.length > 0) {
      result.hasConflict = true;
      result.conflictingCases = caseConflicts;
      result.conflictSeverity = result.conflictSeverity || 'medium';
      result.conflictType = result.conflictType || 'concurrent_representation';
    }

    // Generate recommendations
    result.recommendations = this.generateRecommendations(result);

    // Create conflict check record
    await this.createConflictCheckRecord(request, result);

    return result;
  }

  /**
   * Check for conflicts with existing clients
   */
  private async checkClientConflicts(
    potentialClientName: string,
    opposingParties: string[],
  ): Promise<Array<{ clientId: string; clientName: string; conflictReason: string }>> {
    const conflicts: Array<{
      clientId: string;
      clientName: string;
      conflictReason: string;
    }> = [];

    // Check if potential client is an opposing party in any active case
    for (const opposingParty of opposingParties) {
      const clients = await this.clientRepository.find({
        where: { name: ILike(`%${opposingParty}%`) },
      });

      for (const client of clients) {
        conflicts.push({
          clientId: client.id,
          clientName: client.name,
          conflictReason: `Current client "${client.name}" matches opposing party "${opposingParty}"`,
        });
      }
    }

    // Check if opposing parties are current clients
    const clients = await this.clientRepository.find({
      where: { name: ILike(`%${potentialClientName}%`) },
    });

    if (clients.length > 0) {
      for (const client of clients) {
        conflicts.push({
          clientId: client.id,
          clientName: client.name,
          conflictReason: `Potential client "${potentialClientName}" is already a current client`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Check for conflicts with parties in existing cases
   */
  private async checkPartyConflicts(
    partiesInvolved: string[],
    opposingParties: string[],
  ): Promise<Array<{ partyName: string; role: string; conflictReason: string }>> {
    const conflicts: Array<{
      partyName: string;
      role: string;
      conflictReason: string;
    }> = [];

    // Check if any involved parties are opposing parties in active cases
    for (const party of partiesInvolved) {
      const existingParties = await this.partyRepository
        .createQueryBuilder('party')
        .innerJoin('party.case', 'case')
        .where('party.name ILIKE :name', { name: `%${party}%` })
        .andWhere('case.status NOT IN (:...statuses)', {
          statuses: ['CLOSED', 'ARCHIVED'],
        })
        .andWhere('party.role = :role', { role: 'opposing' })
        .getMany();

      for (const existingParty of existingParties) {
        conflicts.push({
          partyName: existingParty.name,
          role: existingParty.role || 'unknown',
          conflictReason: `Party "${party}" is an opposing party in an active case`,
        });
      }
    }

    // Check if any opposing parties are clients in active cases
    for (const opposingParty of opposingParties) {
      const existingParties = await this.partyRepository
        .createQueryBuilder('party')
        .innerJoin('party.case', 'case')
        .where('party.name ILIKE :name', { name: `%${opposingParty}%` })
        .andWhere('case.status NOT IN (:...statuses)', {
          statuses: ['CLOSED', 'ARCHIVED'],
        })
        .andWhere('party.role = :role', { role: 'client' })
        .getMany();

      for (const existingParty of existingParties) {
        conflicts.push({
          partyName: existingParty.name,
          role: existingParty.role || 'unknown',
          conflictReason: `Opposing party "${opposingParty}" is a client in an active case`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Check for conflicts with existing cases
   */
  private async checkCaseConflicts(
    partiesInvolved: string[],
    relatedEntities: string[],
  ): Promise<
    Array<{
      caseId: string;
      caseNumber: string;
      title: string;
      conflictReason: string;
    }>
  > {
    const conflicts: Array<{
      caseId: string;
      caseNumber: string;
      title: string;
      conflictReason: string;
    }> = [];

    const allEntities = [...partiesInvolved, ...relatedEntities];

    for (const entity of allEntities) {
      // Search in case titles and descriptions
      const cases = await this.caseRepository
        .createQueryBuilder('case')
        .where('case.status NOT IN (:...statuses)', {
          statuses: ['CLOSED', 'ARCHIVED'],
        })
        .andWhere(
          '(case.title ILIKE :entity OR case.description ILIKE :entity)',
          {
            entity: `%${entity}%`,
          },
        )
        .getMany();

      for (const caseEntity of cases) {
        conflicts.push({
          caseId: caseEntity.id,
          caseNumber: caseEntity.caseNumber,
          title: caseEntity.title,
          conflictReason: `Entity "${entity}" found in active case "${caseEntity.title}"`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Generate recommendations based on conflict check results
   */
  private generateRecommendations(result: ConflictCheckResult): string[] {
    const recommendations: string[] = [];

    if (!result.hasConflict) {
      recommendations.push('No conflicts identified. Matter can proceed.');
      return recommendations;
    }

    if (result.conflictSeverity === 'critical') {
      recommendations.push(
        'CRITICAL: This matter presents a serious conflict of interest.',
      );
      recommendations.push('Recommend declining representation.');
    } else if (result.conflictSeverity === 'high') {
      recommendations.push('HIGH: Significant conflict detected.');
      recommendations.push(
        'Obtain written waiver from all affected parties before proceeding.',
      );
      recommendations.push(
        'Consider implementing ethical walls if representation proceeds.',
      );
    } else if (result.conflictSeverity === 'medium') {
      recommendations.push('MEDIUM: Potential conflict identified.');
      recommendations.push('Review conflict details with managing partner.');
      recommendations.push('Obtain client consent if proceeding.');
    } else {
      recommendations.push('LOW: Minor conflict detected.');
      recommendations.push('Document conflict and obtain client acknowledgment.');
    }

    if (result.requiresWaiver) {
      recommendations.push(
        'Prepare conflict waiver letter for all affected parties.',
      );
    }

    return recommendations;
  }

  /**
   * Create a conflict check record
   */
  private async createConflictCheckRecord(
    request: ConflictCheckRequest,
    result: ConflictCheckResult,
  ): Promise<ConflictCheck> {
    const conflictCheck = this.conflictCheckRepository.create({
      caseId: request.caseId || null,
      potentialClientName: request.potentialClientName,
      requestedBy: request.requestedBy,
      checkDate: new Date(),
      status: result.hasConflict ? 'conflict_identified' : 'no_conflict',
      matterDescription: request.matterDescription,
      partiesInvolved: request.partiesInvolved,
      relatedEntities: request.relatedEntities || [],
      opposingParties: request.opposingParties || [],
      opposingCounsel: request.opposingCounsel || [],
      hasConflict: result.hasConflict,
      conflictingCases: result.conflictingCases?.map((c) => c.caseId) || [],
      conflictingClients: result.conflictingClients?.map((c) => c.clientId) || [],
      conflictDescription: result.recommendations?.join('\n') || '',
      conflictType: result.conflictType || null,
      conflictSeverity: result.conflictSeverity || null,
      waiverRequired: result.requiresWaiver,
      metadata: {
        conflictCheckResult: result,
      },
    });

    return this.conflictCheckRepository.save(conflictCheck);
  }

  /**
   * Get conflict check history for a matter
   */
  async getConflictCheckHistory(matterId: string): Promise<ConflictCheck[]> {
    const matter = await this.matterRepository.findOne({
      where: { id: matterId },
    });

    if (!matter) {
      throw new NotFoundException(`Matter ${matterId} not found`);
    }

    return this.conflictCheckRepository.find({
      where: { potentialClientId: matter.clientId },
      order: { checkDate: 'DESC' },
    });
  }

  /**
   * Update conflict check status
   */
  async updateConflictCheckStatus(
    conflictCheckId: string,
    status: string,
    reviewedBy: string,
    reviewNotes?: string,
  ): Promise<ConflictCheck> {
    const conflictCheck = await this.conflictCheckRepository.findOne({
      where: { id: conflictCheckId },
    });

    if (!conflictCheck) {
      throw new NotFoundException(`Conflict check ${conflictCheckId} not found`);
    }

    conflictCheck.status = status;
    conflictCheck.reviewedBy = reviewedBy;
    conflictCheck.reviewNotes = reviewNotes || conflictCheck.reviewNotes;
    conflictCheck.completedDate = new Date();

    return this.conflictCheckRepository.save(conflictCheck);
  }

  /**
   * Record waiver for a conflict
   */
  async recordWaiver(
    conflictCheckId: string,
    waiverDocumentId: string,
    waiverStatus: string,
  ): Promise<ConflictCheck> {
    const conflictCheck = await this.conflictCheckRepository.findOne({
      where: { id: conflictCheckId },
    });

    if (!conflictCheck) {
      throw new NotFoundException(`Conflict check ${conflictCheckId} not found`);
    }

    conflictCheck.waiverStatus = waiverStatus;
    conflictCheck.waiverDate = new Date();
    conflictCheck.waiverDocumentId = waiverDocumentId;

    if (waiverStatus === 'obtained') {
      conflictCheck.status = 'waiver_obtained';
    }

    return this.conflictCheckRepository.save(conflictCheck);
  }

  /**
   * Get pending conflict checks
   */
  async getPendingConflictChecks(): Promise<ConflictCheck[]> {
    return this.conflictCheckRepository.find({
      where: { status: 'pending' },
      order: { checkDate: 'DESC' },
    });
  }

  /**
   * Get conflicts requiring waivers
   */
  async getConflictsRequiringWaivers(): Promise<ConflictCheck[]> {
    return this.conflictCheckRepository.find({
      where: {
        waiverRequired: true,
        waiverStatus: null,
      },
      order: { checkDate: 'DESC' },
    });
  }
}
