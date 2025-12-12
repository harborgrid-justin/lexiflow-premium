import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Party, PartyType } from './entities/party.entity';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: 'SAME_PARTY_DIFFERENT_SIDE' | 'OPPOSING_PARTIES_SAME_CASE' | 'DUPLICATE_PARTY' | 'NAME_SIMILARITY';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    affectedParties: Array<{
      id: string;
      name: string;
      caseId: string;
      type: PartyType;
    }>;
  }>;
  warnings: string[];
}

@Injectable()
export class ConflictCheckService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
  ) {}

  /**
   * Perform comprehensive conflict check for a party
   */
  async checkConflicts(
    partyName: string,
    partyType: PartyType,
    caseId: string,
    excludePartyId?: string,
  ): Promise<ConflictCheckResult> {
    const conflicts: ConflictCheckResult['conflicts'] = [];
    const warnings: string[] = [];

    // 1. Check for exact name matches in other cases
    const exactMatches = await this.partyRepository
      .createQueryBuilder('party')
      .where('LOWER(party.name) = LOWER(:name)', { name: partyName })
      .andWhere('party.caseId != :caseId', { caseId })
      .getMany();

    if (exactMatches.length > 0) {
      const opposingTypes = this.getOpposingPartyTypes(partyType);
      const conflictingMatches = exactMatches.filter((p) =>
        opposingTypes.includes(p.type),
      );

      if (conflictingMatches.length > 0) {
        conflicts.push({
          type: 'SAME_PARTY_DIFFERENT_SIDE',
          severity: 'HIGH',
          description: `${partyName} appears on opposing side in other case(s)`,
          affectedParties: conflictingMatches.map((p) => ({
            id: p.id,
            name: p.name,
            caseId: p.caseId,
            type: p.type,
          })),
        });
      }
    }

    // 2. Check for similar names (fuzzy matching)
    const similarParties = await this.findSimilarParties(partyName, caseId);
    if (similarParties.length > 0) {
      warnings.push(
        `Found ${similarParties.length} partie(s) with similar names in other cases`,
      );
      conflicts.push({
        type: 'NAME_SIMILARITY',
        severity: 'MEDIUM',
        description: `Similar party names found that may indicate conflict`,
        affectedParties: similarParties.map((p) => ({
          id: p.id,
          name: p.name,
          caseId: p.caseId,
          type: p.type,
        })),
      });
    }

    // 3. Check for opposing parties in the same case
    const sameCaseParties = await this.partyRepository.find({
      where: { caseId },
    });

    if (excludePartyId) {
      const index = sameCaseParties.findIndex((p) => p.id === excludePartyId);
      if (index !== -1) {
        sameCaseParties.splice(index, 1);
      }
    }

    const opposingInSameCase = sameCaseParties.filter((p) => {
      const opposingTypes = this.getOpposingPartyTypes(partyType);
      return opposingTypes.includes(p.type);
    });

    if (opposingInSameCase.length === 0 && this.requiresOpposition(partyType)) {
      warnings.push('This case does not yet have an opposing party');
    }

    // 4. Check for duplicate party in same case
    const duplicateInCase = sameCaseParties.find(
      (p) => p.name.toLowerCase() === partyName.toLowerCase(),
    );

    if (duplicateInCase) {
      conflicts.push({
        type: 'DUPLICATE_PARTY',
        severity: 'HIGH',
        description: `Party ${partyName} already exists in this case`,
        affectedParties: [
          {
            id: duplicateInCase.id,
            name: duplicateInCase.name,
            caseId: duplicateInCase.caseId,
            type: duplicateInCase.type,
          },
        ],
      });
    }

    return {
      hasConflict: conflicts.some((c) => c.severity === 'HIGH'),
      conflicts,
      warnings,
    };
  }

  /**
   * Find parties with similar names using similarity matching
   */
  private async findSimilarParties(
    name: string,
    excludeCaseId: string,
  ): Promise<Party[]> {
    // Use PostgreSQL similarity function (requires pg_trgm extension)
    // For now, use simple LIKE matching with variations
    const nameParts = name.toLowerCase().split(' ');

    if (nameParts.length === 0) {
      return [];
    }

    const queryBuilder = this.partyRepository.createQueryBuilder('party');
    queryBuilder.where('party.caseId != :caseId', { caseId: excludeCaseId });

    // Build OR conditions for each name part
    const conditions = nameParts.map((_, index) => {
      return `LOWER(party.name) LIKE :part${index}`;
    });

    if (conditions.length > 0) {
      queryBuilder.andWhere(`(${conditions.join(' OR ')})`,
        nameParts.reduce((params, part, index) => {
          params[`part${index}`] = `%${part}%`;
          return params;
        }, {} as Record<string, string>)
      );
    }

    return queryBuilder.limit(10).getMany();
  }

  /**
   * Get opposing party types for conflict checking
   */
  private getOpposingPartyTypes(partyType: PartyType): PartyType[] {
    const oppositions: Record<PartyType, PartyType[]> = {
      [PartyType.PLAINTIFF]: [PartyType.DEFENDANT],
      [PartyType.DEFENDANT]: [PartyType.PLAINTIFF],
      [PartyType.PETITIONER]: [PartyType.RESPONDENT],
      [PartyType.RESPONDENT]: [PartyType.PETITIONER],
      [PartyType.APPELLANT]: [PartyType.APPELLEE],
      [PartyType.APPELLEE]: [PartyType.APPELLANT],
      [PartyType.THIRD_PARTY]: [],
      [PartyType.WITNESS]: [],
      [PartyType.EXPERT_WITNESS]: [],
      [PartyType.OTHER]: [],
    };

    return oppositions[partyType] || [];
  }

  /**
   * Check if party type requires an opposing party
   */
  private requiresOpposition(partyType: PartyType): boolean {
    return [
      PartyType.PLAINTIFF,
      PartyType.DEFENDANT,
      PartyType.PETITIONER,
      PartyType.RESPONDENT,
      PartyType.APPELLANT,
      PartyType.APPELLEE,
    ].includes(partyType);
  }

  /**
   * Get conflict statistics for a case
   */
  async getCaseConflictSummary(caseId: string): Promise<{
    totalParties: number;
    partiesWithConflicts: number;
    highSeverityConflicts: number;
  }> {
    const parties = await this.partyRepository.find({ where: { caseId } });
    let partiesWithConflicts = 0;
    let highSeverityConflicts = 0;

    for (const party of parties) {
      const result = await this.checkConflicts(
        party.name,
        party.type,
        caseId,
        party.id,
      );

      if (result.hasConflict) {
        partiesWithConflicts++;
        highSeverityConflicts += result.conflicts.filter(
          (c) => c.severity === 'HIGH',
        ).length;
      }
    }

    return {
      totalParties: parties.length,
      partiesWithConflicts,
      highSeverityConflicts,
    };
  }
}
