import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Case } from '@cases/entities/case.entity';

/**
 * CaseLoader - DataLoader for batching and caching case queries
 * Prevents N+1 query problems when loading cases
 */
@Injectable({ scope: Scope.REQUEST })
export class CaseLoader {
  constructor(
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
  ) {}

  /**
   * Batch load cases by IDs
   */
  public readonly batchCases = new DataLoader(async (caseIds: readonly string[]) => {
    const cases = await this.caseRepository.find({
      where: { id: In([...caseIds]) },
    });
    const caseMap = new Map(cases.map(c => [c.id, c]));
    return caseIds.map(id => caseMap.get(id) || null);
  });

  /**
   * Batch load parties by case IDs
   * Note: Parties are embedded in case entity, so load cases with relations
   */
  public readonly batchPartiesByCaseId = new DataLoader(async (caseIds: readonly string[]) => {
    const cases = await this.caseRepository.find({
      where: { id: In([...caseIds]) },
      relations: ['parties'],
    });
    const partiesByCaseId = new Map();
    caseIds.forEach(id => partiesByCaseId.set(id, []));
    cases.forEach(caseItem => {
      partiesByCaseId.set(caseItem.id, caseItem.parties || []);
    });
    return caseIds.map(id => partiesByCaseId.get(id) || []);
  });

  /**
   * Batch load team members by case IDs
   * Note: Team members would need a separate entity/relation if not embedded
   */
  public readonly batchTeamMembersByCaseId = new DataLoader(async (caseIds: readonly string[]) => {
    // Note: Case entity doesn't have a 'team' relation - this needs to be implemented
    // or removed based on your schema design
    const teamByCaseId = new Map();
    caseIds.forEach(id => teamByCaseId.set(id, []));
    return caseIds.map(id => teamByCaseId.get(id) || []);
  });

  /**
   * Batch load phases by case IDs
   */
  public readonly batchPhasesByCaseId = new DataLoader(async (caseIds: readonly string[]) => {
    // Note: Case entity doesn't have a 'phases' relation - this needs to be implemented
    // or removed based on your schema design
    const phasesByCaseId = new Map();
    caseIds.forEach(id => phasesByCaseId.set(id, []));
    return caseIds.map(id => phasesByCaseId.get(id) || []);
  });

  /**
   * Batch load motions by case IDs
   * Note: Motions would need a separate entity/repository for full implementation
   */
  public readonly batchMotionsByCaseId = new DataLoader(async (caseIds: readonly string[]) => {
    // Motions may be stored in JSONB or separate table
    // For now, return empty arrays as motions entity is not defined
    return caseIds.map(() => []);
  });

  /**
   * Batch load docket entries by case IDs
   * Note: Docket entries would need a separate entity/repository for full implementation
   */
  public readonly batchDocketEntriesByCaseId = new DataLoader(async (caseIds: readonly string[]) => {
    // Docket entries may be stored in JSONB or separate table
    // For now, return empty arrays as docket entity is not defined
    return caseIds.map(() => []);
  });
}
