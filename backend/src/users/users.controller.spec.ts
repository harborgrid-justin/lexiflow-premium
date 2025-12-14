import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '../common/enums/role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.CLIENT_USER,
    isActive: true,
    mfaEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([mockUser]),
    findById: jest.fn().mockResolvedValue(mockUser),
    findByEmail: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue(undefined),
    setMfaEnabled: jest.fn().mockResolvedValue({ ...mockUser, mfaEnabled: true }),
    setActive: jest.fn().mockResolvedValue({ ...mockUser, isActive: false }),
    findByRole: jest.fn().mockResolvedValue([mockUser]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await controller.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findById.mockResolvedValueOnce(null);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: Role.CLIENT_USER,
      };

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const result = await controller.update(mockUser.id, updateUserDto);

      expect(result).toEqual(mockUser);
      expect(service.update).toHaveBeenCalledWith(mockUser.id, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      await controller.remove(mockUser.id);

      expect(service.remove).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('enableMfa', () => {
    it('should enable MFA for user', async () => {
      const result = await controller.enableMfa(mockUser.id);

      expect(result.mfaEnabled).toBe(true);
      expect(service.setMfaEnabled).toHaveBeenCalledWith(mockUser.id, true);
    });
  });

  describe('disableMfa', () => {
    it('should disable MFA for user', async () => {
      mockUsersService.setMfaEnabled.mockResolvedValueOnce({ ...mockUser, mfaEnabled: false });

      const result = await controller.disableMfa(mockUser.id);

      expect(result.mfaEnabled).toBe(false);
      expect(service.setMfaEnabled).toHaveBeenCalledWith(mockUser.id, false);
    });
  });

  describe('activate', () => {
    it('should activate a user', async () => {
      mockUsersService.setActive.mockResolvedValueOnce({ ...mockUser, isActive: true });

      const result = await controller.activate(mockUser.id);

      expect(result.isActive).toBe(true);
      expect(service.setActive).toHaveBeenCalledWith(mockUser.id, true);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a user', async () => {
      const result = await controller.deactivate(mockUser.id);

      expect(result.isActive).toBe(false);
      expect(service.setActive).toHaveBeenCalledWith(mockUser.id, false);
    });
  });

  describe('findByRole', () => {
    it('should return users by role', async () => {
      const result = await controller.findByRole(Role.CLIENT_USER);

      expect(result).toEqual([mockUser]);
      expect(service.findByRole).toHaveBeenCalledWith(Role.CLIENT_USER);
    });
  });
});
