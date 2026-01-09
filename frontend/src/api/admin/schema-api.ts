import { apiClient } from '@/services/infrastructure/apiClient';

export interface Migration {
    id: string;
    date: string;
    author: string;
    status: 'Applied' | 'Failed' | 'Pending';
    desc: string;
}

export class SchemaApiService {
    private readonly baseUrl = '/admin/schema';

    async getMigrations(): Promise<Migration[]> {
        try {
            const response = await apiClient.get<Migration[]>(
                `${this.baseUrl}/migrations`
            );
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('[SchemaApiService] Failed to fetch migrations:', error);
            return [];
        }
    }
}
