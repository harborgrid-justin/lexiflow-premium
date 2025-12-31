import { REPOSITORY_CACHE_MAX_SIZE } from '@/config/database/cache.config';
import { queryClient } from '@/services/infrastructure/queryClient';
import { BaseEntity, UserId } from '@/types';
import { errorHandler } from '@/utils/errorHandler';
import { LRUCache } from '@/utils/LRUCache';
import { MicroORM } from './microORM';

type Listener<T> = (item: T) => void;

const MAX_LISTENERS_PER_REPO = 1000; // Safety limit to prevent runaway listener accumulation

export abstract class Repository<T extends BaseEntity> {
    private cache: LRUCache<T>;
    private listeners: Set<Listener<T>> = new Set();
    protected orm: MicroORM<T>;
    private listenerWarningLogged = false;

    protected constructor(protected storeName: string) {
        this.cache = new LRUCache<T>(REPOSITORY_CACHE_MAX_SIZE);
        this.orm = new MicroORM<T>(storeName);

        // Bind all methods to ensure correct 'this' context when passed as callbacks
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.getByIndex = this.getByIndex.bind(this);
        this.getMany = this.getMany.bind(this);
        this.getByCaseId = this.getByCaseId.bind(this);
        this.add = this.add.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.createMany = this.createMany.bind(this);
        this.updateMany = this.updateMany.bind(this);
    }

    /**
     * Safety wrapper for DB operations.
     */
    protected async safeExecute<R>(operation: () => Promise<R>, operationName: string): Promise<R> {
        try {
            return await operation();
        } catch (error) {
            errorHandler.logError(error instanceof Error ? error : new Error(String(error)), `Repository:${this.storeName}.${operationName}`);
            throw new Error(`Database Error (${operationName}): ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    subscribe(listener: Listener<T>) {
        this.listeners.add(listener);

        // Safety check: warn if listeners are accumulating
        if (this.listeners.size > MAX_LISTENERS_PER_REPO && !this.listenerWarningLogged) {
            console.warn(`[Repository:${this.storeName}] Listener count exceeded ${MAX_LISTENERS_PER_REPO}. Possible memory leak - ensure components unsubscribe on unmount.`);
            this.listenerWarningLogged = true;
        }

        return () => this.removeListener(listener);
    }

    removeListener(listener: Listener<T>) {
        this.listeners.delete(listener);
    }

    clearAllListeners() {
        const count = this.listeners.size;
        this.listeners.clear();
        this.listenerWarningLogged = false;
        if (count > 0) {
            console.log(`[Repository:${this.storeName}] Cleared ${count} listeners`);
        }
    }

    getListenerCount(): number {
        return this.listeners.size;
    }

    /**
     * Clear the LRU cache for this repository.
     * Useful for freeing memory when cache gets too large.
     */
    clearCache(): void {
        const size = this.cache.size();
        this.cache.clear();
        if (size > 0) {
            console.log(`[Repository:${this.storeName}] Cleared cache (${size} items)`);
        }
    }

    /**
     * Get cache statistics for monitoring memory usage.
     */
    getCacheStats(): { size: number; maxSize: number; hitRate: string } {
        return {
            size: this.cache.size(),
            maxSize: REPOSITORY_CACHE_MAX_SIZE,
            hitRate: '0%', // LRUCache doesn't track hits yet
        };
    }

    protected notify(item: T) {
        this.listeners.forEach(l => {
            try {
                l(item);
            } catch (error) {
                console.error(`[Repository:${this.storeName}] Error in listener:`, error);
            }
        });
    }

    protected logAction = async (
        _action: string,
        _id: string,
        _description: string,
        _before: unknown,
        _after: unknown
    ) => {
        // Log action logic here if needed
    }

    async getAll(options: { includeDeleted?: boolean, limit?: number, cursor?: string } = {}): Promise<T[]> {
        return this.safeExecute(async () => {
            const all = await this.orm.findAll();
            let result = options.includeDeleted ? all : all.filter(item => !item.deletedAt);
            if (options.limit) result = result.slice(0, options.limit);
            return result;
        }, 'getAll');
    }

    async getById(id: string, options: { includeDeleted?: boolean } = {}): Promise<T | undefined> {
        return this.safeExecute(async () => {
            const cached = this.cache.get(id);
            if (cached && (options.includeDeleted || !cached.deletedAt)) return cached;

            const item = await this.orm.findById(id);
            if (item && (options.includeDeleted || !item.deletedAt)) {
                this.cache.put(id, item);
                return item;
            }
            return undefined;
        }, 'getById');
    }

    async getMany(ids: string[]): Promise<T[]> {
        return this.safeExecute(async () => {
            const results: T[] = [];
            const missingIds: string[] = [];

            ids.forEach(id => {
                const cached = this.cache.get(id);
                if (cached && !cached.deletedAt) {
                    results.push(cached);
                } else {
                    missingIds.push(id);
                }
            });

            if (missingIds.length === 0) return results;

            const allItems = await this.orm.findAll();
            const fetched = allItems.filter(item => missingIds.includes(item.id) && !item.deletedAt);

            fetched.forEach(item => {
                this.cache.put(item.id, item);
                results.push(item);
            });

            return results;
        }, 'getMany');
    }

    async getByIndex(indexName: string, value: string): Promise<T[]> {
        return this.safeExecute(async () => {
            const items = await this.orm.findBy(indexName, value);
            return items.filter(item => !item.deletedAt);
        }, 'getByIndex');
    }

    /**
     * Get all items for a specific case.
     * This is a common pattern across many repositories, so we provide it in the base class.
     * Override this method if custom logic is needed.
     */
    async getByCaseId(caseId: string): Promise<T[]> {
        return this.getByIndex('caseId', caseId);
    }

    async add(item: T): Promise<T> {
        return this.safeExecute(async () => {
            const now = new Date().toISOString();
            const entity = {
                ...item,
                id: item.id || crypto.randomUUID(),
                createdAt: now,
                updatedAt: now,
                version: 1,
                createdBy: 'current-user' as UserId
            };

            await this.orm.save(entity as T);
            this.cache.put(entity.id, entity as T);
            this.notify(entity as T);
            await this.logAction(`CREATE_${this.storeName.toUpperCase().slice(0, -1)}`, entity.id, 'Record Created', null, entity);

            // Automatically invalidate React Query cache
            queryClient.invalidate([this.storeName, 'all']);
            queryClient.invalidate([this.storeName]);

            return entity as T;
        }, 'add');
    }

    async createMany(items: T[]): Promise<T[]> {
        return this.safeExecute(async () => {
            const createdItems: T[] = [];
            for (const item of items) {
                createdItems.push(await this.add(item));
            }
            return createdItems;
        }, 'createMany');
    }

    async update(id: string, updates: Partial<T>): Promise<T> {
        return this.safeExecute(async () => {
            const current = await this.getById(id, { includeDeleted: true });
            if (!current) throw new Error(`${this.storeName} record not found: ${id}`);

            if (updates.version && updates.version !== current.version) {
                throw new Error("Conflict: Record has been modified by another process.");
            }

            const updated = {
                ...current, ...updates,
                updatedAt: new Date().toISOString(),
                version: (current.version || 1) + 1,
                updatedBy: 'current-user' as UserId
            };

            await this.orm.save(updated);
            this.cache.put(id, updated);
            this.notify(updated);
            await this.logAction(`UPDATE_${this.storeName.toUpperCase().slice(0, -1)}`, id, `Fields: ${Object.keys(updates).join(', ')}`, current, updated);

            // Automatically invalidate React Query cache
            queryClient.invalidate([this.storeName, 'all']);
            queryClient.invalidate([this.storeName, 'detail', id]);
            queryClient.invalidate([this.storeName]);

            return updated;
        }, 'update');
    }

    async updateMany(updates: { id: string, data: Partial<T> }[]): Promise<T[]> {
        return this.safeExecute(async () => {
            const updatedItems: T[] = [];
            for (const update of updates) {
                updatedItems.push(await this.update(update.id, update.data));
            }
            return updatedItems;
        }, 'updateMany');
    }

    async delete(id: string): Promise<void> {
        return this.safeExecute(async () => {
            const current = await this.getById(id, { includeDeleted: true });
            if (current && !current.deletedAt) {
                const deleted = { ...current, deletedAt: new Date().toISOString() };
                await this.orm.save(deleted);
                this.cache.delete(id);
                this.notify(deleted);
                await this.logAction(`DELETE_${this.storeName.toUpperCase().slice(0, -1)}`, id, 'Soft Delete', current, deleted);

                // Automatically invalidate React Query cache
                queryClient.invalidate([this.storeName, 'all']);
                queryClient.invalidate([this.storeName, 'detail', id]);
                queryClient.invalidate([this.storeName]);
            }
        }, 'delete');
    }
}
