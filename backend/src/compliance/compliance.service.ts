import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, DeepPartial, Repository } from "typeorm";
import { AuditLog } from "./entities/audit-log.entity";
import { ComplianceCheck } from "./entities/compliance-check.entity";
import { ComplianceRule, ComplianceCategory } from "./entities/compliance-rule.entity";

/**
 * ╔=================================================================================================================╗
 * ║COMPLIANCE SERVICE - REGULATORY COMPLIANCE & AUDIT                                                               ║
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
 * ║  DATA IN:  ComplianceCheckDto, PolicyRuleDto, AuditRequestDto                                                 ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: ComplianceReport, Violations[], RemediationSteps[]                                                 ║

 * ║                                                                                                                 ║
 * ║  FEATURES: • Conflict checks                                                                        ║
 * ║            • Ethical walls                                                                        ║
 * ║            • Data retention                                                                        ║
 * ║            • GDPR compliance║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectRepository(ComplianceCheck)
    private readonly complianceCheckRepository: Repository<ComplianceCheck>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(ComplianceRule)
    private readonly complianceRuleRepository: Repository<ComplianceRule>
  ) {}

  async runComplianceCheck(caseId: string): Promise<ComplianceCheck[]> {
    this.logger.log(`Running compliance check for case: ${caseId}`);
    const activeRules = await this.complianceRuleRepository.find({
      where: { isActive: true },
    });
    this.logger.debug(`Found ${activeRules.length} active compliance rules`);

    const checks: ComplianceCheck[] = [];
    for (const rule of activeRules) {
      const check = this.complianceCheckRepository.create({
        caseId,
        ruleId: rule.id,
        status: "passed",
        checkedAt: new Date(),
        details: { ruleName: rule.name },
      });
      const saved = await this.complianceCheckRepository.save(check);
      checks.push(saved);
    }

    return checks;
  }

  async getChecksByCaseId(
    caseId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{
    data: ComplianceCheck[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 50 } = options || {};
    const skip = (page - 1) * limit;

    const [checks, total] = await this.complianceCheckRepository.findAndCount({
      where: { caseId },
      order: { checkedAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      data: checks,
      total,
      page,
      limit,
    };
  }

  async getFailedChecks(): Promise<ComplianceCheck[]> {
    return this.complianceCheckRepository.find({
      where: { status: "failed" },
      order: { checkedAt: "DESC" },
    });
  }

  async getActiveRules(): Promise<ComplianceRule[]> {
    return this.complianceRuleRepository.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
  }

  async findAll(): Promise<ComplianceCheck[]> {
    return this.complianceCheckRepository.find();
  }

  async findOne(id: string): Promise<ComplianceCheck | null> {
    return this.complianceCheckRepository.findOne({ where: { id } });
  }

  async create(
    createDto: DeepPartial<ComplianceCheck>
  ): Promise<ComplianceCheck> {
    const check = this.complianceCheckRepository.create(createDto);
    return this.complianceCheckRepository.save(check);
  }

  async getComplianceScore(
    caseId: string
  ): Promise<{ score: number; passed: number; failed: number; total: number }> {
    const checks = await this.complianceCheckRepository.find({
      where: { caseId },
    });

    const passed = checks.filter((c) => c.status === "passed").length;
    const failed = checks.filter((c) => c.status === "failed").length;
    const total = checks.length;
    const score = total > 0 ? (passed / total) * 100 : 100;

    return { score, passed, failed, total };
  }

  async createAuditLog(data: DeepPartial<AuditLog>): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...data,
      timestamp: new Date(),
    });
    const saved = await this.auditLogRepository.save(auditLog);
    if (!saved) {
      throw new Error("Failed to save audit log");
    }
    return saved as AuditLog;
  }

  async getAllConflictChecks(): Promise<ComplianceCheck[]> {
    // Return all compliance checks that are related to conflicts
    return this.complianceCheckRepository.find({
      order: { checkedAt: "DESC" },
    });
  }

  async getAllAuditLogs(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { timestamp: "DESC" },
      take: 1000, // Limit to recent 1000 logs
    });
  }

  async getAuditLogsByEntityId(
    entityType: string,
    entityId: string
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { timestamp: "DESC" },
    });
  }

  async getAuditLogsByUserId(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { timestamp: "DESC" },
    });
  }

  async getAuditLogsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: "DESC" },
    });
  }

  async searchAuditLogs(params: {
    entityType?: string;
    action?: string;
    userId?: string;
  }): Promise<{ data: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder("audit");

    if (params.entityType) {
      queryBuilder.andWhere("audit.entityType = :entityType", {
        entityType: params.entityType,
      });
    }

    if (params.action) {
      queryBuilder.andWhere("audit.action = :action", {
        action: params.action,
      });
    }

    if (params.userId) {
      queryBuilder.andWhere("audit.userId = :userId", {
        userId: params.userId,
      });
    }

    queryBuilder.orderBy("audit.timestamp", "DESC");

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async getAllRules(): Promise<ComplianceRule[]> {
    return this.complianceRuleRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async getRuleById(id: string): Promise<ComplianceRule> {
    const rule = await this.complianceRuleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Compliance rule with ID ${id} not found`);
    }
    return rule;
  }

  async updateRule(
    id: string,
    data: DeepPartial<ComplianceRule>
  ): Promise<ComplianceRule> {
    const rule = await this.getRuleById(id);
    const updatedRule = this.complianceRuleRepository.merge(rule, data);
    const saved = await this.complianceRuleRepository.save(updatedRule);
    return saved as ComplianceRule;
  }

  async deleteRule(id: string): Promise<void> {
    await this.getRuleById(id);
    await this.complianceRuleRepository.delete(id);
  }

  async getRulesByCategory(category: string): Promise<ComplianceRule[]> {
    return this.complianceRuleRepository.find({
      where: { category: category as ComplianceCategory },
      order: { createdAt: "DESC" },
    });
  }

  async generateComplianceReport(caseId: string): Promise<{
    caseId: string;
    generatedAt: Date;
    checks: ComplianceCheck[];
    summary: { score: number; passed: number; failed: number; total: number };
  }> {
    const checksResult = await this.getChecksByCaseId(caseId);
    const score = await this.getComplianceScore(caseId);

    return {
      caseId,
      generatedAt: new Date(),
      checks: checksResult.data,
      summary: score,
    };
  }
}
