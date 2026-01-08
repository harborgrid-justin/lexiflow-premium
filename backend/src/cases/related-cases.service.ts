import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';
import { CaseRelationship, RelationshipType } from './entities/case-relationship.entity';
import { Party } from '@parties/entities/party.entity';

export interface RelatedCaseNode {
  caseId: string;
  caseNumber: string;
  title: string;
  status: string;
  relationships: Array<{
    relationshipId: string;
    relatedCaseId: string;
    relationshipType: RelationshipType;
    relationshipLabel: string;
    strength: number;
  }>;
}

export interface CaseNetwork {
  nodes: RelatedCaseNode[];
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: RelationshipType;
    label: string;
    strength: number;
    bidirectional: boolean;
  }>;
  centralNodeId: string;
}

export interface RelationshipSuggestion {
  suggestedCaseId: string;
  suggestedCaseNumber: string;
  suggestedCaseTitle: string;
  suggestionReason: string;
  confidence: number;
  suggestedRelationshipType: RelationshipType;
}

/**
 * Related Cases Service
 *
 * Manages case relationships and provides network analysis:
 * - Relationship creation and management
 * - Case network visualization
 * - Automatic relationship detection
 * - Consolidation tracking
 * - Appeal chain management
 * - Cross-case analytics
 */
@Injectable()
export class RelatedCasesService {
  constructor(
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
    @InjectRepository(CaseRelationship)
    private relationshipRepository: Repository<CaseRelationship>,
    @InjectRepository(Party)
    private partyRepository: Repository<Party>,
  ) {}

  /**
   * Create a relationship between two cases
   */
  async createRelationship(
    caseId1: string,
    caseId2: string,
    relationshipType: RelationshipType,
    description?: string,
    isBidirectional: boolean = false,
    strength: number = 50,
  ): Promise<CaseRelationship> {
    // Verify both cases exist
    const [case1, case2] = await Promise.all([
      this.caseRepository.findOne({ where: { id: caseId1 } }),
      this.caseRepository.findOne({ where: { id: caseId2 } }),
    ]);

    if (!case1) {
      throw new NotFoundException(`Case ${caseId1} not found`);
    }

    if (!case2) {
      throw new NotFoundException(`Case ${caseId2} not found`);
    }

    // Check if relationship already exists
    const existing = await this.relationshipRepository.findOne({
      where: { caseId1, caseId2, relationshipType },
    });

    if (existing) {
      throw new BadRequestException(
        `Relationship already exists between cases ${caseId1} and ${caseId2}`,
      );
    }

    const relationship = this.relationshipRepository.create({
      caseId1,
      caseId2,
      relationshipType,
      description,
      isBidirectional,
      relationshipStrength: strength,
      establishedDate: new Date(),
      isActive: true,
    });

    return this.relationshipRepository.save(relationship);
  }

  /**
   * Get all relationships for a case
   */
  async getCaseRelationships(caseId: string): Promise<CaseRelationship[]> {
    return this.relationshipRepository
      .createQueryBuilder('rel')
      .where('rel.caseId1 = :caseId OR rel.caseId2 = :caseId', { caseId })
      .andWhere('rel.isActive = :isActive', { isActive: true })
      .getMany();
  }

  /**
   * Get related cases with full details
   */
  async getRelatedCases(caseId: string): Promise<
    Array<{
      case: Case;
      relationship: CaseRelationship;
      relationshipLabel: string;
    }>
  > {
    const relationships = await this.getCaseRelationships(caseId);

    const relatedCases = await Promise.all(
      relationships.map(async (rel) => {
        const relatedCaseId = rel.caseId1 === caseId ? rel.caseId2 : rel.caseId1;
        const relatedCase = await this.caseRepository.findOne({
          where: { id: relatedCaseId },
        });

        if (!relatedCase) {
          return null;
        }

        return {
          case: relatedCase,
          relationship: rel,
          relationshipLabel: rel.getRelationshipLabel(caseId),
        };
      }),
    );

    return relatedCases.filter((rc) => rc !== null) as Array<{
      case: Case;
      relationship: CaseRelationship;
      relationshipLabel: string;
    }>;
  }

  /**
   * Build a case network for visualization
   */
  async buildCaseNetwork(
    centralCaseId: string,
    depth: number = 2,
  ): Promise<CaseNetwork> {
    const visitedCases = new Set<string>();
    const nodes: RelatedCaseNode[] = [];
    const edges: Array<{
      id: string;
      source: string;
      target: string;
      type: RelationshipType;
      label: string;
      strength: number;
      bidirectional: boolean;
    }> = [];

    await this.buildNetworkRecursive(centralCaseId, depth, visitedCases, nodes, edges);

    return {
      nodes,
      edges,
      centralNodeId: centralCaseId,
    };
  }

  /**
   * Recursive network builder
   */
  private async buildNetworkRecursive(
    caseId: string,
    remainingDepth: number,
    visitedCases: Set<string>,
    nodes: RelatedCaseNode[],
    edges: Array<{
      id: string;
      source: string;
      target: string;
      type: RelationshipType;
      label: string;
      strength: number;
      bidirectional: boolean;
    }>,
  ): Promise<void> {
    if (remainingDepth === 0 || visitedCases.has(caseId)) {
      return;
    }

    visitedCases.add(caseId);

    const caseEntity = await this.caseRepository.findOne({
      where: { id: caseId },
    });

    if (!caseEntity) {
      return;
    }

    const relationships = await this.getCaseRelationships(caseId);

    const node: RelatedCaseNode = {
      caseId: caseEntity.id,
      caseNumber: caseEntity.caseNumber,
      title: caseEntity.title,
      status: caseEntity.status,
      relationships: relationships.map((rel) => {
        const relatedCaseId = rel.caseId1 === caseId ? rel.caseId2 : rel.caseId1;
        return {
          relationshipId: rel.id,
          relatedCaseId,
          relationshipType: rel.relationshipType,
          relationshipLabel: rel.getRelationshipLabel(caseId),
          strength: rel.relationshipStrength,
        };
      }),
    };

    nodes.push(node);

    // Add edges
    for (const rel of relationships) {
      const relatedCaseId = rel.caseId1 === caseId ? rel.caseId2 : rel.caseId1;

      edges.push({
        id: rel.id,
        source: caseId,
        target: relatedCaseId,
        type: rel.relationshipType,
        label: rel.getRelationshipLabel(caseId),
        strength: rel.relationshipStrength,
        bidirectional: rel.isBidirectional,
      });

      // Recursively build network for related cases
      await this.buildNetworkRecursive(
        relatedCaseId,
        remainingDepth - 1,
        visitedCases,
        nodes,
        edges,
      );
    }
  }

  /**
   * Suggest related cases based on similarity
   */
  async suggestRelatedCases(caseId: string): Promise<RelationshipSuggestion[]> {
    const caseEntity = await this.caseRepository.findOne({
      where: { id: caseId },
    });

    if (!caseEntity) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }

    const suggestions: RelationshipSuggestion[] = [];

    // Get parties for this case
    const caseParties = await this.partyRepository.find({
      where: { caseId },
    });

    const partyNames = caseParties.map((p) => p.name);

    // Find cases with shared parties
    if (partyNames.length > 0) {
      const casesWithSharedParties = await this.partyRepository
        .createQueryBuilder('party')
        .innerJoin('party.case', 'case')
        .where('party.name IN (:...partyNames)', { partyNames })
        .andWhere('party.caseId != :caseId', { caseId })
        .andWhere('case.status NOT IN (:...statuses)', {
          statuses: ['CLOSED', 'ARCHIVED'],
        })
        .select(['party.caseId', 'COUNT(*) as sharedCount'])
        .groupBy('party.caseId')
        .getRawMany();

      for (const result of casesWithSharedParties) {
        const relatedCase = await this.caseRepository.findOne({
          where: { id: result.party_caseId },
        });

        if (relatedCase) {
          const sharedCount = parseInt(result.sharedCount, 10);
          const confidence = Math.min((sharedCount / partyNames.length) * 100, 100);

          suggestions.push({
            suggestedCaseId: relatedCase.id,
            suggestedCaseNumber: relatedCase.caseNumber,
            suggestedCaseTitle: relatedCase.title,
            suggestionReason: `Shares ${sharedCount} parties`,
            confidence,
            suggestedRelationshipType: RelationshipType.RELATED,
          });
        }
      }
    }

    // Find cases in same jurisdiction
    if (caseEntity.jurisdiction) {
      const sameCourt = await this.caseRepository
        .createQueryBuilder('case')
        .where('case.jurisdiction = :jurisdiction', {
          jurisdiction: caseEntity.jurisdiction,
        })
        .andWhere('case.id != :caseId', { caseId })
        .andWhere('case.court = :court', { court: caseEntity.court })
        .andWhere('case.status NOT IN (:...statuses)', {
          statuses: ['CLOSED', 'ARCHIVED'],
        })
        .take(5)
        .getMany();

      for (const relatedCase of sameCourt) {
        suggestions.push({
          suggestedCaseId: relatedCase.id,
          suggestedCaseNumber: relatedCase.caseNumber,
          suggestedCaseTitle: relatedCase.title,
          suggestionReason: `Same court: ${caseEntity.court}`,
          confidence: 40,
          suggestedRelationshipType: RelationshipType.PARALLEL,
        });
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return suggestions;
  }

  /**
   * Get consolidated cases
   */
  async getConsolidatedCases(leadCaseId: string): Promise<Case[]> {
    const relationships = await this.relationshipRepository.find({
      where: [
        {
          caseId1: leadCaseId,
          relationshipType: RelationshipType.LEAD_CASE,
          isActive: true,
        },
        {
          caseId2: leadCaseId,
          relationshipType: RelationshipType.MEMBER_CASE,
          isActive: true,
        },
      ],
    });

    const memberCaseIds = relationships.map((rel) =>
      rel.caseId1 === leadCaseId ? rel.caseId2 : rel.caseId1,
    );

    return this.caseRepository.findByIds(memberCaseIds);
  }

  /**
   * Get appeal chain
   */
  async getAppealChain(caseId: string): Promise<{
    lowerCourts: Case[];
    currentCase: Case;
    upperCourts: Case[];
  }> {
    const currentCase = await this.caseRepository.findOne({
      where: { id: caseId },
    });

    if (!currentCase) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }

    // Get lower court cases (appealed from)
    const lowerCourtRels = await this.relationshipRepository.find({
      where: {
        caseId2: caseId,
        relationshipType: RelationshipType.APPEALED_TO,
        isActive: true,
      },
    });

    const lowerCourts = await this.caseRepository.findByIds(
      lowerCourtRels.map((rel) => rel.caseId1),
    );

    // Get upper court cases (appealed to)
    const upperCourtRels = await this.relationshipRepository.find({
      where: {
        caseId1: caseId,
        relationshipType: RelationshipType.APPEALED_TO,
        isActive: true,
      },
    });

    const upperCourts = await this.caseRepository.findByIds(
      upperCourtRels.map((rel) => rel.caseId2),
    );

    return {
      lowerCourts,
      currentCase,
      upperCourts,
    };
  }

  /**
   * Update relationship
   */
  async updateRelationship(
    relationshipId: string,
    updates: Partial<CaseRelationship>,
  ): Promise<CaseRelationship> {
    const relationship = await this.relationshipRepository.findOne({
      where: { id: relationshipId },
    });

    if (!relationship) {
      throw new NotFoundException(`Relationship ${relationshipId} not found`);
    }

    Object.assign(relationship, updates);

    return this.relationshipRepository.save(relationship);
  }

  /**
   * Delete relationship
   */
  async deleteRelationship(relationshipId: string): Promise<void> {
    const relationship = await this.relationshipRepository.findOne({
      where: { id: relationshipId },
    });

    if (!relationship) {
      throw new NotFoundException(`Relationship ${relationshipId} not found`);
    }

    await this.relationshipRepository.remove(relationship);
  }

  /**
   * Get relationship statistics
   */
  async getRelationshipStatistics(): Promise<{
    totalRelationships: number;
    byType: Record<string, number>;
    averageStrength: number;
    bidirectionalCount: number;
  }> {
    const relationships = await this.relationshipRepository.find({
      where: { isActive: true },
    });

    const byType: Record<string, number> = {};
    let totalStrength = 0;
    let bidirectionalCount = 0;

    relationships.forEach((rel) => {
      byType[rel.relationshipType] = (byType[rel.relationshipType] || 0) + 1;
      totalStrength += rel.relationshipStrength;
      if (rel.isBidirectional) {
        bidirectionalCount++;
      }
    });

    return {
      totalRelationships: relationships.length,
      byType,
      averageStrength:
        relationships.length > 0 ? totalStrength / relationships.length : 0,
      bidirectionalCount,
    };
  }
}
