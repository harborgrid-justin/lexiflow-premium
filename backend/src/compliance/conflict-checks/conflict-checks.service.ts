import { Injectable } from "@nestjs/common";
import {
  ConflictCheckDto,
  RunConflictCheckDto,
  ResolveConflictDto,
  WaiveConflictDto,
  QueryConflictChecksDto,
  ConflictCheckStatus,
  ConflictResult,
  ConflictCheckType,
} from "./dto/conflict-check.dto";

/**
 * ╔=================================================================================================================╗
 * ║CONFLICTCHECKS                                                                                                   ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class ConflictChecksService {
  private conflictChecks: Map<string, ConflictCheckDto> = new Map();

  // Mock database of existing clients/matters for conflict checking
  private existingClients = [
    { id: "1", name: "John Smith", cases: ["case1"] },
    { id: "2", name: "Jane Doe", cases: ["case2"] },
    { id: "3", name: "Acme Corporation", cases: ["case3", "case4"] },
    { id: "4", name: "Smith Industries", cases: ["case5"] },
  ];

  async runCheck(dto: RunConflictCheckDto): Promise<ConflictCheckDto> {
    const conflicts = await this.performConflictCheck(dto);

    const conflictCheck: ConflictCheckDto = {
      id: this.generateId(),
      requestedBy: dto.requestedBy,
      requestedByName: dto.requestedByName,
      checkType: dto.checkType,
      targetName: dto.targetName ?? "",
      targetEntity: dto.targetEntity,
      conflicts,
      status:
        conflicts.length > 0
          ? ConflictCheckStatus.CONFLICT_FOUND
          : ConflictCheckStatus.CLEAR,
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
      checks = checks.filter(
        (check) => check.requestedBy === query.requestedBy
      );
    }
    if (query.startDate) {
      checks = checks.filter((check) => check.createdAt >= query.startDate!);
    }
    if (query.endDate) {
      checks = checks.filter((check) => check.createdAt <= query.endDate!);
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

  async resolve(
    id: string,
    dto: ResolveConflictDto
  ): Promise<ConflictCheckDto> {
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

  private async performConflictCheck(
    dto: RunConflictCheckDto
  ): Promise<ConflictResult[]> {
    const conflicts: ConflictResult[] = [];

    // Perform different types of checks based on checkType
    switch (dto.checkType) {
      case ConflictCheckType.CLIENT_VS_CLIENT:
      case ConflictCheckType.CLIENT_VS_OPPOSING:
        // Name matching
        for (const client of this.existingClients) {
          const matchScore = this.calculateNameMatch(
            dto.targetName ?? "",
            client.name
          );

          if (matchScore > 0.7) {
            conflicts.push({
              conflictType: dto.checkType,
              matchedEntity: client.name,
              matchedEntityId: client.id,
              matchScore,
              details: `Potential conflict with existing client: ${client.name}`,
              severity:
                matchScore > 0.95
                  ? "critical"
                  : matchScore > 0.85
                    ? "high"
                    : "medium",
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
              severity: "high",
            });
          }
        }
        break;

      case ConflictCheckType.PRIOR_REPRESENTATION:
        // Check for prior representation
        for (const client of this.existingClients) {
          const matchScore = this.calculateNameMatch(
            dto.targetName ?? "",
            client.name
          );

          if (matchScore > 0.8 && client.cases.length > 0) {
            conflicts.push({
              conflictType: dto.checkType,
              matchedEntity: client.name,
              matchedEntityId: client.id,
              matchScore,
              details: `Prior representation found: ${client.cases.length} previous case(s)`,
              severity: "medium",
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
    const matrix: number[][] = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str2.length; i++) {
      const row = matrix[i];
      if (row) {
        row[0] = i;
      }
    }

    for (let j = 0; j <= str1.length; j++) {
      const row = matrix[0];
      if (row) {
        row[j] = j;
      }
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        const currentRow = matrix[i];
        const prevRow = matrix[i - 1];

        if (currentRow && prevRow) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            currentRow[j] = prevRow[j - 1] ?? 0;
          } else {
            currentRow[j] = Math.min(
              (prevRow[j - 1] ?? 0) + 1,
              (currentRow[j - 1] ?? 0) + 1,
              (prevRow[j] ?? 0) + 1
            );
          }
        }
      }
    }
    const lastRow = matrix[str2.length];
    return lastRow ? (lastRow[str1.length] ?? 0) : 0;
  }

  private soundex(str: string): string {
    const code = str.toUpperCase().replace(/[^A-Z]/g, "");
    if (!code) return "0000";

    const firstLetter = code[0];
    const soundexCode = code
      .slice(1)
      .replace(/[BFPV]/g, "1")
      .replace(/[CGJKQSXZ]/g, "2")
      .replace(/[DT]/g, "3")
      .replace(/[L]/g, "4")
      .replace(/[MN]/g, "5")
      .replace(/[R]/g, "6")
      .replace(/[AEIOUHWY]/g, "0")
      .replace(/(.)\1+/g, "$1")
      .replace(/0/g, "");

    return (firstLetter + soundexCode + "000").slice(0, 4);
  }

  private generateId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
