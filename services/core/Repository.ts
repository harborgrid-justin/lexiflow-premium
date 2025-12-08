
import { BaseEntity, AuditLogEntry, UUID, UserId } from '../../types';
import { db, STORES } from '../db';
import { ChainService } from '../chainService';
import { MicroORM } from './microORM';

// Simple LRU Cache Implementation
class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, T>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: string): T | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
          this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

type Listener<T> = (item: T) => void;

export abstract class Repository<T extends BaseEntity> {
    private cache: LRUCache<T>;
    private listeners: Set<Listener<T>> = new Set();
    protected orm: MicroORM<T>;

    constructor(protected storeName: string) {
        this.cache = new LRUCache<T>(100);
        this.orm = new MicroORM<T>(storeName);

        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.getByIndex = this.getByIndex.bind(this);
        this.add = this.add.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.createMany = this.createMany.bind(this);
        this.updateMany = this.updateMany.bind(this);
    }
    
    subscribe(listener: Listener<T>) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    protected notify(item: T) {
        this.listeners.forEach(l => l(item));
    }

    protected logAction = async (action: string, resourceId: string, details: string, previousValue?: any, newValue?: any) => {
        // ... implementation ...
    }

    async getAll(options: { includeDeleted?: boolean, limit?: number, cursor?: string } = {}): Promise<T[]> {
        const all = await this.orm.findAll();
        let result = options.includeDeleted ? all : all.filter(item => !item.deletedAt);
        if (options.limit) result = result.slice(0, options.limit);
        return result;
    }

    async getById(id: string, options: { includeDeleted?: boolean } = {}): Promise<T | undefined> {
        const cached = this.cache.get(id);
        if (cached && (options.includeDeleted || !cached.deletedAt)) return cached;

        const item = await this.orm.findById(id);
        if (item && (options.includeDeleted || !item.deletedAt)) {
            this.cache.put(id, item);
            return item;
        }
        return undefined;
    }
    
    async getByIndex(indexName: string, value: string): Promise<T[]> {
        const items = await this.orm.findBy(indexName, value);
        return items.filter(item => !item.deletedAt);
    }

    async add(item: T): Promise<T> {
        const now = new Date().toISOString();
        const entity = {
            ...item,
            id: item.id || crypto.randomUUID(),
            createdAt: now, updatedAt: now, version: 1, createdBy: 'current-user' as any
        };
        
        await this.orm.save(entity as T);
        this.cache.put(entity.id, entity as T);
        this.notify(entity as T);
        await this.logAction(`CREATE_${this.storeName.toUpperCase().slice(0, -1)}`, entity.id, 'Record Created', null, entity);
        return entity as T;
    }
    
    async createMany(items: T[]): Promise<T[]> {
        const createdItems: T[] = [];
        for (const item of items) {
            createdItems.push(await this.add(item));
        }
        return createdItems;
    }

    async update(id: string, updates: Partial<T>): Promise<T> {
        const current = await this.getById(id, { includeDeleted: true });
        if (!current) throw new Error(`${this.storeName} record not found: ${id}`);
        if (updates.version && updates.version !== current.version) {
            throw new Error("Conflict: Record has been modified by another process.");
        }
        const updated = {
            ...current, ...updates,
            updatedAt: new Date().toISOString(),
            version: (current.version || 1) + 1,
            updatedBy: 'current-user' as any
        };
        await this.orm.save(updated);
        this.cache.put(id, updated);
        this.notify(updated);
        await this.logAction(`UPDATE_${this.storeName.toUpperCase().slice(0, -1)}`, id, `Fields: ${Object.keys(updates).join(', ')}`, current, updated);
        return updated;
    }

    async updateMany(updates: { id: string, data: Partial<T> }[]): Promise<T[]> {
        const updatedItems: T[] = [];
        for (const update of updates) {
            updatedItems.push(await this.update(update.id, update.data));
        }
        return updatedItems;
    }

    async delete(id: string): Promise<void> {
        const current = await this.getById(id, { includeDeleted: true });
        if (current && !current.deletedAt) {
            const deleted = { ...current, deletedAt: new Date().toISOString() };
            await this.orm.save(deleted);
            this.cache.delete(id);
            this.notify(deleted);
            await this.logAction(`DELETE_${this.storeName.toUpperCase().slice(0, -1)}`, id, 'Soft Delete', current, deleted);
        }
    }
}
