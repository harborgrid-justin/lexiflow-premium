
import { StaffMember, TimeEntry } from '../../types';
import { db, STORES } from '../db';

export const HRRepository = {
    getStaff: async () => {
        // Fetch staff and their time entries to calculate utilization
        const [staff, timeEntries] = await Promise.all([
            db.getAll<StaffMember>(STORES.STAFF),
            db.getAll<TimeEntry>(STORES.BILLING)
        ]);

        return staff.map(s => {
            // Filter entries for this user
            // Note: In real app we'd filter by current year/period
            const userEntries = timeEntries.filter(t => t.userId === s.userId);
            const totalHours = userEntries.reduce((acc, t) => acc + (t.duration / 60), 0);
            
            // Calculate utilization (Billable / Target)
            // Assuming target is annual, normalized for YTD
            const utilization = s.billableTarget > 0 
                ? Math.min(100, Math.round((totalHours / (s.billableTarget / 4)) * 100)) // Divide target by 4 for ~Q1 view
                : 0;

            return {
                ...s,
                currentBillable: Math.round(totalHours),
                utilizationRate: utilization
            };
        });
    },

    getUtilizationMetrics: async () => {
        const staff = await HRRepository.getStaff();
        return staff.map(s => ({ 
            name: s.name, 
            role: s.role, 
            utilization: s.utilizationRate, 
            cases: 5 // Mock case count for now
        }));
    },

    addStaff: async (staff: StaffMember) => db.put(STORES.STAFF, { ...staff, id: staff.id || crypto.randomUUID() }),
    
    updateStaff: async (id: string, updates: Partial<StaffMember>) => {
        const current = await db.get<StaffMember>(STORES.STAFF, id);
        if (!current) throw new Error("Staff not found");
        return db.put(STORES.STAFF, { ...current, ...updates });
    },
    
    deleteStaff: async (id: string) => db.delete(STORES.STAFF, id)
};
