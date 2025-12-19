
import { db } from '../data/db';
import { BaseEntity } from '../../types';

// A very simple MicroORM for abstracting direct DB calls
export class MicroORM<T extends BaseEntity> {
    constructor(private storeName: string) {}

    async findById(id: string): Promise<T | undefined> {
        return db.get<T>(this.storeName, id);
    }

    async findAll(): Promise<T[]> {
        return db.getAll<T>(this.storeName);
    }

    async findBy(indexName: string, value: string): Promise<T[]> {
        return db.getByIndex<T>(this.storeName, indexName, value);
    }

    async save(entity: T): Promise<T> {
        await db.put<T>(this.storeName, entity);
        return entity;
    }

    async remove(id: string): Promise<void> {
        await db.delete(this.storeName, id);
    }

    async count(): Promise<number> {
        return db.count(this.storeName);
    }
}
