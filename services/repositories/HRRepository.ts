
import { StaffMember } from '../../types';
import { db, STORES } from '../db';

export const HRRepository = {
    getStaff: async () => db.getAll<StaffMember>(STORES.STAFF),
    getUtilizationMetrics: async () => {
        const staff = await db.getAll<StaffMember>(STORES.STAFF);
        return staff.map(s => ({ name: s.name, role: s.role, utilization: s.utilizationRate, cases: 5 }));
    },
    addStaff: async (staff: StaffMember) => db.put(STORES.STAFF, { ...staff, id: staff.id || crypto.randomUUID() }),
    updateStaff: async (id: string, updates: Partial<StaffMember>) => {
        const current = await db.get<StaffMember>(STORES.STAFF, id);
        if (!current) throw new Error("Staff not found");
        return db.put(STORES.STAFF, { ...current, ...updates });
    },
    deleteStaff: async (id: string) => db.delete(STORES.STAFF, id)
};
