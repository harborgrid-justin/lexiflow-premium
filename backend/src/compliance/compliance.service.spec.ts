import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { ComplianceCheck } from './entities/compliance-check.entity';
import { AuditLog } from './entities/audit-log.entity';
import { ComplianceRule } from './entities/compliance-rule.entity';

describe('ComplianceService', () => {
  let service: ComplianceService;
  let complianceCheckRepository: Repository<ComplianceCheck>;
  let auditLogRepository: Repository<AuditLog>;
  let complianceRuleRepository: Repository<ComplianceRule>;

  const mockComplianceCheck = {
    id: 'check-001',
    caseId: 'case-001',
    ruleId: 'rule-001',
    status: 'passed',
    checkedAt: new Date(),
    details: { message: 'All requirements met' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuditLog = {
    id: 'audit-001',
    entityType: 'Case',
    entityId: 'case-001',
    action: 'UPDATE',
    userId: 'user-001',
    changes: { status: { from: 'Active', to: 'Closed' } },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    timestamp: new Date(),
  };

  const mockComplianceRule = {
    id: 'rule-001',
    name: 'Document Retention Policy',
    description: 'All documents must be retained for 7 years',
    category: 'Data Retention',
    severity: 'high',
    isActive: true,
    conditions: { retentionPeriod: 7 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockComplianceCheckRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAuditLogRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockComplianceRuleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        { provide: getRepositoryToken(ComplianceCheck), useValue: mockComplianceCheckRepository },
        { provide: getRepositoryToken(AuditLog), useValue: mockAuditLogRepository },
        { provide: getRepositoryToken(ComplianceRule), useValue: mockComplianceRuleRepository },
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
    complianceCheckRepository = module.get<Repository<ComplianceCheck>>(getRepositoryToken(ComplianceCheck));
    auditLogRepository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
    complianceRuleRepository = module.get<Repository<ComplianceRule>>(getRepositoryToken(ComplianceRule));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Compliance Checks', () => {
    describe('runComplianceCheck', () => {
      it('should run compliance check for a case', async () => {
        mockComplianceRuleRepository.find.mockResolvedValue([mockComplianceRule]);
        mockComplianceCheckRepository.create.mockReturnValue(mockComplianceCheck);
        mockComplianceCheckRepository.save.mockResolvedValue(mockComplianceCheck);

        const result = await service.runComplianceCheck('case-001');

        expect(result).toBeInstanceOf(Array);
        expect(mockComplianceRuleRepository.find).toHaveBeenCalledWith({
          where: { isActive: true },
        });
      });
    });

    describe('getChecksByCaseId', () => {
      it('should return compliance checks for a case', async () => {
        mockComplianceCheckRepository.find.mockResolvedValue([mockComplianceCheck]);

        const result = await service.getChecksByCaseId('case-001');

        expect(result).toEqual([mockComplianceCheck]);
      });
    });

    describe('getFailedChecks', () => {
      it('should return failed compliance checks', async () => {
        const failedCheck = { ...mockComplianceCheck, status: 'failed' };
        mockComplianceCheckRepository.find.mockResolvedValue([failedCheck]);

        const result = await service.getFailedChecks();

        expect(result).toEqual([failedCheck]);
        expect(mockComplianceCheckRepository.find).toHaveBeenCalledWith({
          where: { status: 'failed' },
        });
      });
    });

    describe('getComplianceScore', () => {
      it('should calculate compliance score for a case', async () => {
        mockComplianceCheckRepository.find.mockResolvedValue([
          { ...mockComplianceCheck, status: 'passed' },
          { ...mockComplianceCheck, status: 'passed' },
          { ...mockComplianceCheck, status: 'failed' },
        ]);

        const result = await service.getComplianceScore('case-001');

        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('passed', 2);
        expect(result).toHaveProperty('failed', 1);
        expect(result).toHaveProperty('total', 3);
        expect(result.score).toBeCloseTo(66.67, 1);
      });
    });
  });

  describe('Audit Logs', () => {
    describe('createAuditLog', () => {
      it('should create an audit log entry', async () => {
        const auditData = {
          entityType: 'Case',
          entityId: 'case-001',
          action: 'UPDATE',
          userId: 'user-001',
          changes: { status: { from: 'Active', to: 'Closed' } },
        };

        mockAuditLogRepository.create.mockReturnValue(mockAuditLog);
        mockAuditLogRepository.save.mockResolvedValue(mockAuditLog);

        const result = await service.createAuditLog(auditData);

        expect(result).toEqual(mockAuditLog);
      });
    });

    describe('getAuditLogsByEntityId', () => {
      it('should return audit logs for an entity', async () => {
        mockAuditLogRepository.find.mockResolvedValue([mockAuditLog]);

        const result = await service.getAuditLogsByEntityId('Case', 'case-001');

        expect(result).toEqual([mockAuditLog]);
        expect(mockAuditLogRepository.find).toHaveBeenCalledWith({
          where: { entityType: 'Case', entityId: 'case-001' },
          order: { timestamp: 'DESC' },
        });
      });
    });

    describe('getAuditLogsByUserId', () => {
      it('should return audit logs for a user', async () => {
        mockAuditLogRepository.find.mockResolvedValue([mockAuditLog]);

        const result = await service.getAuditLogsByUserId('user-001');

        expect(result).toEqual([mockAuditLog]);
      });
    });

    describe('getAuditLogsByDateRange', () => {
      it('should return audit logs within date range', async () => {
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([mockAuditLog]),
        };
        mockAuditLogRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        const result = await service.getAuditLogsByDateRange(startDate, endDate);

        expect(result).toEqual([mockAuditLog]);
      });
    });

    describe('searchAuditLogs', () => {
      it('should search audit logs', async () => {
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([[mockAuditLog], 1]),
        };
        mockAuditLogRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        const result = await service.searchAuditLogs({
          entityType: 'Case',
          action: 'UPDATE',
          page: 1,
          limit: 10,
        });

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('total', 1);
      });
    });
  });

  describe('Compliance Rules', () => {
    describe('getAllRules', () => {
      it('should return all compliance rules', async () => {
        mockComplianceRuleRepository.find.mockResolvedValue([mockComplianceRule]);

        const result = await service.getAllRules();

        expect(result).toEqual([mockComplianceRule]);
      });
    });

    describe('getRuleById', () => {
      it('should return a rule by id', async () => {
        mockComplianceRuleRepository.findOne.mockResolvedValue(mockComplianceRule);

        const result = await service.getRuleById(mockComplianceRule.id);

        expect(result).toEqual(mockComplianceRule);
      });

      it('should throw NotFoundException if rule not found', async () => {
        mockComplianceRuleRepository.findOne.mockResolvedValue(null);

        await expect(service.getRuleById('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('createRule', () => {
      it('should create a new compliance rule', async () => {
        const createDto = {
          name: 'New Rule',
          description: 'New rule description',
          category: 'Security',
          severity: 'high',
        };

        mockComplianceRuleRepository.create.mockReturnValue(mockComplianceRule);
        mockComplianceRuleRepository.save.mockResolvedValue(mockComplianceRule);

        const result = await service.createRule(createDto);

        expect(result).toEqual(mockComplianceRule);
      });
    });

    describe('updateRule', () => {
      it('should update a compliance rule', async () => {
        const updateDto = { isActive: false };
        mockComplianceRuleRepository.findOne.mockResolvedValue(mockComplianceRule);
        mockComplianceRuleRepository.save.mockResolvedValue({ ...mockComplianceRule, ...updateDto });

        const result = await service.updateRule(mockComplianceRule.id, updateDto);

        expect(result.isActive).toBe(false);
      });
    });

    describe('deleteRule', () => {
      it('should delete a compliance rule', async () => {
        mockComplianceRuleRepository.findOne.mockResolvedValue(mockComplianceRule);
        mockComplianceRuleRepository.delete.mockResolvedValue({ affected: 1 });

        await service.deleteRule(mockComplianceRule.id);

        expect(mockComplianceRuleRepository.delete).toHaveBeenCalledWith(mockComplianceRule.id);
      });
    });

    describe('getActiveRules', () => {
      it('should return active compliance rules', async () => {
        mockComplianceRuleRepository.find.mockResolvedValue([mockComplianceRule]);

        const result = await service.getActiveRules();

        expect(result).toEqual([mockComplianceRule]);
        expect(mockComplianceRuleRepository.find).toHaveBeenCalledWith({
          where: { isActive: true },
        });
      });
    });

    describe('getRulesByCategory', () => {
      it('should return rules by category', async () => {
        mockComplianceRuleRepository.find.mockResolvedValue([mockComplianceRule]);

        const result = await service.getRulesByCategory('Data Retention');

        expect(result).toEqual([mockComplianceRule]);
      });
    });
  });

  describe('Reports', () => {
    describe('generateComplianceReport', () => {
      it('should generate a compliance report', async () => {
        mockComplianceCheckRepository.find.mockResolvedValue([mockComplianceCheck]);
        mockComplianceRuleRepository.find.mockResolvedValue([mockComplianceRule]);

        const result = await service.generateComplianceReport('case-001');

        expect(result).toHaveProperty('caseId', 'case-001');
        expect(result).toHaveProperty('generatedAt');
        expect(result).toHaveProperty('checks');
        expect(result).toHaveProperty('summary');
      });
    });
  });
});
