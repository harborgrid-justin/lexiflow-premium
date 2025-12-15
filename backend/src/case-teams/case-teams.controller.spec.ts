import { Test, TestingModule } from '@nestjs/testing';
import { CaseTeamsController } from './case-teams.controller';
import { CaseTeamsService } from './case-teams.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('CaseTeamsController', () => {
  let controller: CaseTeamsController;
  let service: CaseTeamsService;

  const mockTeamMember = {
    id: 'team-001',
    caseId: 'case-001',
    userId: 'user-001',
    role: 'LEAD_ATTORNEY',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCaseTeamsService = {
    findAllByCaseId: jest.fn() as jest.Mock,
    create: jest.fn() as jest.Mock,
    update: jest.fn() as jest.Mock,
    remove: jest.fn() as jest.Mock,
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

  describe('findAllByCaseId', () => {
    it('should return team members for a case', async () => {
      mockCaseTeamsService.findAllByCaseId.mockResolvedValue([mockTeamMember]);

      const result = await controller.findAllByCaseId('case-001');

      expect(result).toEqual([mockTeamMember]);
      expect(service.findAllByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('create', () => {
    it('should add a team member', async () => {
      const createDto: any = {
        caseId: 'case-001',
        userId: 'user-002',
        role: 'ASSOCIATE',
        name: 'Test Team',
      };
      mockCaseTeamsService.create.mockResolvedValue({ ...mockTeamMember, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('userId', createDto.userId);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a team member', async () => {
      const updateDto: any = { role: 'SENIOR_ASSOCIATE' };
      mockCaseTeamsService.update.mockResolvedValue({ ...mockTeamMember, ...updateDto });

      const result = await controller.update('team-001', updateDto);

      expect(result.role).toBe('SENIOR_ASSOCIATE');
      expect(service.update).toHaveBeenCalledWith('team-001', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a team member', async () => {
      mockCaseTeamsService.remove.mockResolvedValue(undefined);

      await controller.remove('team-001');

      expect(service.remove).toHaveBeenCalledWith('team-001');
    });
  });
});
