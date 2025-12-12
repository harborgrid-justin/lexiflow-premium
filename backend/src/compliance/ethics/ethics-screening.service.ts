import { Injectable, Logger } from '@nestjs/common';

export enum ConflictType {
  DIRECT_CONFLICT = 'DIRECT_CONFLICT',
  POSITIONAL_CONFLICT = 'POSITIONAL_CONFLICT',
  FORMER_CLIENT = 'FORMER_CLIENT',
  IMPUTED_CONFLICT = 'IMPUTED_CONFLICT',
  BUSINESS_RELATIONSHIP = 'BUSINESS_RELATIONSHIP',
  PERSONAL_RELATIONSHIP = 'PERSONAL_RELATIONSHIP',
  ADVERSE_INTEREST = 'ADVERSE_INTEREST',
  CONCURRENT_REPRESENTATION = 'CONCURRENT_REPRESENTATION',
}

export enum ConflictSeverity {
  WAIVABLE = 'WAIVABLE',
  NON_WAIVABLE = 'NON_WAIVABLE',
  INFORMATIONAL = 'INFORMATIONAL',
}

export interface ConflictCheck {
  id: string;
  matterId: string;
  clientName: string;
  opposingParties: string[];
  relatedParties: string[];
  matterType: string;
  description: string;
  performedBy: string;
  performedAt: Date;
  conflicts: Conflict[];
  cleared: boolean;
  clearedBy?: string;
  clearedAt?: Date;
  waiverObtained?: boolean;
  waiverDate?: Date;
  notes?: string;
}

export interface Conflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  affectedClient: string;
  affectedMatter?: string;
  attorney?: string;
  details: Record<string, any>;
  waivable: boolean;
  resolved: boolean;
  resolution?: string;
  resolvedAt?: Date;
}

export interface EthicsWall {
  id: string;
  name: string;
  description: string;
  affectedAttorneys: string[];
  screenedMatter: string;
  screenedClient: string;
  effectiveDate: Date;
  endDate?: Date;
  procedures: string[];
  monitoringMeasures: string[];
  breachReported: boolean;
  breachDetails?: string;
  active: boolean;
}

export interface WaiverOfConflict {
  id: string;
  conflictId: string;
  clientId: string;
  clientName: string;
  matterId: string;
  conflictDescription: string;
  disclosureProvided: Date;
  consentObtained: Date;
  consentForm: string;
  informedConsent: boolean;
  independentAdvice: boolean;
  witnessedBy?: string;
  validUntil?: Date;
  revoked: boolean;
  revokedAt?: Date;
}

@Injectable()
export class EthicsScreeningService {
  private readonly logger = new Logger(EthicsScreeningService.name);
  private conflictChecks: Map<string, ConflictCheck> = new Map();
  private ethicsWalls: Map<string, EthicsWall> = new Map();
  private waivers: Map<string, WaiverOfConflict> = new Map();
  private clientDatabase: Map<string, Set<string>> = new Map(); // client -> matters
  private opposingPartyDatabase: Map<string, Set<string>> = new Map(); // party -> matters

  /**
   * Perform conflict check for new matter
   */
  async performConflictCheck(
    matterId: string,
    clientName: string,
    opposingParties: string[],
    relatedParties: string[],
    matterType: string,
    description: string,
    performedBy: string,
  ): Promise<ConflictCheck> {
    this.logger.log(`Performing conflict check for matter ${matterId}`);

    const conflicts: Conflict[] = [];

    // Check against current clients
    const clientConflicts = await this.checkCurrentClientConflicts(
      clientName,
      opposingParties,
    );
    conflicts.push(...clientConflicts);

    // Check against former clients
    const formerClientConflicts = await this.checkFormerClientConflicts(
      clientName,
      opposingParties,
      relatedParties,
    );
    conflicts.push(...formerClientConflicts);

    // Check positional conflicts
    const positionalConflicts = await this.checkPositionalConflicts(
      matterType,
      description,
    );
    conflicts.push(...positionalConflicts);

    // Check attorney relationships
    const personalConflicts = await this.checkPersonalRelationships(
      clientName,
      opposingParties,
      relatedParties,
    );
    conflicts.push(...personalConflicts);

    const check: ConflictCheck = {
      id: `check-${Date.now()}`,
      matterId,
      clientName,
      opposingParties,
      relatedParties,
      matterType,
      description,
      performedBy,
      performedAt: new Date(),
      conflicts,
      cleared: conflicts.length === 0,
    };

    this.conflictChecks.set(check.id, check);

    // Add to databases for future checks
    const clientMatters = this.clientDatabase.get(clientName.toLowerCase()) || new Set();
    clientMatters.add(matterId);
    this.clientDatabase.set(clientName.toLowerCase(), clientMatters);

    opposingParties.forEach(party => {
      const partyMatters = this.opposingPartyDatabase.get(party.toLowerCase()) || new Set();
      partyMatters.add(matterId);
      this.opposingPartyDatabase.set(party.toLowerCase(), partyMatters);
    });

    if (conflicts.length > 0) {
      this.logger.warn(
        `Conflict check for ${matterId} identified ${conflicts.length} potential conflicts`,
      );
    } else {
      this.logger.log(`Conflict check for ${matterId} cleared - no conflicts found`);
    }

    return check;
  }

  /**
   * Check for conflicts with current clients
   */
  private async checkCurrentClientConflicts(
    newClient: string,
    opposingParties: string[],
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    // Check if any opposing party is a current client
    for (const party of opposingParties) {
      const partyLower = party.toLowerCase();
      if (this.clientDatabase.has(partyLower)) {
        conflicts.push({
          id: `conflict-${Date.now()}-${Math.random()}`,
          type: ConflictType.DIRECT_CONFLICT,
          severity: ConflictSeverity.NON_WAIVABLE,
          description: `Opposing party "${party}" is a current client`,
          affectedClient: party,
          details: { reason: 'Cannot represent client against current client' },
          waivable: false,
          resolved: false,
        });
      }
    }

    return conflicts;
  }

  /**
   * Check for conflicts with former clients
   */
  private async checkFormerClientConflicts(
    newClient: string,
    opposingParties: string[],
    relatedParties: string[],
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    // In production, would check against former client database
    // Check if matter is substantially related to previous representation

    return conflicts;
  }

  /**
   * Check for positional conflicts
   */
  private async checkPositionalConflicts(
    matterType: string,
    description: string,
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    // In production, would analyze current matters to identify
    // cases where taking opposite legal positions might create conflicts

    return conflicts;
  }

  /**
   * Check for personal relationship conflicts
   */
  private async checkPersonalRelationships(
    clientName: string,
    opposingParties: string[],
    relatedParties: string[],
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    // In production, would check attorney relationship databases

    return conflicts;
  }

  /**
   * Clear conflict check
   */
  async clearConflictCheck(
    checkId: string,
    clearedBy: string,
    notes?: string,
  ): Promise<void> {
    const check = this.conflictChecks.get(checkId);
    if (!check) {
      throw new Error(`Conflict check not found: ${checkId}`);
    }

    if (check.conflicts.length > 0) {
      const unresolved = check.conflicts.filter(c => !c.resolved);
      if (unresolved.length > 0) {
        throw new Error(
          `Cannot clear conflict check: ${unresolved.length} unresolved conflicts`,
        );
      }
    }

    check.cleared = true;
    check.clearedBy = clearedBy;
    check.clearedAt = new Date();
    check.notes = notes;

    this.conflictChecks.set(checkId, check);
    this.logger.log(`Conflict check ${checkId} cleared by ${clearedBy}`);
  }

  /**
   * Obtain conflict waiver
   */
  async obtainWaiver(
    conflictId: string,
    clientId: string,
    clientName: string,
    matterId: string,
    disclosureProvided: Date,
    consentForm: string,
    informedConsent: boolean,
    independentAdvice: boolean,
    witnessedBy?: string,
  ): Promise<WaiverOfConflict> {
    // Find the conflict
    let conflict: Conflict | undefined;
    let checkId: string | undefined;

    for (const [id, check] of this.conflictChecks.entries()) {
      const found = check.conflicts.find(c => c.id === conflictId);
      if (found) {
        conflict = found;
        checkId = id;
        break;
      }
    }

    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    if (!conflict.waivable) {
      throw new Error(`Conflict ${conflictId} is not waivable`);
    }

    const waiver: WaiverOfConflict = {
      id: `waiver-${Date.now()}`,
      conflictId,
      clientId,
      clientName,
      matterId,
      conflictDescription: conflict.description,
      disclosureProvided,
      consentObtained: new Date(),
      consentForm,
      informedConsent,
      independentAdvice,
      witnessedBy,
      revoked: false,
    };

    this.waivers.set(waiver.id, waiver);

    // Mark conflict as resolved
    conflict.resolved = true;
    conflict.resolution = `Waiver obtained from ${clientName}`;
    conflict.resolvedAt = new Date();

    if (checkId) {
      const check = this.conflictChecks.get(checkId);
      if (check) {
        check.waiverObtained = true;
        check.waiverDate = new Date();
        this.conflictChecks.set(checkId, check);
      }
    }

    this.logger.log(`Waiver obtained for conflict ${conflictId} from client ${clientName}`);

    return waiver;
  }

  /**
   * Implement ethics wall
   */
  async implementEthicsWall(
    name: string,
    description: string,
    affectedAttorneys: string[],
    screenedMatter: string,
    screenedClient: string,
    procedures: string[],
    monitoringMeasures: string[],
  ): Promise<EthicsWall> {
    const wall: EthicsWall = {
      id: `wall-${Date.now()}`,
      name,
      description,
      affectedAttorneys,
      screenedMatter,
      screenedClient,
      effectiveDate: new Date(),
      procedures,
      monitoringMeasures,
      breachReported: false,
      active: true,
    };

    this.ethicsWalls.set(wall.id, wall);

    this.logger.log(
      `Ethics wall implemented: ${name} for matter ${screenedMatter}, affecting ${affectedAttorneys.length} attorneys`,
    );

    return wall;
  }

  /**
   * Report ethics wall breach
   */
  async reportWallBreach(wallId: string, breachDetails: string): Promise<void> {
    const wall = this.ethicsWalls.get(wallId);
    if (!wall) {
      throw new Error(`Ethics wall not found: ${wallId}`);
    }

    wall.breachReported = true;
    wall.breachDetails = breachDetails;
    this.ethicsWalls.set(wallId, wall);

    this.logger.error(`Ethics wall breach reported for wall ${wallId}: ${breachDetails}`);
  }

  /**
   * Deactivate ethics wall
   */
  async deactivateEthicsWall(wallId: string): Promise<void> {
    const wall = this.ethicsWalls.get(wallId);
    if (!wall) {
      throw new Error(`Ethics wall not found: ${wallId}`);
    }

    wall.active = false;
    wall.endDate = new Date();
    this.ethicsWalls.set(wallId, wall);

    this.logger.log(`Ethics wall ${wallId} deactivated`);
  }

  /**
   * Get conflict checks
   */
  async getConflictChecks(matterId?: string): Promise<ConflictCheck[]> {
    let checks = Array.from(this.conflictChecks.values());

    if (matterId) {
      checks = checks.filter(c => c.matterId === matterId);
    }

    return checks.sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
  }

  /**
   * Get active ethics walls
   */
  async getActiveEthicsWalls(attorneyId?: string): Promise<EthicsWall[]> {
    let walls = Array.from(this.ethicsWalls.values()).filter(w => w.active);

    if (attorneyId) {
      walls = walls.filter(w => w.affectedAttorneys.includes(attorneyId));
    }

    return walls;
  }

  /**
   * Get waivers
   */
  async getWaivers(matterId?: string): Promise<WaiverOfConflict[]> {
    let waivers = Array.from(this.waivers.values()).filter(w => !w.revoked);

    if (matterId) {
      waivers = waivers.filter(w => w.matterId === matterId);
    }

    return waivers;
  }

  /**
   * Revoke waiver
   */
  async revokeWaiver(waiverId: string): Promise<void> {
    const waiver = this.waivers.get(waiverId);
    if (!waiver) {
      throw new Error(`Waiver not found: ${waiverId}`);
    }

    waiver.revoked = true;
    waiver.revokedAt = new Date();
    this.waivers.set(waiverId, waiver);

    this.logger.log(`Waiver ${waiverId} revoked`);
  }
}
