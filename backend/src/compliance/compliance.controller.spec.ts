import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';

describe('ComplianceController', () => {
  let controller: ComplianceController;
  let service: ComplianceService;

  const mockComplianceCheck = {
    id: 'check-001',
    caseId: 'case-001',
    type: 'document_retention',
    status: 'passed',
    result: { compliant: true, issues: [] },
    checkedAt: new Date(),
  };

  const mockAuditLog = {
    id: 'audit-001',
    action: 'case.created',
    entityType: 'case',
    entityId: 'case-001',
    userId: 'user-001',
    changes: { status: { from: null, to: 'active' } },
    timestamp: new Date(),
  };

  const mockComplianceRule = {
    id: 'rule-001',
    name: 'Document Retention',
    type: 'retention',
    conditions: { minDays: 365 },
    isActive: true,
  };

  const mockComplianceService = {
    runCheck: jest.fn(),
    getChecks: jest.fn(),
    getCheckById: jest.fn(),
    getAuditLogs: jest.fn(),
    getAuditLogById: jest.fn(),
    getRules: jest.fn(),
    getRuleById: jest.fn(),
    createRule: jest.fn(),
    updateRule: jest.fn(),
    deleteRule: jest.fn(),
    setRuleActive: jest.fn(),
    getComplianceStatus: jest.fn(),
    generateComplianceReport: jest.fn(),
    exportAuditLogs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplianceController],
      providers: [{ provide: ComplianceService, useValue: mockComplianceService }],
    }).compile();

    controller = module.get<ComplianceController>(ComplianceController);
    service = module.get<ComplianceService>(ComplianceService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('runCheck', () => {
    it('should run a compliance check', async () => {
      const checkDto = { caseId: 'case-001', type: 'document_retention' };
      mockComplianceService.runCheck.mockResolvedValue(mockComplianceCheck);

      const result = await controller.runCheck(checkDto);

      expect(result).toEqual(mockComplianceCheck);
      expect(service.runCheck).toHaveBeenCalledWith(checkDto);
    });
  });

  describe('getChecks', () => {
    it('should return compliance checks', async () => {
      mockComplianceService.getChecks.mockResolvedValue([mockComplianceCheck]);

      const result = await controller.getChecks('case-001');

      expect(result).toEqual([mockComplianceCheck]);
      expect(service.getChecks).toHaveBeenCalledWith('case-001');
    });
  });

  describe('getCheckById', () => {
    it('should return a compliance check by id', async () => {
      mockComplianceService.getCheckById.mockResolvedValue(mockComplianceCheck);

      const result = await controller.getCheckById('check-001');

      expect(result).toEqual(mockComplianceCheck);
      expect(service.getCheckById).toHaveBeenCalledWith('check-001');
    });
  });

  describe('getAuditLogs', () => {
    it('should return audit logs', async () => {
      mockComplianceService.getAuditLogs.mockResolvedValue({ data: [mockAuditLog], total: 1 });

      const result = await controller.getAuditLogs({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });

  describe('getAuditLogById', () => {
    it('should return an audit log by id', async () => {
      mockComplianceService.getAuditLogById.mockResolvedValue(mockAuditLog);

      const result = await controller.getAuditLogById('audit-001');

      expect(result).toEqual(mockAuditLog);
      expect(service.getAuditLogById).toHaveBeenCalledWith('audit-001');
    });
  });

  describe('getRules', () => {
    it('should return compliance rules', async () => {
      mockComplianceService.getRules.mockResolvedValue([mockComplianceRule]);

      const result = await controller.getRules();

      expect(result).toEqual([mockComplianceRule]);
      expect(service.getRules).toHaveBeenCalled();
    });
  });

  describe('getRuleById', () => {
    it('should return a compliance rule by id', async () => {
      mockComplianceService.getRuleById.mockResolvedValue(mockComplianceRule);

      const result = await controller.getRuleById('rule-001');

      expect(result).toEqual(mockComplianceRule);
      expect(service.getRuleById).toHaveBeenCalledWith('rule-001');
    });
  });

  describe('createRule', () => {
    it('should create a compliance rule', async () => {
      const createDto = {
        name: 'New Rule',
        type: 'access',
        conditions: { maxAttempts: 3 },
      };
      mockComplianceService.createRule.mockResolvedValue({ ...mockComplianceRule, ...createDto });

      const result = await controller.createRule(createDto);

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.createRule).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateRule', () => {
    it('should update a compliance rule', async () => {
      const updateDto = { name: 'Updated Rule' };
      mockComplianceService.updateRule.mockResolvedValue({ ...mockComplianceRule, ...updateDto });

      const result = await controller.updateRule('rule-001', updateDto);

      expect(result.name).toBe('Updated Rule');
      expect(service.updateRule).toHaveBeenCalledWith('rule-001', updateDto);
    });
  });

  describe('deleteRule', () => {
    it('should delete a compliance rule', async () => {
      mockComplianceService.deleteRule.mockResolvedValue(undefined);

      await controller.deleteRule('rule-001');

      expect(service.deleteRule).toHaveBeenCalledWith('rule-001');
    });
  });

  describe('setRuleActive', () => {
    it('should activate a rule', async () => {
      mockComplianceService.setRuleActive.mockResolvedValue({ ...mockComplianceRule, isActive: true });

      const result = await controller.setRuleActive('rule-001', { isActive: true });

      expect(result.isActive).toBe(true);
      expect(service.setRuleActive).toHaveBeenCalledWith('rule-001', true);
    });
  });

  describe('getComplianceStatus', () => {
    it('should return overall compliance status', async () => {
      mockComplianceService.getComplianceStatus.mockResolvedValue({
        overall: 'compliant',
        checksRun: 10,
        checksPassed: 10,
        checksFailed: 0,
      });

      const result = await controller.getComplianceStatus('case-001');

      expect(result).toHaveProperty('overall');
      expect(result).toHaveProperty('checksRun');
    });
  });

  describe('generateComplianceReport', () => {
    it('should generate a compliance report', async () => {
      mockComplianceService.generateComplianceReport.mockResolvedValue({
        reportId: 'report-001',
        status: 'generated',
      });

      const result = await controller.generateComplianceReport({
        caseId: 'case-001',
        format: 'pdf',
      });

      expect(result).toHaveProperty('reportId');
      expect(service.generateComplianceReport).toHaveBeenCalled();
    });
  });

  describe('exportAuditLogs', () => {
    it('should export audit logs', async () => {
      mockComplianceService.exportAuditLogs.mockResolvedValue({
        filePath: '/exports/audit-logs.csv',
        format: 'csv',
      });

      const result = await controller.exportAuditLogs({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        format: 'csv',
      });

      expect(result).toHaveProperty('filePath');
      expect(service.exportAuditLogs).toHaveBeenCalled();
    });
  });
});
