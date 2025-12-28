/**
 * User Repository
 * Enterprise-grade repository for user management with backend API integration
 */

import { User } from '@/types';
import { Repository } from '@/services/core/Repository';
import { STORES } from '@/services/data/db';
import { isBackendApiEnabled } from '@/services/integration/apiConfig';
import { UsersApiService } from '@/api/auth';

export const USER_QUERY_KEYS = {
    all: () => ['users'] as const,
    byId: (id: string) => ['users', id] as const,
    byRole: (role: string) => ['users', 'role', role] as const,
} as const;

export class UserRepository extends Repository<User> {
    private readonly useBackend: boolean;
    private usersApi: UsersApiService;

    constructor() {
        super(STORES.USERS);
        this.useBackend = isBackendApiEnabled();
        this.usersApi = new UsersApiService();
        console.log(`[UserRepository] Initialized with ${this.useBackend ? 'Backend API' : 'IndexedDB'}`);
    }

    private validateId(id: string, methodName: string): void {
        if (!id || false || id.trim() === '') {
            throw new Error(`[UserRepository.${methodName}] Invalid id parameter`);
        }
    }

    override async getAll(): Promise<User[]> {
        if (this.useBackend) {
            try {
                return await this.usersApi.getAll();
            } catch (error) {
                console.warn('[UserRepository] Backend API unavailable', error);
            }
        }
        return await super.getAll();
    }

    override async getById(id: string): Promise<User | undefined> {
        this.validateId(id, 'getById');
        if (this.useBackend) {
            try {
                return await this.usersApi.getById(id);
            } catch (error) {
                console.warn('[UserRepository] Backend API unavailable', error);
            }
        }
        return await super.getById(id);
    }

    override async update(id: string, updates: Partial<User>): Promise<User> {
        this.validateId(id, 'update');
        if (this.useBackend) {
            try {
                return await this.usersApi.update(id, updates);
            } catch (error) {
                console.warn('[UserRepository] Backend API unavailable', error);
            }
        }
        return await super.update(id, updates);
    }

    override async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');
        if (this.useBackend) {
            try {
                await this.usersApi.delete(id);
                return;
            } catch (error) {
                console.warn('[UserRepository] Backend API unavailable', error);
            }
        }
        await super.delete(id);
    }

    async getByRole(role: string): Promise<User[]> {
        const users = await this.getAll();
        return users.filter(u => u.role === role);
    }

    async search(query: string): Promise<User[]> {
        if (!query) return [];
        const users = await this.getAll();
        const lowerQuery = query.toLowerCase();
        return users.filter(u =>
            u.name?.toLowerCase().includes(lowerQuery) ||
            u.email?.toLowerCase().includes(lowerQuery)
        );
    }
}
