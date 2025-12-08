
import { BaseEntity, AuditLogEntry, UUID, UserId } from '../../types';
import { db, STORES } from '../db';
import { ChainService } from '../chainService';

// Simple LRU Cache Implementation
class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, T>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: string): T | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Simple Observer Pattern
type Listener<T> = (item: T) => void;

/**
 * Abstract Base Repository
 * Implements standard CRUD, Audit Logging, Timestamping, LRU Caching, Soft Deletes, and Optimistic Concurrency.
 */
export abstract class Repository<T extends BaseEntity> {
    private cache: LRUCache<T>;
    private listeners: Set<Listener<T>> = new Set();

    constructor(protected storeName: string) {
        this.cache = new LRUCache<T>(100); // Cache last 100 items

        // Bind methods to ensure 'this' context is preserved when passed as callbacks
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.getByIndex = this.getByIndex.bind(this);
        this.add = this.add.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.createMany = this.createMany.bind(this);
        this.updateMany = this.updateMany.bind(this);
    }

    // Subscribe to changes in this repository
    subscribe(listener: Listener<T>) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    protected notify(item: T) {
        this.listeners.forEach(l => l(item));
    }

    protected logAction = async (action: string, resourceId: string, details: string, previousValue?: any, newValue?: any) => {
        const entry: Omit<AuditLogEntry, 'id'> = {
            timestamp: new Date().toISOString(),
            // FIX: Cast string to branded type UserId
            userId: 'current-user' as UserId, 
            user: 'Current User',
            action: action,
            resource: `${this.storeName}/${resourceId}`,
            ip: '127.0.0.1',
            previousValue,
            newValue
        };
        
        const logs = await db.getAll<AuditLogEntry>(STORES.LOGS || 'logs'); 
        const prevHash = logs.length > 0 && (logs[0] as any).hash ? (logs[0] as any).hash : '0000000000000000000000000000000000000000000000000000000000000000';
        
        await ChainService.createEntry(entry, prevHash);
        console.log(`[AUDIT] ${action}: ${resourceId}`);
    }

    async getAll(options: { includeDeleted?: boolean, limit?: number, cursor?: string } = {}): Promise<T[]> {
        const all = await db.getAll<T>(this.storeName);
        let result = options.includeDeleted ? all : all.filter(item => !item.deletedAt);
        
        // Simple client-side pagination simulation (real DBs would do this in query)
        if (options.limit) {
            result = result.slice(0, options.limit);
        }
        return result;
    }

    async getById(id: string, options: { includeDeleted?: boolean } = {}): Promise<T | undefined> {
        // Try Cache
        const cached = this.cache.get(id);
        if (cached && (options.includeDeleted || !cached.deletedAt)) return cached;

        // Try DB
        const item = await db.get<T>(this.storeName, id);
        if (item) {
             if (options.includeDeleted || !item.deletedAt) {
                 this.cache.put(id, item);
                 return item;
             }
        }
        return undefined;
    }

    async getByIndex(indexName: string, value: string): Promise<T[]> {
        const items = await db.getByIndex<T>(this.storeName, indexName, value);
        return items.filter(item => !item.deletedAt);
    }

    async add(item: T): Promise<T> {
        const now = new Date().toISOString();
        const entity = {
            ...item,
            id: item.id || crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            version: 1,
            createdBy: 'current-user' as any
        };
        
        await db.put(this.storeName, entity);
        this.cache.put(entity.id, entity);
        this.notify(entity);
        await this.logAction(`CREATE_${this.storeName.toUpperCase().slice(0, -1)}`, entity.id, 'Record Created', null, entity);
        return entity;
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

        // Optimistic Concurrency Check
        if (updates.version && updates.version !== current.version) {
            throw new Error("Conflict: Record has been modified by another process.");
        }

        const updated = {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString(),
            version: (current.version || 1) + 1,
            updatedBy: 'current-user' as any
        };

        await db.put(this.storeName, updated);
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
            await db.put(this.storeName, deleted);
            this.cache.delete(id); // Remove from cache or update to deleted
            this.notify(deleted);
            await this.logAction(`DELETE_${this.storeName.toUpperCase().slice(0, -1)}`, id, 'Soft Delete', current, deleted);
        }
    }
}
