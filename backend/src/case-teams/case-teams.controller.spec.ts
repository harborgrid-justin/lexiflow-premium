import { Test, TestingModule } from '@nestjs/testing';
import { CaseTeamsController } from './case-teams.controller';
import { CaseTeamsService } from './case-teams.service';

describe('CaseTeamsController', () => {
  let controller: CaseTeamsController;
  let service: CaseTeamsService;

  const mockTeamMember = {
    id: 'team-001',
    caseId: 'case-001',
    userId: 'user-001',
    role: 'lead_attorney',
    permissions: ['read', 'write', 'delete'],
    assignedAt: new Date(),
    assignedBy: 'admin-001',
    isActive: true,
  };

  const mockCaseTeamsService = {
    findAll: jest.fn(),
    findByCaseId: jest.fn(),
    findById: jest.fn(),
    addMember: jest.fn(),
    updateRole: jest.fn(),
    updatePermissions: jest.fn(),
    removeMember: jest.fn(),
    deactivateMember: jest.fn(),
    findByUserId: jest.fn(),
    findByRole: jest.fn(),
    hasPermission: jest.fn(),
    getTeamStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaseTeamsController],
      providers: [{ provide: CaseTeamsService, useValue: mockCaseTeamsService }],
    }).compile();

    controller = module.get<CaseTeamsController>(CaseTeamsController);
    service = module.get<CaseTeamsService>(CaseTeamsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all team members', async () => {
      mockCaseTeamsService.findAll.mockResolvedValue([mockTeamMember]);

      const result = await controller.findAll();

      expect(result).toEqual([mockTeamMember]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByCaseId', () => {
    it('should return team members for a case', async () => {
      mockCaseTeamsService.findByCaseId.mockResolvedValue([mockTeamMember]);

      const result = await controller.findByCaseId('case-001');

      expect(result).toEqual([mockTeamMember]);
      expect(service.findByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('findById', () => {
    it('should return a team member by id', async () => {
      mockCaseTeamsService.findById.mockResolvedValue(mockTeamMember);

      const result = await controller.findById('team-001');

      expect(result).toEqual(mockTeamMember);
      expect(service.findById).toHaveBeenCalledWith('team-001');
    });
  });

  describe('addMember', () => {
    it('should add a new team member', async () => {
      const addDto = {
        caseId: 'case-001',
        userId: 'user-002',
        role: 'paralegal',
        permissions: ['read'],
      };
      mockCaseTeamsService.addMember.mockResolvedValue({ ...mockTeamMember, ...addDto });

      const result = await controller.addMember(addDto, 'admin-001');

      expect(result).toHaveProperty('userId', addDto.userId);
      expect(service.addMember).toHaveBeenCalledWith(addDto, 'admin-001');
    });
  });

  describe('updateRole', () => {
    it('should update member role', async () => {
      mockCaseTeamsService.updateRole.mockResolvedValue({ ...mockTeamMember, role: 'associate' });

      const result = await controller.updateRole('team-001', { role: 'associate' });

      expect(result.role).toBe('associate');
      expect(service.updateRole).toHaveBeenCalledWith('team-001', 'associate');
    });
  });

  describe('updatePermissions', () => {
    it('should update member permissions', async () => {
      const newPermissions = ['read', 'write'];
      mockCaseTeamsService.updatePermissions.mockResolvedValue({ ...mockTeamMember, permissions: newPermissions });

      const result = await controller.updatePermissions('team-001', { permissions: newPermissions });

      expect(result.permissions).toEqual(newPermissions);
      expect(service.updatePermissions).toHaveBeenCalledWith('team-001', newPermissions);
    });
  });

  describe('removeMember', () => {
    it('should remove a team member', async () => {
      mockCaseTeamsService.removeMember.mockResolvedValue(undefined);

      await controller.removeMember('team-001');

      expect(service.removeMember).toHaveBeenCalledWith('team-001');
    });
  });

  describe('deactivateMember', () => {
    it('should deactivate a team member', async () => {
      mockCaseTeamsService.deactivateMember.mockResolvedValue({ ...mockTeamMember, isActive: false });

      const result = await controller.deactivateMember('team-001');

      expect(result.isActive).toBe(false);
      expect(service.deactivateMember).toHaveBeenCalledWith('team-001');
    });
  });

  describe('findByUserId', () => {
    it('should return team memberships for a user', async () => {
      mockCaseTeamsService.findByUserId.mockResolvedValue([mockTeamMember]);

      const result = await controller.findByUserId('user-001');

      expect(result).toEqual([mockTeamMember]);
      expect(service.findByUserId).toHaveBeenCalledWith('user-001');
    });
  });

  describe('findByRole', () => {
    it('should return members by role', async () => {
      mockCaseTeamsService.findByRole.mockResolvedValue([mockTeamMember]);

      const result = await controller.findByRole('case-001', 'lead_attorney');

      expect(result).toEqual([mockTeamMember]);
      expect(service.findByRole).toHaveBeenCalledWith('case-001', 'lead_attorney');
    });
  });

  describe('hasPermission', () => {
    it('should check user permission', async () => {
      mockCaseTeamsService.hasPermission.mockResolvedValue(true);

      const result = await controller.hasPermission('case-001', 'user-001', 'write');

      expect(result).toBe(true);
      expect(service.hasPermission).toHaveBeenCalledWith('case-001', 'user-001', 'write');
    });
  });

  describe('getTeamStats', () => {
    it('should return team statistics', async () => {
      mockCaseTeamsService.getTeamStats.mockResolvedValue({
        totalMembers: 5,
        byRole: { lead_attorney: 1, paralegal: 2, associate: 2 },
      });

      const result = await controller.getTeamStats('case-001');

      expect(result).toHaveProperty('totalMembers');
      expect(result).toHaveProperty('byRole');
      expect(service.getTeamStats).toHaveBeenCalledWith('case-001');
    });
  });
});
