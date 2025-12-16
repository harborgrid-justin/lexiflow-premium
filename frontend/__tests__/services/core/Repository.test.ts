/**
 * Repository.test.ts
 * Tests for the Repository base class with LRU caching
 */

import { Repository } from '@services/core/Repository';
import { MicroORM } from '@services/core/microORM';
import { BaseEntity } from '@/types';

// Mock the MicroORM
jest.mock('@services/core/microORM');
jest.mock('../../../utils/errorHandler', () => ({
  errorHandler: {
    logError: jest.fn(),
  },
}));

interface TestEntity extends BaseEntity {
  name: string;
  caseId?: string;
}

// Concrete implementation for testing
class TestRepository extends Repository<TestEntity> {
  constructor() {
    super('test_store');
  }
}

describe('Repository', () => {
  let repository: TestRepository;
  let mockOrm: jest.Mocked<MicroORM<TestEntity>>;

  const mockEntity: TestEntity = {
    id: 'test-1',
    name: 'Test Entity',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userId: 'user-1' as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock ORM
    mockOrm = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findBy: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
    } as any;

    (MicroORM as jest.Mock).mockImplementation(() => mockOrm);
    repository = new TestRepository();
  });

  describe('getAll', () => {
    it('should return all non-deleted entities', async () => {
      const entities = [
        { ...mockEntity, id: '1' },
        { ...mockEntity, id: '2', deletedAt: '2024-01-02T00:00:00Z' },
        { ...mockEntity, id: '3' },
      ];
      mockOrm.findAll.mockResolvedValue(entities);

      const result = await repository.getAll();

      expect(result).toHaveLength(2);
      expect(result.map(e => e.id)).toEqual(['1', '3']);
    });

    it('should include deleted entities when includeDeleted is true', async () => {
      const entities = [
        { ...mockEntity, id: '1' },
        { ...mockEntity, id: '2', deletedAt: '2024-01-02T00:00:00Z' },
      ];
      mockOrm.findAll.mockResolvedValue(entities);

      const result = await repository.getAll({ includeDeleted: true });

      expect(result).toHaveLength(2);
    });

    it('should respect limit option', async () => {
      const entities = Array.from({ length: 10 }, (_, i) => ({
        ...mockEntity,
        id: `entity-${i}`,
      }));
      mockOrm.findAll.mockResolvedValue(entities);

      const result = await repository.getAll({ limit: 5 });

      expect(result).toHaveLength(5);
    });
  });

  describe('getById', () => {
    it('should return entity from cache if available', async () => {
      mockOrm.findById.mockResolvedValue(mockEntity);

      // First call populates cache
      await repository.getById('test-1');
      // Second call should use cache
      const result = await repository.getById('test-1');

      expect(result).toEqual(mockEntity);
      // ORM should only be called once due to caching
      expect(mockOrm.findById).toHaveBeenCalledTimes(1);
    });

    it('should return undefined for deleted entities unless includeDeleted', async () => {
      const deletedEntity = { ...mockEntity, deletedAt: '2024-01-02T00:00:00Z' };
      mockOrm.findById.mockResolvedValue(deletedEntity);

      const result = await repository.getById('test-1');
      expect(result).toBeUndefined();

      const resultWithDeleted = await repository.getById('test-1', { includeDeleted: true });
      expect(resultWithDeleted).toEqual(deletedEntity);
    });

    it('should return undefined for non-existent entity', async () => {
      mockOrm.findById.mockResolvedValue(undefined);

      const result = await repository.getById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('getMany', () => {
    it('should return multiple entities by IDs', async () => {
      const entities = [
        { ...mockEntity, id: '1' },
        { ...mockEntity, id: '2' },
        { ...mockEntity, id: '3' },
      ];
      mockOrm.findAll.mockResolvedValue(entities);

      const result = await repository.getMany(['1', '2']);

      expect(result).toHaveLength(2);
    });

    it('should use cache for previously fetched entities', async () => {
      const entities = [
        { ...mockEntity, id: '1' },
        { ...mockEntity, id: '2' },
      ];
      mockOrm.findAll.mockResolvedValue(entities);
      mockOrm.findById.mockResolvedValue(entities[0]);

      // Fetch one entity to cache it
      await repository.getById('1');

      // Now fetch many including cached one
      const result = await repository.getMany(['1', '2']);

      expect(result).toHaveLength(2);
    });
  });

  describe('getByIndex', () => {
    it('should return entities matching index value', async () => {
      const entities = [
        { ...mockEntity, id: '1', caseId: 'case-1' },
        { ...mockEntity, id: '2', caseId: 'case-1' },
      ];
      mockOrm.findBy.mockResolvedValue(entities);

      const result = await repository.getByIndex('caseId', 'case-1');

      expect(result).toHaveLength(2);
      expect(mockOrm.findBy).toHaveBeenCalledWith('caseId', 'case-1');
    });

    it('should filter out deleted entities', async () => {
      const entities = [
        { ...mockEntity, id: '1', caseId: 'case-1' },
        { ...mockEntity, id: '2', caseId: 'case-1', deletedAt: '2024-01-02T00:00:00Z' },
      ];
      mockOrm.findBy.mockResolvedValue(entities);

      const result = await repository.getByIndex('caseId', 'case-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('add', () => {
    it('should create entity with generated ID and timestamps', async () => {
      mockOrm.save.mockImplementation(async (entity) => entity);

      const newEntity = { name: 'New Entity' } as TestEntity;
      const result = await repository.add(newEntity);

      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.version).toBe(1);
      expect(mockOrm.save).toHaveBeenCalled();
    });

    it('should use provided ID if available', async () => {
      mockOrm.save.mockImplementation(async (entity) => entity);

      const newEntity = { id: 'custom-id', name: 'New Entity' } as TestEntity;
      const result = await repository.add(newEntity);

      expect(result.id).toBe('custom-id');
    });

    it('should notify listeners on add', async () => {
      mockOrm.save.mockImplementation(async (entity) => entity);
      const listener = jest.fn();
      repository.subscribe(listener);

      await repository.add({ name: 'New Entity' } as TestEntity);

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update entity and increment version', async () => {
      const existingEntity = { ...mockEntity, version: 1 };
      mockOrm.findById.mockResolvedValue(existingEntity);
      mockOrm.save.mockImplementation(async (entity) => entity);

      const result = await repository.update('test-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(result.version).toBe(2);
      expect(result.updatedAt).not.toBe(existingEntity.updatedAt);
    });

    it('should throw error for non-existent entity', async () => {
      mockOrm.findById.mockResolvedValue(undefined);

      await expect(repository.update('non-existent', { name: 'Test' }))
        .rejects.toThrow('record not found');
    });

    it('should throw error on version conflict', async () => {
      const existingEntity = { ...mockEntity, version: 2 };
      mockOrm.findById.mockResolvedValue(existingEntity);

      await expect(repository.update('test-1', { name: 'Test', version: 1 } as any))
        .rejects.toThrow('Conflict');
    });
  });

  describe('delete', () => {
    it('should soft delete entity by setting deletedAt', async () => {
      mockOrm.findById.mockResolvedValue(mockEntity);
      mockOrm.save.mockImplementation(async (entity) => entity);

      await repository.delete('test-1');

      expect(mockOrm.save).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: expect.any(String) })
      );
    });

    it('should not delete already deleted entity', async () => {
      const deletedEntity = { ...mockEntity, deletedAt: '2024-01-02T00:00:00Z' };
      mockOrm.findById.mockResolvedValue(deletedEntity);

      await repository.delete('test-1');

      expect(mockOrm.save).not.toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    it('should create multiple entities', async () => {
      mockOrm.save.mockImplementation(async (entity) => entity);

      const entities = [
        { name: 'Entity 1' } as TestEntity,
        { name: 'Entity 2' } as TestEntity,
      ];

      const result = await repository.createMany(entities);

      expect(result).toHaveLength(2);
      expect(mockOrm.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateMany', () => {
    it('should update multiple entities', async () => {
      mockOrm.findById.mockResolvedValue({ ...mockEntity, version: 1 });
      mockOrm.save.mockImplementation(async (entity) => entity);

      const updates = [
        { id: '1', data: { name: 'Updated 1' } },
        { id: '2', data: { name: 'Updated 2' } },
      ];

      const result = await repository.updateMany(updates);

      expect(result).toHaveLength(2);
    });
  });

  describe('subscribe', () => {
    it('should add and remove listeners', async () => {
      const listener = jest.fn();
      const unsubscribe = repository.subscribe(listener);

      mockOrm.save.mockImplementation(async (entity) => entity);
      await repository.add({ name: 'Test' } as TestEntity);

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      await repository.add({ name: 'Test 2' } as TestEntity);

      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });
});
