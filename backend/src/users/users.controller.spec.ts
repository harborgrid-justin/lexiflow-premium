import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '../common/enums/role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 'user-001',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.ASSOCIATE,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-001');

      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith('user-001');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createDto = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'password123',
        role: Role.ASSOCIATE,
      };
      mockUsersService.create.mockResolvedValue({ ...mockUser, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('email', createDto.email);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { firstName: 'Johnny' };
      mockUsersService.update.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await controller.update('user-001', updateDto);

      expect(result.firstName).toBe('Johnny');
      expect(service.update).toHaveBeenCalledWith('user-001', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('user-001');

      expect(service.remove).toHaveBeenCalledWith('user-001');
    });
  });
});
