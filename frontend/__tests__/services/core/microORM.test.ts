/**
 * microORM.test.ts
 * Tests for the MicroORM IndexedDB abstraction layer
 */

import { MicroORM } from '@services/core/microORM';
import { db } from '@services/data/db';
import { BaseEntity } from '@/types';

// Mock the db module
jest.mock('@services/data/db', () => ({
  db: {
    get: jest.fn(),
    getAll: jest.fn(),
    getByIndex: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
}));

interface TestEntity extends BaseEntity {
  name: string;
  status?: string;
}

describe('MicroORM', () => {
  let orm: MicroORM<TestEntity>;
  const storeName = 'test_entities';
  const mockDb = db as jest.Mocked<typeof db>;

  const mockEntity: TestEntity = {
    id: 'entity-1',
    name: 'Test Entity',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userId: 'user-1' as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    orm = new MicroORM<TestEntity>(storeName);
  });

  describe('findById', () => {
    it('should call db.get with correct parameters', async () => {
      mockDb.get.mockResolvedValue(mockEntity);

      const result = await orm.findById('entity-1');

      expect(mockDb.get).toHaveBeenCalledWith(storeName, 'entity-1');
      expect(result).toEqual(mockEntity);
    });

    it('should return undefined for non-existent entity', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await orm.findById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all entities from store', async () => {
      const entities = [
        { ...mockEntity, id: '1' },
        { ...mockEntity, id: '2' },
        { ...mockEntity, id: '3' },
      ];
      mockDb.getAll.mockResolvedValue(entities);

      const result = await orm.findAll();

      expect(mockDb.getAll).toHaveBeenCalledWith(storeName);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when store is empty', async () => {
      mockDb.getAll.mockResolvedValue([]);

      const result = await orm.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findBy', () => {
    it('should find entities by index', async () => {
      const entities = [
        { ...mockEntity, id: '1', status: 'active' },
        { ...mockEntity, id: '2', status: 'active' },
      ];
      mockDb.getByIndex.mockResolvedValue(entities);

      const result = await orm.findBy('status', 'active');

      expect(mockDb.getByIndex).toHaveBeenCalledWith(storeName, 'status', 'active');
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no matches found', async () => {
      mockDb.getByIndex.mockResolvedValue([]);

      const result = await orm.findBy('status', 'inactive');

      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('should persist entity and return it', async () => {
      mockDb.put.mockResolvedValue(undefined);

      const result = await orm.save(mockEntity);

      expect(mockDb.put).toHaveBeenCalledWith(storeName, mockEntity);
      expect(result).toEqual(mockEntity);
    });

    it('should handle save errors', async () => {
      mockDb.put.mockRejectedValue(new Error('Database error'));

      await expect(orm.save(mockEntity)).rejects.toThrow('Database error');
    });
  });

  describe('remove', () => {
    it('should delete entity by id', async () => {
      mockDb.delete.mockResolvedValue(undefined);

      await orm.remove('entity-1');

      expect(mockDb.delete).toHaveBeenCalledWith(storeName, 'entity-1');
    });

    it('should handle delete errors', async () => {
      mockDb.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(orm.remove('entity-1')).rejects.toThrow('Delete failed');
    });
  });

  describe('count', () => {
    it('should return the count of entities', async () => {
      mockDb.count.mockResolvedValue(42);

      const result = await orm.count();

      expect(mockDb.count).toHaveBeenCalledWith(storeName);
      expect(result).toBe(42);
    });

    it('should return 0 for empty store', async () => {
      mockDb.count.mockResolvedValue(0);

      const result = await orm.count();

      expect(result).toBe(0);
    });
  });
});
