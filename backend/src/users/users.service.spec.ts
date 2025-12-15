import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { Role } from '../common/enums/role.enum';
import { expect, jest } from '@jest/globals';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue('hashedPassword');
    (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const result = await service.findAll();

      // Should include the default admin user created in constructor
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).not.toHaveProperty('password'); // Password should be excluded
    });

    it('should return users without password field', async () => {
      const result = await service.findAll();

      result.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      // First create a user to find
      const createDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.CLIENT_USER,
      };
      const created = await service.create(createDto);

      const result = await service.findById(created.id);

      expect(result).toBeDefined();
      expect(result?.email).toBe(createDto.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      const result = await service.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      // Find the default admin
      const result = await service.findByEmail('admin@lexiflow.com');

      expect(result).toBeDefined();
      expect(result.email).toBe('admin@lexiflow.com');
    });

    it('should return null if user not found', async () => {
      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createUserDto = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
      role: Role.CLIENT_USER,
      isActive: true,
      mfaEnabled: false,
    };

    it('should create a new user with hashed password', async () => {
      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(result).toHaveProperty('email', createUserDto.email);
      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if email already exists', async () => {
      await service.create(createUserDto);

      await expect(
        service.create(createUserDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update a user', async () => {
      const createDto = {
        email: 'update-test@example.com',
        password: 'password123',
        firstName: 'Original',
        lastName: 'Name',
        role: Role.CLIENT_USER,
      };
      const created = await service.create(createDto);

      const result = await service.update(created.id, updateUserDto);

      expect(result).toHaveProperty('firstName', updateUserDto.firstName);
      expect(result).toHaveProperty('lastName', updateUserDto.lastName);
    });

    it('should throw NotFoundException if user not found', async () => {
      await expect(
        service.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updating to existing email', async () => {
      const user1 = await service.create({
        email: 'user1@example.com',
        password: 'pass',
        firstName: 'User',
        lastName: 'One',
        role: Role.CLIENT_USER,
      });

      await service.create({
        email: 'user2@example.com',
        password: 'pass',
        firstName: 'User',
        lastName: 'Two',
        role: Role.CLIENT_USER,
      });

      await expect(
        service.update(user1.id, { email: 'user2@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const created = await service.create({
        email: 'password-test@example.com',
        password: 'oldPassword',
        firstName: 'Test',
        lastName: 'User',
        role: Role.CLIENT_USER,
      });

      await service.updatePassword(created.id, 'newPassword');

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 12);
    });

    it('should throw NotFoundException if user not found', async () => {
      await expect(
        service.updatePassword('non-existent-id', 'newPassword'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const created = await service.create({
        email: 'delete-test@example.com',
        password: 'password',
        firstName: 'Delete',
        lastName: 'Me',
        role: Role.CLIENT_USER,
      });

      await service.remove(created.id);

      const found = await service.findById(created.id);
      expect(found).toBeNull();
    });

    it('should throw NotFoundException if user not found', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setMfaEnabled', () => {
    it('should enable MFA for user', async () => {
      const created = await service.create({
        email: 'mfa-test@example.com',
        password: 'password',
        firstName: 'MFA',
        lastName: 'User',
        role: Role.CLIENT_USER,
      });

      const result = await service.setMfaEnabled(created.id, true);

      expect(result.mfaEnabled).toBe(true);
    });

    it('should disable MFA for user', async () => {
      const created = await service.create({
        email: 'mfa-test2@example.com',
        password: 'password',
        firstName: 'MFA',
        lastName: 'User',
        role: Role.CLIENT_USER,
        mfaEnabled: true,
      });

      const result = await service.setMfaEnabled(created.id, false);

      expect(result.mfaEnabled).toBe(false);
    });

    it('should throw NotFoundException if user not found', async () => {
      await expect(
        service.setMfaEnabled('non-existent-id', true),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setActive', () => {
    it('should activate user', async () => {
      const created = await service.create({
        email: 'active-test@example.com',
        password: 'password',
        firstName: 'Active',
        lastName: 'User',
        role: Role.CLIENT_USER,
        isActive: false,
      });

      const result = await service.setActive(created.id, true);

      expect(result.isActive).toBe(true);
    });

    it('should deactivate user', async () => {
      const created = await service.create({
        email: 'active-test2@example.com',
        password: 'password',
        firstName: 'Active',
        lastName: 'User',
        role: Role.CLIENT_USER,
      });

      const result = await service.setActive(created.id, false);

      expect(result.isActive).toBe(false);
    });
  });

  describe('findByRole', () => {
    it('should return users by role', async () => {
      await service.create({
        email: 'role-test@example.com',
        password: 'password',
        firstName: 'Role',
        lastName: 'User',
        role: Role.CLIENT_USER,
      });

      const result = await service.findByRole(Role.CLIENT_USER);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(u => u.role === Role.CLIENT_USER)).toBe(true);
    });
  });
});
