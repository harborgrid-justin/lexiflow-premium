// services/repositories/MatterRepository.ts
import { Repository } from '../../core/Repository';
import { STORES } from '../db';
import { Matter, MatterId } from '../../../types';
import { mattersApi } from '../../../api';
import { isBackendApiEnabled } from '../../../api';

export class MatterRepository extends Repository<Matter> {
  private useBackend: boolean;

  constructor() {
    super(STORES.MATTERS);
    this.useBackend = isBackendApiEnabled();
  }

  /**
   * Override getAll to use backend API when available
   */
  async getAll(): Promise<Matter[]> {
    if (this.useBackend) {
      try {
        return await mattersApi.getAll();
      } catch (error) {
        console.warn('[MatterRepository] Backend API unavailable, falling back to IndexedDB', error);
        return super.getAll();
      }
    }
    return super.getAll();
  }

  /**
   * Override getById to use backend API when available
   */
  async getById(id: MatterId): Promise<Matter | undefined> {
    if (this.useBackend) {
      try {
        return await mattersApi.getById(id);
      } catch (error) {
        console.warn('[MatterRepository] Backend API unavailable, falling back to IndexedDB', error);
        return super.getById(id);
      }
    }
    return super.getById(id);
  }

  /**
   * Override add to use backend API when available
   */
  async add(matter: Matter): Promise<Matter> {
    if (this.useBackend) {
      try {
        return await mattersApi.create(matter);
      } catch (error) {
        console.warn('[MatterRepository] Backend API unavailable, falling back to IndexedDB', error);
        return super.add(matter);
      }
    }
    return super.add(matter);
  }

  /**
   * Override update to use backend API when available
   */
  async update(id: MatterId, updates: Partial<Matter>): Promise<Matter> {
    if (this.useBackend) {
      try {
        return await mattersApi.update(id, updates);
      } catch (error) {
        console.warn('[MatterRepository] Backend API unavailable, falling back to IndexedDB', error);
        return super.update(id, updates);
      }
    }
    return super.update(id, updates);
  }

  /**
   * Override delete to use backend API when available
   */
  async delete(id: MatterId): Promise<void> {
    if (this.useBackend) {
      try {
        await mattersApi.delete(id);
        return;
      } catch (error) {
        console.warn('[MatterRepository] Backend API unavailable, falling back to IndexedDB', error);
        return super.delete(id);
      }
    }
    return super.delete(id);
  }

  /**
   * Get matters by status
   */
  async getByStatus(status: string): Promise<Matter[]> {
    if (this.useBackend) {
      try {
        return await mattersApi.getByStatus(status);
      } catch (error) {
        console.warn('[MatterRepository] Backend API unavailable, falling back to IndexedDB', error);
      }
    }
    return this.getByIndex('status', status);
  }

  /**
   * Get matters by client ID
   */
  async getByClientId(clientId: string): Promise<Matter[]> {
    if (this.useBackend) {
      try {
        return await mattersApi.getByClient(clientId);
      } catch (error) {
        console.warn('[MatterRepository] Backend API unavailable, falling back to IndexedDB', error);
      }
    }
    const allMatters = await this.getAll();
    return allMatters.filter(matter => matter.clientId === clientId);
  }

  /**
   * Get matters by lead attorney ID
   */
  async getByLeadAttorney(leadAttorneyId: string): Promise<Matter[]> {
    if (this.useBackend) {
      try {
        return await mattersApi.getByAttorney(leadAttorneyId);
      } catch (error) {
        console.warn('[MatterRepository] Backend API unavailable, falling back to IndexedDB', error);
      }
    }
    const allMatters = await this.getAll();
    return allMatters.filter(matter => matter.responsibleAttorneyId === leadAttorneyId);
  }

  /**
   * Get matters by matter type
   */
  async getByMatterType(matterType: string): Promise<Matter[]> {
    const allMatters = await this.getAll();
    return allMatters.filter(matter => matter.type === matterType);
  }

  /**
   * Search matters by title, matter number, or client name
   */
  async search(query: string): Promise<Matter[]> {
    if (this.useBackend) {
      try {
        return await mattersApi.search(query);
      } catch (error) {
        console.warn('[MatterRepository] Backend API unavailable, falling back to IndexedDB', error);
      }
    }
    const allMatters = await this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return allMatters.filter(matter => 
      matter.title.toLowerCase().includes(lowerQuery) ||
      matter.matterNumber.toLowerCase().includes(lowerQuery) ||
      matter.clientName.toLowerCase().includes(lowerQuery) ||
      matter.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get active matters (not archived, not closed)
   */
  async getActive(): Promise<Matter[]> {
    const allMatters = await this.getAll();
    return allMatters.filter(matter => 
      !matter.isArchived && 
      matter.status !== 'closed'
    );
  }

  /**
   * Get matters in intake
   */
  async getIntake(): Promise<Matter[]> {
    return this.getByStatus('intake');
  }

  /**
   * Get matter statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byMatterType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const allMatters = await this.getAll();
    
    const byStatus: Record<string, number> = {};
    const byMatterType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    
    allMatters.forEach(matter => {
      // Count by status
      byStatus[matter.status] = (byStatus[matter.status] || 0) + 1;
      
      // Count by matter type
      byMatterType[matter.matterType] = (byMatterType[matter.matterType] || 0) + 1;
      
      // Count by priority
      byPriority[matter.priority] = (byPriority[matter.priority] || 0) + 1;
    });
    
    return {
      total: allMatters.length,
      byStatus,
      byMatterType,
      byPriority,
    };
  }

  /**
   * Archive a matter
   */
  async archive(id: MatterId): Promise<Matter> {
    return this.update(id, { isArchived: true } as Partial<Matter>);
  }

  /**
   * Restore an archived matter
   */
  async restore(id: MatterId): Promise<Matter> {
    return this.update(id, { isArchived: false } as Partial<Matter>);
  }
}

