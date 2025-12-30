/**
 * AssetDomain - Asset and equipment management service
 * Provides asset tracking, assignment, and maintenance scheduling
 * ? Migrated to backend API (2025-12-21)
 */

import { delay } from '@/utils/async';
import { STORES, db } from '@/services/data/db';

interface Asset {
  id: string;
  name: string;
  type: 'laptop' | 'phone' | 'tablet' | 'vehicle' | 'equipment' | 'software' | 'other';
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  assignedTo?: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  location?: string;
  metadata?: unknown;
}

interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: 'repair' | 'upgrade' | 'inspection' | 'cleaning';
  description: string;
  performedBy?: string;
  performedAt: string;
  cost?: number;
  nextMaintenanceDate?: string;
}

export const AssetService = {
  getAll: async () => db.getAll(STORES.ASSETS),
  getById: async (id: string) => db.get(STORES.ASSETS, id),
  add: async (item: unknown) => {
    const itemObj = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return db.put(STORES.ASSETS, {
      ...itemObj,
      status: itemObj.status || 'available',
      createdAt: new Date().toISOString()
    });
  },
  update: async (id: string, updates: unknown) => {
    const existing = await db.get(STORES.ASSETS, id);
    return db.put(STORES.ASSETS, {
      ...(existing && typeof existing === 'object' ? existing : {}),
      ...(updates && typeof updates === 'object' ? updates : {})
    });
  },
  delete: async (id: string) => db.delete(STORES.ASSETS, id),
  
  // Asset specific methods
  getAssets: async (filters?: { 
    type?: string; 
    status?: string; 
    assignedTo?: string 
  }): Promise<Asset[]> => {
    let assets = await db.getAll<Asset>(STORES.ASSETS);

    if (filters?.type) {
      assets = assets.filter((a: Asset) => a.type === filters.type);
    }

    if (filters?.status) {
      assets = assets.filter((a: Asset) => a.status === filters.status);
    }

    if (filters?.assignedTo) {
      assets = assets.filter((a: Asset) => a.assignedTo === filters.assignedTo);
    }

    return assets;
  },
  
  assignAsset: async (assetId: string, userId: string): Promise<boolean> => {
    await delay(100);
    try {
      const asset = await db.get<Asset>(STORES.ASSETS, assetId);
      if (!asset) return false;

      if (asset.assignedTo && asset.assignedTo !== userId) {
        console.warn(`[AssetService] Asset ${assetId} already assigned to ${asset.assignedTo}`);
      }

      await db.put(STORES.ASSETS, {
        ...asset,
        assignedTo: userId,
        status: 'in-use' as const,
        assignedAt: new Date().toISOString(),
      });

      console.log(`[AssetService] Assigned asset ${assetId} to user ${userId}`);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  unassignAsset: async (assetId: string): Promise<boolean> => {
    await delay(100);
    try {
      const asset = await db.get(STORES.ASSETS, assetId);
      if (!asset) return false;
      
      await db.put(STORES.ASSETS, {
        ...asset,
        assignedTo: undefined,
        status: 'available',
        unassignedAt: new Date().toISOString(),
      });
      
      console.log(`[AssetService] Unassigned asset ${assetId}`);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  getMaintenanceHistory: async (assetId: string): Promise<MaintenanceRecord[]> => {
    await delay(50);
    // Note: Using MAINTENANCE_TICKETS instead of MAINTENANCE_RECORDS
    const records = await db.getAll<MaintenanceRecord>(STORES.MAINTENANCE_TICKETS);
    return records
      .filter((r: MaintenanceRecord) => r.assetId === assetId)
      .sort((a: MaintenanceRecord, b: MaintenanceRecord) =>
        new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
      );
  },
  
  scheduleMaintenance: async (assetId: string, schedule: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
    const record: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      assetId,
      type: schedule.type || 'inspection',
      description: schedule.description || 'Scheduled maintenance',
      performedBy: schedule.performedBy,
      performedAt: schedule.performedAt || new Date().toISOString(),
      cost: schedule.cost,
      nextMaintenanceDate: schedule.nextMaintenanceDate,
    };

    // Note: Using MAINTENANCE_TICKETS instead of MAINTENANCE_RECORDS
    await db.put(STORES.MAINTENANCE_TICKETS, record);

    // Update asset status
    const asset = await db.get(STORES.ASSETS, assetId);
    if (asset) {
      await db.put(STORES.ASSETS, {
        ...asset,
        status: 'maintenance' as const,
      });
    }

    return record;
  },
};
