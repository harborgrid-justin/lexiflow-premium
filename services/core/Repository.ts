
import { BaseEntity, AuditLogEntry } from '../../types';
import { db, STORES } from '../db';
import { ChainService } from '../chainService';

/**
 * Abstract Base Repository
 * Implements standard CRUD, Audit Logging, and Timestamping.
 */
export abstract class Repository<T extends BaseEntity> {
    constructor(protected storeName: string) {}

    protected logAction = async (action: string, resourceId: string, details: string) => {
        const entry: Omit<AuditLogEntry, 'id'> = {
            timestamp: new Date().toISOString(),
            userId: 'current-user', 
            user: 'Current User',
            action: action,
            resource: `${this.storeName}/${resourceId}`,
            ip: '127.0.0.1'
        };
        
        // Fetch logs directly to avoid circular dep
        const logs = await db.getAll<AuditLogEntry>(STORES.LOGS || 'logs'); 
        const prevHash = logs.length > 0 && (logs[0] as any).hash ? (logs[0] as any).hash : '0000000000000000000000000000000000000000000000000000000000000000';
        
        // We calculate hash but don't strictly persist chain here to keep it simple, 
        // in real app this goes to a dedicated audit service.
        await ChainService.createEntry(entry, prevHash);
        console.log(`[AUDIT] ${action}: ${resourceId}`);
    }

    getAll = async (): Promise<T[]> => {
        const all = await db.getAll<T>(this.storeName);
        return all.filter(item => !item.deletedAt);
    }

    getById = async (id: string): Promise<T | undefined> => {
        const item = await db.get<T>(this.storeName, id);
        return item && !item.deletedAt ? item : undefined;
    }

    getByIndex = async (indexName: string, value: string): Promise<T[]> => {
        const items = await db.getByIndex<T>(this.storeName, indexName, value);
        return items.filter(item => !item.deletedAt);
    }

    add = async (item: T): Promise<T> => {
        const now = new Date().toISOString();
        const entity = {
            ...item,
            id: item.id || crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            version: 1,
            createdBy: 'current-user'
        };
        
        await db.put(this.storeName, entity);
        await this.logAction(`CREATE_${this.storeName.toUpperCase().slice(0, -1)}`, entity.id, 'Record Created');
        return entity;
    }

    update = async (id: string, updates: Partial<T>): Promise<T> => {
        const current = await this.getById(id);
        if (!current) throw new Error(`${this.storeName} record not found: ${id}`);

        const updated = {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString(),
            version: (current.version || 1) + 1,
            updatedBy: 'current-user'
        };

        await db.put(this.storeName, updated);
        await this.logAction(`UPDATE_${this.storeName.toUpperCase().slice(0, -1)}`, id, `Fields: ${Object.keys(updates).join(', ')}`);
        return updated;
    }

    delete = async (id: string): Promise<void> => {
        const current = await db.get<T>(this.storeName, id); // Use db.get to find item even if soft-deleted
        if (current && !current.deletedAt) {
            const deleted = { ...current, deletedAt: new Date().toISOString() };
            await db.put(this.storeName, deleted);
            await this.logAction(`DELETE_${this.storeName.toUpperCase().slice(0, -1)}`, id, 'Soft Delete');
        }
    }
}