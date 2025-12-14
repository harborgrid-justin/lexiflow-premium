import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CaseTeamsService } from './case-teams.service';
import { CaseTeamMember } from './entities/case-team-member.entity';

describe('CaseTeamsService', () => {
  let service: CaseTeamsService;
  let repository: Repository<CaseTeamMember>;

  const mockTeamMember = {
    id: 'team-001',
    caseId: 'case-001',
    userId: 'user-001',
    role: 'lead_attorney',
    permissions: ['read', 'write', 'delete'],
    assignedAt: new Date(),
    assignedBy: 'admin-001',
    isActive: true,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaseTeamsService,
        { provide: getRepositoryToken(CaseTeamMember), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<CaseTeamsService>(CaseTeamsService);
    repository = module.get<Repository<CaseTeamMember>>(getRepositoryToken(CaseTeamMember));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all team members', async () => {
      mockRepository.find.mockResolvedValue([mockTeamMember]);

      const result = await service.findAll();

      expect(result).toEqual([mockTeamMember]);
    });
  });

  describe('findByCaseId', () => {
    it('should return team members for a case', async () => {
      mockRepository.find.mockResolvedValue([mockTeamMember]);

      const result = await service.findByCaseId('case-001');

      expect(result).toEqual([mockTeamMember]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { caseId: 'case-001', isActive: true },
      });
    });
  });

  describe('findById', () => {
    it('should return a team member by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTeamMember);

      const result = await service.findById(mockTeamMember.id);

      expect(result).toEqual(mockTeamMember);
    });

    it('should throw NotFoundException if team member not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
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

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...mockTeamMember, ...addDto });
      mockRepository.save.mockResolvedValue({ ...mockTeamMember, ...addDto });

      const result = await service.addMember(addDto, 'admin-001');

      expect(result).toHaveProperty('userId', addDto.userId);
    });

    it('should throw ConflictException if member already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockTeamMember);

      await expect(
        service.addMember({ caseId: 'case-001', userId: 'user-001', role: 'attorney' }, 'admin-001'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateRole', () => {
    it('should update member role', async () => {
      mockRepository.findOne.mockResolvedValue(mockTeamMember);
      mockRepository.save.mockResolvedValue({ ...mockTeamMember, role: 'associate' });

      const result = await service.updateRole(mockTeamMember.id, 'associate');

      expect(result.role).toBe('associate');
    });

    it('should throw NotFoundException if member not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateRole('non-existent', 'associate')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePermissions', () => {
    it('should update member permissions', async () => {
      const newPermissions = ['read', 'write'];
      mockRepository.findOne.mockResolvedValue(mockTeamMember);
      mockRepository.save.mockResolvedValue({ ...mockTeamMember, permissions: newPermissions });

      const result = await service.updatePermissions(mockTeamMember.id, newPermissions);

      expect(result.permissions).toEqual(newPermissions);
    });
  });

  describe('removeMember', () => {
    it('should remove a team member', async () => {
      mockRepository.findOne.mockResolvedValue(mockTeamMember);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeMember(mockTeamMember.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockTeamMember.id);
    });
  });

  describe('deactivateMember', () => {
    it('should deactivate a team member', async () => {
      mockRepository.findOne.mockResolvedValue(mockTeamMember);
      mockRepository.save.mockResolvedValue({ ...mockTeamMember, isActive: false });

      const result = await service.deactivateMember(mockTeamMember.id);

      expect(result.isActive).toBe(false);
    });
  });

  describe('findByUserId', () => {
    it('should return team memberships for a user', async () => {
      mockRepository.find.mockResolvedValue([mockTeamMember]);

      const result = await service.findByUserId('user-001');

      expect(result).toEqual([mockTeamMember]);
    });
  });

  describe('findByRole', () => {
    it('should return members by role', async () => {
      mockRepository.find.mockResolvedValue([mockTeamMember]);

      const result = await service.findByRole('case-001', 'lead_attorney');

      expect(result).toEqual([mockTeamMember]);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      mockRepository.findOne.mockResolvedValue(mockTeamMember);

      const result = await service.hasPermission('case-001', 'user-001', 'write');

      expect(result).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockTeamMember, permissions: ['read'] });

      const result = await service.hasPermission('case-001', 'user-001', 'delete');

      expect(result).toBe(false);
    });

    it('should return false if user not on team', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.hasPermission('case-001', 'user-003', 'read');

      expect(result).toBe(false);
    });
  });

  describe('getTeamStats', () => {
    it('should return team statistics for a case', async () => {
      mockRepository.find.mockResolvedValue([
        mockTeamMember,
        { ...mockTeamMember, id: 'team-002', role: 'paralegal' },
      ]);

      const result = await service.getTeamStats('case-001');

      expect(result).toHaveProperty('totalMembers');
      expect(result).toHaveProperty('byRole');
    });
  });
});
