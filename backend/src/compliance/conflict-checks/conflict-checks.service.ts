import { Injectable } from '@nestjs/common';
import {
  ConflictCheckDto,
  RunConflictCheckDto,
  ResolveConflictDto,
  WaiveConflictDto,
  QueryConflictChecksDto,
  ConflictCheckStatus,
  ConflictResult,
  ConflictCheckType,
  BatchConflictCheckDto,
  HistoricalConflictSearchDto,
  PartyConflictCheckDto,
  ConflictNotification,
} from './dto/conflict-check.dto';

@Injectable()
export class ConflictChecksService {
  private conflictChecks: Map<string, ConflictCheckDto> = new Map();
  private notifications: Map<string, ConflictNotification> = new Map();

  // Mock database of existing clients/matters for conflict checking
  private existingClients = [
    { id: '1', name: 'John Smith', cases: ['case1'] },
    { id: '2', name: 'Jane Doe', cases: ['case2'] },
    { id: '3', name: 'Acme Corporation', cases: ['case3', 'case4'] },
    { id: '4', name: 'Smith Industries', cases: ['case5'] },
  ];

  async runCheck(dto: RunConflictCheckDto): Promise<ConflictCheckDto> {
    const conflicts = await this.performConflictCheck(dto);

    const conflictCheck: ConflictCheckDto = {
      id: this.generateId(),
      requestedBy: dto.requestedBy,
      requestedByName: dto.requestedByName,
      checkType: dto.checkType,
      targetName: dto.targetName,
      targetEntity: dto.targetEntity,
      conflicts,
      status: conflicts.length > 0 ? ConflictCheckStatus.CONFLICT_FOUND : ConflictCheckStatus.CLEAR,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId: dto.organizationId,
    };

    this.conflictChecks.set(conflictCheck.id, conflictCheck);
    return conflictCheck;
  }

  async findAll(query: QueryConflictChecksDto): Promise<{
    data: ConflictCheckDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    let checks = Array.from(this.conflictChecks.values());

    // Apply filters
    if (query.status) {
      checks = checks.filter((check) => check.status === query.status);
    }
    if (query.checkType) {
      checks = checks.filter((check) => check.checkType === query.checkType);
    }
    if (query.requestedBy) {
      checks = checks.filter((check) => check.requestedBy === query.requestedBy);
    }
    if (query.startDate) {
      checks = checks.filter((check) => check.createdAt >= query.startDate);
    }
    if (query.endDate) {
      checks = checks.filter((check) => check.createdAt <= query.endDate);
    }

    // Sort by creation date (newest first)
    checks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginate
    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedChecks = checks.slice(startIndex, endIndex);

    return {
      data: paginatedChecks,
      total: checks.length,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ConflictCheckDto> {
    const check = this.conflictChecks.get(id);
    if (!check) {
      throw new Error(`Conflict check with ID ${id} not found`);
    }
    return check;
  }

  async resolve(id: string, dto: ResolveConflictDto): Promise<ConflictCheckDto> {
    const check = await this.findOne(id);

    check.resolution = {
      resolvedBy: dto.resolvedBy,
      resolvedByName: dto.resolvedByName,
      resolvedAt: new Date(),
      resolutionMethod: dto.resolutionMethod,
      notes: dto.notes,
    };
    check.status = ConflictCheckStatus.RESOLVED;
    check.updatedAt = new Date();

    this.conflictChecks.set(id, check);
    return check;
  }

  async waive(id: string, dto: WaiveConflictDto): Promise<ConflictCheckDto> {
    const check = await this.findOne(id);

    check.waiver = {
      waivedBy: dto.waivedBy,
      waivedByName: dto.waivedByName,
      waivedAt: new Date(),
      reason: dto.reason,
      approvedBy: dto.approvedBy,
    };
    check.status = ConflictCheckStatus.WAIVED;
    check.updatedAt = new Date();

    this.conflictChecks.set(id, check);
    return check;
  }

  private async performConflictCheck(dto: RunConflictCheckDto): Promise<ConflictResult[]> {
    const conflicts: ConflictResult[] = [];
    const targetNameLower = dto.targetName.toLowerCase();

    // Perform different types of checks based on checkType
    switch (dto.checkType) {
      case ConflictCheckType.CLIENT_VS_CLIENT:
      case ConflictCheckType.CLIENT_VS_OPPOSING:
        // Name matching
        for (const client of this.existingClients) {
          const matchScore = this.calculateNameMatch(dto.targetName, client.name);

          if (matchScore > 0.7) {
            conflicts.push({
              conflictType: dto.checkType,
              matchedEntity: client.name,
              matchedEntityId: client.id,
              matchScore,
              details: `Potential conflict with existing client: ${client.name}`,
              severity: matchScore > 0.95 ? 'critical' : matchScore > 0.85 ? 'high' : 'medium',
            });
          }
        }
        break;

      case ConflictCheckType.MATTER_OVERLAP:
        // Check for overlapping matters
        for (const client of this.existingClients) {
          if (dto.caseId && client.cases.includes(dto.caseId)) {
            conflicts.push({
              conflictType: dto.checkType,
              matchedEntity: client.name,
              matchedEntityId: client.id,
              matchScore: 1.0,
              details: `Matter overlap detected with existing case`,
              severity: 'high',
            });
          }
        }
        break;

      case ConflictCheckType.PRIOR_REPRESENTATION:
        // Check for prior representation
        for (const client of this.existingClients) {
          const matchScore = this.calculateNameMatch(dto.targetName, client.name);

          if (matchScore > 0.8 && client.cases.length > 0) {
            conflicts.push({
              conflictType: dto.checkType,
              matchedEntity: client.name,
              matchedEntityId: client.id,
              matchScore,
              details: `Prior representation found: ${client.cases.length} previous case(s)`,
              severity: 'medium',
            });
          }
        }
        break;
    }

    return conflicts;
  }

  private calculateNameMatch(name1: string, name2: string): number {
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();

    // Exact match
    if (n1 === n2) return 1.0;

    // Levenshtein distance-based similarity
    const distance = this.levenshteinDistance(n1, n2);
    const maxLength = Math.max(n1.length, n2.length);
    const similarity = 1 - distance / maxLength;

    // Soundex matching for phonetic similarity
    if (this.soundex(n1) === this.soundex(n2)) {
      return Math.max(similarity, 0.85);
    }

    return similarity;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private soundex(str: string): string {
    const code = str.toUpperCase().replace(/[^A-Z]/g, '');
    if (!code) return '0000';

    const firstLetter = code[0];
    const soundexCode = code
      .slice(1)
      .replace(/[BFPV]/g, '1')
      .replace(/[CGJKQSXZ]/g, '2')
      .replace(/[DT]/g, '3')
      .replace(/[L]/g, '4')
      .replace(/[MN]/g, '5')
      .replace(/[R]/g, '6')
      .replace(/[AEIOUHWY]/g, '0')
      .replace(/(.)\1+/g, '$1')
      .replace(/0/g, '');

    return (firstLetter + soundexCode + '000').slice(0, 4);
  }

  // Historical Conflict Search
  async searchHistoricalConflicts(dto: HistoricalConflictSearchDto): Promise<ConflictCheckDto[]> {
    const minScore = dto.minMatchScore || 0.7;
    let checks = Array.from(this.conflictChecks.values());

    // Filter by date range
    if (dto.startDate) {
      checks = checks.filter((check) => check.createdAt >= dto.startDate);
    }
    if (dto.endDate) {
      checks = checks.filter((check) => check.createdAt <= dto.endDate);
    }

    // Filter by status
    if (!dto.includeResolved) {
      checks = checks.filter((check) => check.status !== ConflictCheckStatus.RESOLVED);
    }
    if (!dto.includeWaived) {
      checks = checks.filter((check) => check.status !== ConflictCheckStatus.WAIVED);
    }

    // Search by name matching
    const results: ConflictCheckDto[] = [];
    const searchTermLower = dto.searchTerm.toLowerCase();

    for (const check of checks) {
      // Check target name
      const targetMatchScore = this.calculateNameMatch(dto.searchTerm, check.targetName);

      if (targetMatchScore >= minScore) {
        results.push(check);
        continue;
      }

      // Check matched entities in conflicts
      for (const conflict of check.conflicts) {
        const matchScore = this.calculateNameMatch(dto.searchTerm, conflict.matchedEntity);
        if (matchScore >= minScore) {
          results.push(check);
          break;
        }
      }
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Batch Conflict Check
  async runBatchCheck(dto: BatchConflictCheckDto): Promise<ConflictCheckDto[]> {
    const results: ConflictCheckDto[] = [];

    for (const target of dto.targets) {
      const checkDto: RunConflictCheckDto = {
        requestedBy: dto.requestedBy,
        requestedByName: dto.requestedByName,
        checkType: dto.checkType,
        targetName: target.name,
        targetEntity: target.entityId,
        organizationId: dto.organizationId,
      };

      const result = await this.runCheck(checkDto);
      results.push(result);
    }

    return results;
  }

  // Party Conflict Check
  async checkPartyConflicts(dto: PartyConflictCheckDto): Promise<ConflictCheckDto> {
    const allConflicts: ConflictResult[] = [];

    // Check each party against existing clients and cases
    for (const party of dto.parties) {
      const conflicts = await this.performConflictCheck({
        requestedBy: dto.requestedBy,
        requestedByName: dto.requestedByName,
        checkType: ConflictCheckType.CLIENT_VS_OPPOSING,
        targetName: party.name,
        caseId: dto.caseId,
        organizationId: dto.organizationId,
      });

      // Add party role to conflict details
      conflicts.forEach((conflict) => {
        conflict.details = `${conflict.details} (Party role: ${party.role})`;
      });

      allConflicts.push(...conflicts);
    }

    // Check for conflicts between parties
    for (let i = 0; i < dto.parties.length; i++) {
      for (let j = i + 1; j < dto.parties.length; j++) {
        const party1 = dto.parties[i];
        const party2 = dto.parties[j];
        const matchScore = this.calculateNameMatch(party1.name, party2.name);

        if (matchScore > 0.8) {
          allConflicts.push({
            conflictType: ConflictCheckType.CLIENT_VS_CLIENT,
            matchedEntity: party2.name,
            matchedEntityId: 'party_match',
            matchScore,
            details: `Potential conflict between parties: ${party1.name} (${party1.role}) and ${party2.name} (${party2.role})`,
            severity: matchScore > 0.95 ? 'critical' : 'high',
          });
        }
      }
    }

    const conflictCheck: ConflictCheckDto = {
      id: this.generateId(),
      requestedBy: dto.requestedBy,
      requestedByName: dto.requestedByName,
      checkType: ConflictCheckType.CLIENT_VS_OPPOSING,
      targetName: dto.parties.map((p) => p.name).join(', '),
      targetEntity: dto.caseId,
      conflicts: allConflicts,
      status: allConflicts.length > 0 ? ConflictCheckStatus.CONFLICT_FOUND : ConflictCheckStatus.CLEAR,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId: dto.organizationId,
    };

    this.conflictChecks.set(conflictCheck.id, conflictCheck);

    // Send notification if conflicts found
    if (allConflicts.length > 0) {
      await this.sendConflictNotification(conflictCheck, 'conflict_found');
    }

    return conflictCheck;
  }

  // Notifications
  async sendConflictNotification(
    conflictCheck: ConflictCheckDto,
    type: 'conflict_found' | 'conflict_resolved' | 'waiver_required',
  ): Promise<ConflictNotification> {
    const notification: ConflictNotification = {
      id: this.generateId(),
      conflictCheckId: conflictCheck.id,
      recipientUserId: conflictCheck.requestedBy,
      recipientEmail: `${conflictCheck.requestedByName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      notificationType: type,
      message: this.generateNotificationMessage(conflictCheck, type),
      sentAt: new Date(),
    };

    this.notifications.set(notification.id, notification);
    return notification;
  }

  async getNotifications(userId: string): Promise<ConflictNotification[]> {
    return Array.from(this.notifications.values())
      .filter((notif) => notif.recipientUserId === userId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  async markNotificationRead(notificationId: string): Promise<ConflictNotification> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }

    notification.readAt = new Date();
    this.notifications.set(notificationId, notification);
    return notification;
  }

  private generateNotificationMessage(
    conflictCheck: ConflictCheckDto,
    type: 'conflict_found' | 'conflict_resolved' | 'waiver_required',
  ): string {
    const conflictCount = conflictCheck.conflicts.length;
    const criticalCount = conflictCheck.conflicts.filter((c) => c.severity === 'critical').length;

    switch (type) {
      case 'conflict_found':
        return `Conflict check for "${conflictCheck.targetName}" found ${conflictCount} potential conflict(s)${criticalCount > 0 ? ` (${criticalCount} critical)` : ''}. Review required.`;
      case 'conflict_resolved':
        return `Conflict check for "${conflictCheck.targetName}" has been resolved.`;
      case 'waiver_required':
        return `Conflict check for "${conflictCheck.targetName}" requires waiver approval.`;
      default:
        return `Update on conflict check for "${conflictCheck.targetName}".`;
    }
  }

  // Advanced name matching with fuzzy logic
  async findSimilarClients(name: string, threshold: number = 0.7): Promise<Array<{
    clientId: string;
    clientName: string;
    matchScore: number;
    cases: string[];
  }>> {
    const results = [];

    for (const client of this.existingClients) {
      const matchScore = this.calculateNameMatch(name, client.name);

      if (matchScore >= threshold) {
        results.push({
          clientId: client.id,
          clientName: client.name,
          matchScore,
          cases: client.cases,
        });
      }
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Get conflict statistics
  async getConflictStatistics(organizationId: string): Promise<{
    totalChecks: number;
    conflictsFound: number;
    resolved: number;
    waived: number;
    pending: number;
    byCheckType: Record<string, number>;
    bySeverity: Record<string, number>;
    averageResolutionTime: number;
  }> {
    const checks = Array.from(this.conflictChecks.values()).filter(
      (check) => check.organizationId === organizationId,
    );

    const conflictsFound = checks.filter((c) => c.status === ConflictCheckStatus.CONFLICT_FOUND);
    const resolved = checks.filter((c) => c.status === ConflictCheckStatus.RESOLVED);
    const waived = checks.filter((c) => c.status === ConflictCheckStatus.WAIVED);
    const pending = checks.filter((c) => c.status === ConflictCheckStatus.PENDING);

    const byCheckType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    checks.forEach((check) => {
      byCheckType[check.checkType] = (byCheckType[check.checkType] || 0) + 1;

      check.conflicts.forEach((conflict) => {
        bySeverity[conflict.severity] = (bySeverity[conflict.severity] || 0) + 1;
      });
    });

    // Calculate average resolution time
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    resolved.forEach((check) => {
      if (check.resolution) {
        const resolutionTime = check.resolution.resolvedAt.getTime() - check.createdAt.getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    });

    const averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

    return {
      totalChecks: checks.length,
      conflictsFound: conflictsFound.length,
      resolved: resolved.length,
      waived: waived.length,
      pending: pending.length,
      byCheckType,
      bySeverity,
      averageResolutionTime: Math.round(averageResolutionTime / (1000 * 60 * 60)), // Convert to hours
    };
  }

  private generateId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
